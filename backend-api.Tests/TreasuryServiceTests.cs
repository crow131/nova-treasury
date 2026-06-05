using System;
using System.Net;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Moq;
using Moq.Protected;
using Xunit;
using backend_api.Services;

namespace backend_api.Tests
{
    public class TreasuryServiceTests
    {
        private readonly Mock<IMemoryCache> _mockCache;
        private readonly Mock<ILogger<TreasuryService>> _mockLogger;

        public TreasuryServiceTests()
        {
            _mockCache = new Mock<IMemoryCache>();
            _mockLogger = new Mock<ILogger<TreasuryService>>();

            // Setup mock cache to always return false (cache miss) for tests
            object? dummyOut;
            _mockCache
                .Setup(c => c.TryGetValue(It.IsAny<object>(), out dummyOut))
                .Returns(false);

            // Mock cache entry creation
            var mockCacheEntry = new Mock<ICacheEntry>();
            _mockCache
                .Setup(c => c.CreateEntry(It.IsAny<object>()))
                .Returns(mockCacheEntry.Object);
        }

        private HttpClient CreateMockHttpClient(string jsonResponse, HttpStatusCode statusCode = HttpStatusCode.OK)
        {
            var mockHandler = new Mock<HttpMessageHandler>(MockBehavior.Strict);
            mockHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = statusCode,
                    Content = new StringContent(jsonResponse)
                });

            return new HttpClient(mockHandler.Object)
            {
                BaseAddress = new Uri("https://api.fiscaldata.treasury.gov/services/api/fiscal_service/")
            };
        }

        [Fact]
        public async Task GetExchangeRateWithLookback_ShouldReturnCorrectRateClosestToTransactionDate()
        {
            // Arrange
            // Target transaction date: Oct 24, 2023. Lookback window: Apr 24, 2023 to Oct 24, 2023
            // Mock API returns rates in this window
            var mockData = new TreasuryApiResponse
            {
                Data = new System.Collections.Generic.List<TreasuryRateRow>
                {
                    new() { RecordDate = "2023-03-31", CountryCurrencyDesc = "Germany-Euro", ExchangeRate = "0.92" },
                    new() { RecordDate = "2023-06-30", CountryCurrencyDesc = "Germany-Euro", ExchangeRate = "0.91" },
                    new() { RecordDate = "2023-09-30", CountryCurrencyDesc = "Germany-Euro", ExchangeRate = "0.90" }
                }
            };
            var json = JsonSerializer.Serialize(mockData);
            var httpClient = CreateMockHttpClient(json);
            var service = new TreasuryService(httpClient, _mockCache.Object, _mockLogger.Object);

            // Act
            var rate = await service.GetExchangeRateWithLookbackAsync("EUR", new DateTime(2023, 10, 24));

            // Assert
            Assert.NotNull(rate);
            Assert.Equal(0.90m, rate);
        }

        [Fact]
        public async Task GetExchangeRateWithLookback_ShouldReturnNullIfNoRatesInPrior6Months()
        {
            // Arrange
            // Transaction date: Oct 24, 2023. 6 months lookback: Apr 24, 2023
            // Mock API returns only old rate from 2022-09-30 (which is > 6 months ago)
            var mockData = new TreasuryApiResponse
            {
                Data = new System.Collections.Generic.List<TreasuryRateRow>()
            };
            var json = JsonSerializer.Serialize(mockData);
            var httpClient = CreateMockHttpClient(json);
            var service = new TreasuryService(httpClient, _mockCache.Object, _mockLogger.Object);

            // Act
            var rate = await service.GetExchangeRateWithLookbackAsync("EUR", new DateTime(2023, 10, 24));

            // Assert
            Assert.Null(rate);
        }

        [Fact]
        public async Task GetLatestExchangeRate_ShouldReturnLatestAvailableRate()
        {
            // Arrange
            var mockData = new TreasuryApiResponse
            {
                Data = new System.Collections.Generic.List<TreasuryRateRow>
                {
                    new() { RecordDate = "2024-03-31", CountryCurrencyDesc = "Germany-Euro", ExchangeRate = "0.92" },
                    new() { RecordDate = "2024-06-30", CountryCurrencyDesc = "Germany-Euro", ExchangeRate = "0.94" }
                }
            };
            var json = JsonSerializer.Serialize(mockData);
            var httpClient = CreateMockHttpClient(json);
            var service = new TreasuryService(httpClient, _mockCache.Object, _mockLogger.Object);

            // Act
            var rate = await service.GetLatestExchangeRateAsync("EUR");

            // Assert
            Assert.NotNull(rate);
            Assert.Equal(0.94m, rate);
        }
    }
}
