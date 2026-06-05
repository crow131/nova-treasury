using System;
using System.Threading.Tasks;

namespace backend_api.Interfaces
{
    public interface ITreasuryService
    {
        /// <summary>
        /// Retrieves the exchange rate for a target currency on or before the transaction date,
        /// looking back up to 6 months. Returns null if no rate is found.
        /// </summary>
        Task<decimal?> GetExchangeRateWithLookbackAsync(string targetCurrency, DateTime transactionDate);

        /// <summary>
        /// Retrieves the latest available exchange rate for a target currency.
        /// Returns null if no rate is found.
        /// </summary>
        Task<decimal?> GetLatestExchangeRateAsync(string targetCurrency);
    }
}
