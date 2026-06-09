using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Polly;
using Polly.Timeout;
using Polly.CircuitBreaker;
using Polly.Retry;
using backend_api.Data;
using backend_api.Services;
using backend_api.Interfaces;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

namespace backend_api.Extensions
{
    public static class ServiceExtensions
    {
        public static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<TreasuryDbContext>(options =>
            {
                var connectionString = configuration.GetConnectionString("DefaultConnection");
                if (connectionString != null && connectionString.Contains("Host="))
                {
                    options.UseNpgsql(connectionString);
                }
                else
                {
                    options.UseSqlite(connectionString ?? "Data Source=treasury.db");
                }
            });

            return services;
        }

        public static IServiceCollection AddCustomRateLimiting(this IServiceCollection services)
        {
            services.AddRateLimiter(options =>
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

            return services;
        }

        public static IServiceCollection AddTreasuryClient(this IServiceCollection services, IConfiguration configuration)
        {
            var treasuryApiBaseUrl = configuration["TreasuryApi:BaseUrl"] 
                ?? "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/";

            services.AddHttpClient<ITreasuryService, TreasuryService>(client =>
            {
                client.BaseAddress = new Uri(treasuryApiBaseUrl);
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

            return services;
        }

        public static async Task ApplyDatabaseMigrationsAsync(this IApplicationBuilder app)
        {
            int maxRetries = 10;
            for (int i = 0; i < maxRetries; i++)
            {
                try
                {
                    using (var scope = app.ApplicationServices.CreateScope())
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
        }
    }
}
