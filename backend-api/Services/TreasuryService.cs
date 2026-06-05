using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace backend_api.Services
{
    public class TreasuryService : ITreasuryService
    {
        private readonly HttpClient _httpClient;
        private readonly IMemoryCache _cache;
        private readonly ILogger<TreasuryService> _logger;

        private static readonly Dictionary<string, string> IsoToTreasuryName = new(StringComparer.OrdinalIgnoreCase)
        {
            { "EUR", "Germany-Euro" },
            { "GBP", "United Kingdom-Pound" },
            { "JPY", "Japan-Yen" },
            { "CAD", "Canada-Dollar" },
            { "AUD", "Australia-Dollar" }
        };

        public TreasuryService(HttpClient httpClient, IMemoryCache cache, ILogger<TreasuryService> logger)
        {
            _httpClient = httpClient;
            _cache = cache;
            _logger = logger;
        }

        public async Task<decimal?> GetExchangeRateWithLookbackAsync(string targetCurrency, DateTime transactionDate)
        {
            if (string.Equals(targetCurrency, "USD", StringComparison.OrdinalIgnoreCase))
            {
                return 1.0m;
            }

            if (!IsoToTreasuryName.TryGetValue(targetCurrency, out var treasuryDesc))
            {
                _logger.LogWarning("Unsupported target currency code requested: {Currency}", targetCurrency);
                return null;
            }

            var cacheKey = $"lookback_{targetCurrency}_{transactionDate:yyyyMMdd}";
            if (_cache.TryGetValue<decimal?>(cacheKey, out var cachedRate))
            {
                return cachedRate;
            }

            // Lookback window: from 6 months prior to transaction date
            var startDate = transactionDate.AddMonths(-6).ToString("yyyy-MM-dd");
            var endDate = transactionDate.ToString("yyyy-MM-dd");

            // Build query: filter=record_date:gte:{startDate},record_date:lte:{endDate},country_currency_desc:eq:{treasuryDesc}
            // Note: We avoid "sort=-record_date" because it causes timeout issues on the Treasury API server.
            var url = $"v1/accounting/od/rates_of_exchange?filter=record_date:gte:{startDate},record_date:lte:{endDate},country_currency_desc:eq:{treasuryDesc}";

            try
            {
                var response = await _httpClient.GetFromJsonAsync<TreasuryApiResponse>(url);
                if (response?.Data == null || response.Data.Count == 0)
                {
                    _logger.LogWarning("No exchange rates found in the 6-month window for {Currency} (Transaction Date: {TxDate})", targetCurrency, endDate);
                    
                    // Cache negative result for 1 hour to prevent API hammering
                    _cache.Set(cacheKey, (decimal?)null, TimeSpan.FromHours(1));
                    return null;
                }

                // Sort descending in C# memory by RecordDate to get the rate closest to the transaction date
                var latestRecord = response.Data
                    .Select(r => new { RecordDate = DateTime.Parse(r.RecordDate), Rate = r.ExchangeRate })
                    .OrderByDescending(r => r.RecordDate)
                    .FirstOrDefault();

                if (latestRecord == null)
                {
                    _cache.Set(cacheKey, (decimal?)null, TimeSpan.FromHours(1));
                    return null;
                }

                if (!decimal.TryParse(latestRecord.Rate, out var rate))
                {
                    _logger.LogError("Failed to parse exchange rate value: {Rate}", latestRecord.Rate);
                    return null;
                }

                // Cache the rate for 24 hours
                _cache.Set(cacheKey, (decimal?)rate, TimeSpan.FromHours(24));
                return rate;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while querying Treasury API for currency: {Currency}", targetCurrency);
                throw;
            }
        }

        public async Task<decimal?> GetLatestExchangeRateAsync(string targetCurrency)
        {
            if (string.Equals(targetCurrency, "USD", StringComparison.OrdinalIgnoreCase))
            {
                return 1.0m;
            }

            if (!IsoToTreasuryName.TryGetValue(targetCurrency, out var treasuryDesc))
            {
                _logger.LogWarning("Unsupported target currency code requested: {Currency}", targetCurrency);
                return null;
            }

            var cacheKey = $"latest_{targetCurrency}";
            if (_cache.TryGetValue<decimal?>(cacheKey, out var cachedRate))
            {
                return cachedRate;
            }

            // To get the latest rate, fetch records from the last 12 months to guarantee we get a quarterly published rate
            var startDate = DateTime.UtcNow.AddMonths(-12).ToString("yyyy-MM-dd");

            var url = $"v1/accounting/od/rates_of_exchange?filter=record_date:gte:{startDate},country_currency_desc:eq:{treasuryDesc}";

            try
            {
                var response = await _httpClient.GetFromJsonAsync<TreasuryApiResponse>(url);
                if (response?.Data == null || response.Data.Count == 0)
                {
                    _logger.LogWarning("No recent exchange rates found for {Currency}", targetCurrency);
                    _cache.Set(cacheKey, (decimal?)null, TimeSpan.FromHours(1));
                    return null;
                }

                // Find the latest in memory
                var latestRecord = response.Data
                    .Select(r => new { RecordDate = DateTime.Parse(r.RecordDate), Rate = r.ExchangeRate })
                    .OrderByDescending(r => r.RecordDate)
                    .FirstOrDefault();

                if (latestRecord == null || !decimal.TryParse(latestRecord.Rate, out var rate))
                {
                    _cache.Set(cacheKey, (decimal?)null, TimeSpan.FromHours(1));
                    return null;
                }

                // Cache latest rate for 2 hours (quarterly rates don't change often)
                _cache.Set(cacheKey, (decimal?)rate, TimeSpan.FromHours(2));
                return rate;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while querying latest exchange rate for {Currency}", targetCurrency);
                throw;
            }
        }
    }

    public class TreasuryApiResponse
    {
        [JsonPropertyName("data")]
        public List<TreasuryRateRow> Data { get; set; } = new();
    }

    public class TreasuryRateRow
    {
        [JsonPropertyName("record_date")]
        public string RecordDate { get; set; } = string.Empty;

        [JsonPropertyName("country_currency_desc")]
        public string CountryCurrencyDesc { get; set; } = string.Empty;

        [JsonPropertyName("exchange_rate")]
        public string ExchangeRate { get; set; } = string.Empty;
    }
}
