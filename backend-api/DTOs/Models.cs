using System;

namespace backend_api.DTOs
{
    public class CreateCardRequest
    {
        public string Holder { get; set; } = string.Empty;
        public decimal Limit { get; set; }
        public string CardType { get; set; } = "Physical"; // Virtual, Physical, Platinum
        public string? RelativeBg { get; set; }
    }

    public class CreateTransactionRequest
    {
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; } // negative for expense, positive for funding
        public string CardLast4 { get; set; } = string.Empty;
        public string Category { get; set; } = "Office Supplies";
        public string Entity { get; set; } = string.Empty;
        public DateTime? Date { get; set; }
    }

    public class ConvertedTransactionResponse
    {
        public string Id { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty; // e.g. "Oct 24, 2023"
        public decimal Amount { get; set; }
        public string CardLast4 { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Entity { get; set; } = string.Empty;
        public string OriginalCurrency { get; set; } = "USD";
        public string TargetCurrency { get; set; } = "USD";
        public decimal ExchangeRateUsed { get; set; } = 1.0m;
        public decimal ConvertedAmount { get; set; }
    }

    public class CardBalanceResponse
    {
        public Guid CardId { get; set; }
        public string Holder { get; set; } = string.Empty;
        public string Last4 { get; set; } = string.Empty;
        public decimal Limit { get; set; }
        public decimal SpentUsd { get; set; }
        public decimal AvailableBalanceUsd { get; set; }
        public string TargetCurrency { get; set; } = "USD";
        public decimal ExchangeRateUsed { get; set; } = 1.0m;
        public decimal ConvertedAvailableBalance { get; set; }
    }
}
