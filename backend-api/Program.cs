using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Http;
using backend_api.Data;
using backend_api.Services;
using backend_api.Interfaces;
using backend_api.Extensions;
using Scalar.AspNetCore;

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
builder.Services.AddDatabase(builder.Configuration);

// Add Memory Cache
builder.Services.AddMemoryCache();

// Register Services
builder.Services.AddScoped<ICardService, CardService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();

// Register Health Checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<TreasuryDbContext>("database", tags: new[] { "ready" });

// Register Exception Handler and Problem Details
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// Configure Rate Limiting
builder.Services.AddCustomRateLimiting();

// Register Resilient Treasury API Client
builder.Services.AddTreasuryClient(builder.Configuration);

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Apply migrations automatically on startup with retry logic (dynamic for PG vs SQLite)
await app.ApplyDatabaseMigrationsAsync();

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

app.MapGet("/health/live", () => Results.Ok(new { status = "Healthy" }))
.WithName("GetLiveness")
.WithTags("Health Checks")
.WithSummary("Liveness Probe")
.WithDescription("Verifies if the application container and runtime process are active.");

async Task<IResult> ReadyHandler(HealthCheckService healthCheckService)
{
    var report = await healthCheckService.CheckHealthAsync(check => check.Tags.Contains("ready"));
    var statusCode = report.Status == HealthStatus.Healthy ? StatusCodes.Status200OK : StatusCodes.Status503ServiceUnavailable;
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
    return Results.Json(response, statusCode: statusCode, contentType: "application/json");
}

app.MapGet("/health/ready", ReadyHandler)
.WithName("GetReadiness")
.WithTags("Health Checks")
.WithSummary("Readiness Probe")
.WithDescription("Checks the connectivity and migration status of the PostgreSQL database.");

app.MapGet("/health", ReadyHandler)
.WithName("GetHealth")
.WithTags("Health Checks")
.WithSummary("Health Status (Alias)")
.WithDescription("Alias for the readiness probe checking database connection status.");

app.MapControllers();

app.Run();

public partial class Program { }
