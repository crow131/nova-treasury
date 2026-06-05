using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Polly;
using Polly.Timeout;
using Polly.CircuitBreaker;
using Polly.Retry;
using backend_api.Data;
using backend_api.Services;
using Scalar.AspNetCore;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using System.Text.Json;
using System.Linq;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Configure EF Core DbContext (Supports Npgsql in Prod/Dev and SQLite in Tests)
builder.Services.AddDbContext<TreasuryDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    if (connectionString != null && connectionString.Contains("Host="))
    {
        options.UseNpgsql(connectionString);
    }
    else
    {
        options.UseSqlite(connectionString ?? "Data Source=treasury.db");
    }
});

// Add Memory Cache
builder.Services.AddMemoryCache();

// Register Health Checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<TreasuryDbContext>("database", tags: new[] { "ready" });

// Register Exception Handler and Problem Details
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// Configure Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter(policyName: "StrictPolicy", fixedOptions =>
    {
        fixedOptions.PermitLimit = 30;
        fixedOptions.Window = TimeSpan.FromSeconds(60);
        fixedOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        fixedOptions.QueueLimit = 0;
    });
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

// Register Resilient Treasury API Client
builder.Services.AddHttpClient<ITreasuryService, TreasuryService>(client =>
{
    client.BaseAddress = new Uri("https://api.fiscaldata.treasury.gov/services/api/fiscal_service/");
    client.Timeout = TimeSpan.FromSeconds(10); // Enforce max timeout of 10 seconds per request
})
.AddResilienceHandler("treasury-pipeline", pipelineBuilder =>
{
    // 1. Retry policy with exponential backoff, jitter, and 429 Retry-After awareness
    pipelineBuilder.AddRetry(new RetryStrategyOptions<HttpResponseMessage>
    {
        ShouldHandle = new PredicateBuilder<HttpResponseMessage>()
            .Handle<HttpRequestException>()
            .Handle<TimeoutRejectedException>()
            .HandleResult(res => res.StatusCode == HttpStatusCode.TooManyRequests
                              || (int)res.StatusCode >= 500),
        MaxRetryAttempts = 3,
        BackoffType = DelayBackoffType.Exponential,
        Delay = TimeSpan.FromSeconds(2),
        UseJitter = true,
        DelayGenerator = args =>
        {
            if (args.Outcome.Result?.StatusCode == HttpStatusCode.TooManyRequests &&
                args.Outcome.Result.Headers.RetryAfter is { } retryAfter)
            {
                if (retryAfter.Delta.HasValue)
                {
                    return new ValueTask<TimeSpan?>(retryAfter.Delta.Value);
                }
                if (retryAfter.Date.HasValue)
                {
                    return new ValueTask<TimeSpan?>(retryAfter.Date.Value - DateTimeOffset.UtcNow);
                }
            }
            return new ValueTask<TimeSpan?>(default(TimeSpan?)); // fallback to normal backoff
        }
    });

    // 2. Circuit Breaker policy
    pipelineBuilder.AddCircuitBreaker(new CircuitBreakerStrategyOptions<HttpResponseMessage>
    {
        ShouldHandle = new PredicateBuilder<HttpResponseMessage>()
            .Handle<HttpRequestException>()
            .Handle<TimeoutRejectedException>()
            .HandleResult(res => res.StatusCode == HttpStatusCode.TooManyRequests
                              || (int)res.StatusCode >= 500),
        FailureRatio = 0.5,
        SamplingDuration = TimeSpan.FromSeconds(30),
        MinimumThroughput = 5,
        BreakDuration = TimeSpan.FromSeconds(30)
    });

    // 3. Timeout policy per individual HTTP request
    pipelineBuilder.AddTimeout(TimeSpan.FromSeconds(10));
});

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Apply migrations automatically on startup with retry logic (dynamic for PG vs SQLite)
int maxRetries = 10;
for (int i = 0; i < maxRetries; i++)
{
    try
    {
        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<TreasuryDbContext>();
            if (db.Database.ProviderName == "Microsoft.EntityFrameworkCore.Sqlite")
            {
                await db.Database.EnsureCreatedAsync();
            }
            else
            {
                await db.Database.MigrateAsync();
            }
        }
        Console.WriteLine("Database setup completed successfully.");
        break;
    }
    catch (Exception ex)
    {
        if (i == maxRetries - 1)
        {
            Console.WriteLine("Maximum database migration retries exceeded. Exiting.");
            throw;
        }
        Console.WriteLine($"Database migration failed, retrying in 3 seconds... ({i + 1}/{maxRetries}) - Error: {ex.Message}");
        await Task.Delay(3000);
    }
}

// Configure the HTTP request pipeline.
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.WithTitle("Nova Treasury Card & Transaction API")
               .WithTheme(ScalarTheme.DeepSpace)
               .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient);
    });
}

app.UseRouting();

app.UseCors("AllowFrontend");

app.UseRateLimiter();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false
});

var readyHealthCheckOptions = new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready"),
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var response = new
        {
            status = report.Status.ToString(),
            duration = report.TotalDuration.TotalMilliseconds + "ms",
            checks = report.Entries.Select(entry => new
            {
                key = entry.Key,
                status = entry.Value.Status.ToString(),
                description = entry.Value.Description,
                duration = entry.Value.Duration.TotalMilliseconds + "ms",
                error = entry.Value.Exception?.Message
            })
        };
        await context.Response.WriteAsync(JsonSerializer.Serialize(response, new JsonSerializerOptions { WriteIndented = true }));
    }
};

app.MapHealthChecks("/health/ready", readyHealthCheckOptions);
app.MapHealthChecks("/health", readyHealthCheckOptions);

app.MapControllers();

app.Run();

public partial class Program { }
