using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Xunit;
using backend_api.Data;
using backend_api.Domain;
using backend_api.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend_api.Tests
{
    public class IntegrationTests : IClassFixture<WebApplicationFactory<Program>>, IDisposable
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly SqliteConnection _connection;
        private readonly Mock<ITreasuryService> _mockTreasuryService;
        private readonly Guid _testCardId = Guid.NewGuid();

        public IntegrationTests(WebApplicationFactory<Program> factory)
        {
            _connection = new SqliteConnection("Filename=:memory:");
            _connection.Open();

            _mockTreasuryService = new Mock<ITreasuryService>();

            _factory = factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureAppConfiguration((context, config) =>
                {
                    config.AddInMemoryCollection(new Dictionary<string, string?>
                    {
                        { "ConnectionStrings:DefaultConnection", "DataSource=:memory:" }
                    });
                });

                builder.ConfigureTestServices(services =>
                {
                    // Remove existing DbContext registrations
                    var dbContextOptionsDescriptor = services.SingleOrDefault(
                        d => d.ServiceType == typeof(DbContextOptions<TreasuryDbContext>));
                    if (dbContextOptionsDescriptor != null)
                    {
                        services.Remove(dbContextOptionsDescriptor);
                    }

                    var dbContextDescriptor = services.SingleOrDefault(
                        d => d.ServiceType == typeof(TreasuryDbContext));
                    if (dbContextDescriptor != null)
                    {
                        services.Remove(dbContextDescriptor);
                    }

                    // Register SQLite in-memory
                    services.AddDbContext<TreasuryDbContext>(options =>
                    {
                        options.UseSqlite(_connection);
                    });

                    // Replace ITreasuryService registration
                    var treasuryServiceDescriptor = services.SingleOrDefault(
                        d => d.ServiceType == typeof(ITreasuryService));
                    if (treasuryServiceDescriptor != null)
                    {
                        services.Remove(treasuryServiceDescriptor);
                    }
                    services.AddSingleton<ITreasuryService>(_mockTreasuryService.Object);
                });
            });

            // Initialize DB schema and seed a card
            using (var scope = _factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<TreasuryDbContext>();
                db.Database.EnsureCreated();

                db.Cards.Add(new Card
                {
                    Id = _testCardId,
                    Holder = "Integration Test Holder",
                    Limit = 5000m,
                    Spent = 100m,
                    Last4 = "1234",
                    FullNumber = "1234 1234 1234 1234",
                    Expires = "12/30",
                    Status = "ACTIVE",
                    CreatedAt = DateTime.UtcNow
                });
                db.SaveChanges();
            }
        }

        public void Dispose()
        {
            _connection.Dispose();
        }

        [Fact]
        public async Task HealthLive_ShouldReturnHealthy()
        {
            // Arrange
            var client = _factory.CreateClient();

            // Act
            var response = await client.GetAsync("/health/live");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var content = await response.Content.ReadAsStringAsync();
            Assert.Contains("Healthy", content);
        }

        [Fact]
        public async Task HealthReady_ShouldReturnHealthyAndJson()
        {
            // Arrange
            var client = _factory.CreateClient();

            // Act
            var response = await client.GetAsync("/health/ready");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var content = await response.Content.ReadAsStringAsync();
            Assert.Contains("Healthy", content);
            Assert.Contains("database", content);
        }

        [Fact]
        public async Task GlobalExceptionHandler_ShouldCatchUnhandledExceptions_AndReturnProblemDetails()
        {
            // Arrange
            var client = _factory.CreateClient();

            // Mock service to throw exception
            _mockTreasuryService
                .Setup(s => s.GetLatestExchangeRateAsync("EUR"))
                .ThrowsAsync(new InvalidOperationException("US Treasury API simulation failed dramatically."));

            // Act
            var response = await client.GetAsync($"/api/cards/{_testCardId}/balance?currency=EUR");

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
            
            var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>();
            Assert.NotNull(problem);
            Assert.Equal(500, problem.Status);
            Assert.Equal("Internal Server Error", problem.Title);
            Assert.Contains("An unexpected error occurred during processing", problem.Detail);
            Assert.Equal($"/api/cards/{_testCardId}/balance", problem.Instance);
        }

        [Fact]
        public async Task RateLimiter_ShouldReturn429_WhenThresholdExceeded()
        {
            // Arrange
            var client = _factory.CreateClient();

            // The StrictPolicy allows 30 requests per minute with a QueueLimit of 2.
            // Sending 35 rapid requests should trigger a 429.
            bool hitRateLimit = false;

            for (int i = 0; i < 35; i++)
            {
                var response = await client.GetAsync("/api/cards");
                if (response.StatusCode == HttpStatusCode.TooManyRequests)
                {
                    hitRateLimit = true;
                    break;
                }
            }

            // Assert
            Assert.True(hitRateLimit, "Expected rate limit (429) to be triggered after rapid request burst.");
        }
    }
}
