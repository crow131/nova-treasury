using System;

namespace backend_api.Domain
{
    public class Card
    {
        public Guid Id { get; set; }
        public string Last4 { get; set; } = string.Empty;
        public string FullNumber { get; set; } = string.Empty;
        public string Holder { get; set; } = string.Empty;
        public decimal Limit { get; set; }
        public decimal Spent { get; set; }
        public string Expires { get; set; } = string.Empty;
        public string Status { get; set; } = "ACTIVE"; // ACTIVE | LOCKED
        public string CardType { get; set; } = "Physical"; // Virtual | Physical | Platinum
        public string RelativeBg { get; set; } = "#0F172A";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class Transaction
    {
        public string Id { get; set; } = string.Empty; // e.g., #TRX-99210
        public string Description { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public decimal Amount { get; set; }
        public string CardLast4 { get; set; } = string.Empty;
        public string Status { get; set; } = "Cleared"; // Cleared | Pending | Flagged | Success
        public string Category { get; set; } = "Office Supplies";
        public string Entity { get; set; } = string.Empty;
        public string OriginalCurrency { get; set; } = "USD";
    }
}
