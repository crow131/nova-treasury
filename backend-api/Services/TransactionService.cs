using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using backend_api.Data;
using backend_api.Domain;
using backend_api.DTOs;
using backend_api.Interfaces;

namespace backend_api.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly TreasuryDbContext _context;
        private readonly ITreasuryService _treasuryService;

        public TransactionService(TreasuryDbContext context, ITreasuryService treasuryService)
        {
            _context = context;
            _treasuryService = treasuryService;
        }

        public async Task<IEnumerable<ConvertedTransactionResponse>> GetTransactionsAsync(Guid? cardId, string currency)
        {
            var query = _context.Transactions.AsNoTracking().AsQueryable();

            if (cardId.HasValue)
            {
                var card = await _context.Cards
                    .AsNoTracking()
                    .FirstOrDefaultAsync(c => c.Id == cardId.Value);
                if (card == null)
                {
                    throw new NotFoundException($"Card with ID '{cardId}' was not found.");
                }
                query = query.Where(t => t.CardLast4 == card.Last4);
            }

            var transactions = await query
                .OrderByDescending(t => t.Date)
                .ToListAsync();

            var responseList = new List<ConvertedTransactionResponse>();

            foreach (var tx in transactions)
            {
                decimal rateUsed = 1.0m;
                decimal convertedAmount = tx.Amount;

                if (!string.Equals(currency, "USD", StringComparison.OrdinalIgnoreCase))
                {
                    var rate = await _treasuryService.GetExchangeRateWithLookbackAsync(currency, tx.Date);
                    if (rate == null)
                    {
                        throw new BusinessRuleException($"Transaction '{tx.Id}' dated {tx.Date:yyyy-MM-dd} cannot be converted to {currency} because no exchange rate was published within the 6-month lookback window prior to the purchase date.");
                    }
                    rateUsed = rate.Value;
                    convertedAmount = tx.Amount * rateUsed;
                }

                responseList.Add(new ConvertedTransactionResponse
                {
                    Id = tx.Id,
                    Description = tx.Description,
                    Date = tx.Date.ToString("MMM dd, yyyy"), // Match frontend format: e.g. "Oct 24, 2023"
                    Amount = tx.Amount,
                    CardLast4 = tx.CardLast4,
                    Status = tx.Status,
                    Category = tx.Category,
                    Entity = tx.Entity,
                    OriginalCurrency = tx.OriginalCurrency,
                    TargetCurrency = currency.ToUpperInvariant(),
                    ExchangeRateUsed = rateUsed,
                    ConvertedAmount = convertedAmount
                });
            }

            return responseList;
        }

        public async Task<Transaction> RecordTransactionAsync(CreateTransactionRequest request)
        {
            // Validations
            if (string.IsNullOrWhiteSpace(request.Description))
            {
                throw new BusinessRuleException("Transaction description is required.");
            }

            if (request.Amount == 0)
            {
                throw new BusinessRuleException("Transaction amount cannot be zero.");
            }

            if (string.IsNullOrWhiteSpace(request.CardLast4) || request.CardLast4.Length != 4)
            {
                throw new BusinessRuleException("A valid 4-digit card identifier (Last4) is required.");
            }

            var txDate = request.Date ?? DateTime.UtcNow;
            if (txDate > DateTime.UtcNow.AddMinutes(5)) // Allow tiny time-drift
            {
                throw new BusinessRuleException("Transaction date cannot be set in the future.");
            }

            // Find matching active/locked card
            var card = await _context.Cards.FirstOrDefaultAsync(c => c.Last4 == request.CardLast4);
            if (card == null)
            {
                throw new NotFoundException($"No corporate credit card matching last 4 digits '{request.CardLast4}' could be located.");
            }

            // Reject if locked
            if (string.Equals(card.Status, "LOCKED", StringComparison.OrdinalIgnoreCase))
            {
                throw new BusinessRuleException($"The corporate credit card ending in *{request.CardLast4} is currently frozen/locked.");
            }

            // Check credit limit if it is a payment (amount < 0)
            if (request.Amount < 0)
            {
                var paymentCost = Math.Abs(request.Amount);
                var availableBalance = card.Limit - card.Spent;
                if (paymentCost > availableBalance)
                {
                    throw new BusinessRuleException($"Insufficient funds on card ending in *{request.CardLast4}. Purchase cost: ${paymentCost:F2}, Available balance: ${availableBalance:F2}.");
                }

                // Update spent amount
                card.Spent += paymentCost;
            }
            else
            {
                // Deposit/funding: reduces the spent ledger
                card.Spent -= request.Amount;
            }

            // Create Transaction record
            var random = new Random();
            var txId = $"#TRX-{random.Next(10000, 100000)}";

            var transaction = new Transaction
            {
                Id = txId,
                Description = request.Description,
                Date = DateTime.SpecifyKind(txDate, DateTimeKind.Utc),
                Amount = request.Amount,
                CardLast4 = request.CardLast4,
                Status = "Cleared", // default to Cleared
                Category = string.IsNullOrWhiteSpace(request.Category) ? "Office Supplies" : request.Category,
                Entity = string.IsNullOrWhiteSpace(request.Entity) ? "Nova Ledger" : request.Entity,
                OriginalCurrency = "USD"
            };

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return transaction;
        }
    }
}
