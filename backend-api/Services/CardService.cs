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
    public class CardService : ICardService
    {
        private readonly TreasuryDbContext _context;
        private readonly ITreasuryService _treasuryService;

        public CardService(TreasuryDbContext context, ITreasuryService treasuryService)
        {
            _context = context;
            _treasuryService = treasuryService;
        }

        public async Task<IEnumerable<Card>> GetCardsAsync()
        {
            return await _context.Cards
                .AsNoTracking()
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<Card> GetCardByIdAsync(Guid id)
        {
            var card = await _context.Cards
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id);
            if (card == null)
            {
                throw new NotFoundException($"Card with ID '{id}' was not found in the portfolio.");
            }
            return card;
        }

        public async Task<Card> CreateCardAsync(CreateCardRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Holder))
            {
                throw new BusinessRuleException("Cardholder name is required.");
            }

            if (request.Limit <= 0)
            {
                throw new BusinessRuleException("Credit limit must be a positive decimal number.");
            }

            // Generate random 16-digit card number and last 4
            var random = new Random();
            var bodyDigits = string.Join("", Enumerable.Range(0, 12).Select(_ => random.Next(0, 10).ToString()));
            var last4 = random.Next(1000, 10000).ToString();
            var fullNumber = $"{last4.Substring(0, 2)}{bodyDigits.Substring(0, 2)} {bodyDigits.Substring(2, 4)} {bodyDigits.Substring(6, 4)} {bodyDigits.Substring(10, 2)}{last4.Substring(2, 2)}";

            // Default expires to 5 years from now
            var expiresMonth = DateTime.Today.Month.ToString("D2");
            var expiresYear = (DateTime.Today.Year % 100 + 5).ToString("D2");
            var expires = $"{expiresMonth}/{expiresYear}";

            var card = new Card
            {
                Id = Guid.NewGuid(),
                Holder = request.Holder,
                Limit = request.Limit,
                Spent = 0.00m,
                CardType = string.IsNullOrWhiteSpace(request.CardType) ? "Physical" : request.CardType,
                RelativeBg = string.IsNullOrWhiteSpace(request.RelativeBg) ? "#0F172A" : request.RelativeBg,
                Last4 = last4,
                FullNumber = fullNumber,
                Expires = expires,
                Status = "ACTIVE",
                CreatedAt = DateTime.UtcNow
            };

            _context.Cards.Add(card);
            await _context.SaveChangesAsync();

            return card;
        }

        public async Task UpdateLimitAsync(Guid id, decimal newLimit)
        {
            if (newLimit <= 0)
            {
                throw new BusinessRuleException("New credit limit must be a positive decimal number.");
            }

            var card = await _context.Cards.FindAsync(id);
            if (card == null)
            {
                throw new NotFoundException($"Card with ID '{id}' was not found.");
            }

            card.Limit = newLimit;
            await _context.SaveChangesAsync();
        }

        public async Task<Card> ToggleStatusAsync(Guid id)
        {
            var card = await _context.Cards.FindAsync(id);
            if (card == null)
            {
                throw new NotFoundException($"Card with ID '{id}' was not found.");
            }

            card.Status = card.Status == "ACTIVE" ? "LOCKED" : "ACTIVE";
            await _context.SaveChangesAsync();

            return card;
        }

        public async Task<CardBalanceResponse> GetConvertedBalanceAsync(Guid id, string currency)
        {
            var card = await _context.Cards
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id);
            if (card == null)
            {
                throw new NotFoundException($"Card with ID '{id}' was not found.");
            }

            var availableBalanceUsd = card.Limit - card.Spent;
            decimal rateUsed = 1.0m;
            decimal convertedBalance = availableBalanceUsd;

            if (!string.Equals(currency, "USD", StringComparison.OrdinalIgnoreCase))
            {
                var rate = await _treasuryService.GetLatestExchangeRateAsync(currency);
                if (rate == null)
                {
                    throw new BusinessRuleException($"The currency code '{currency}' is either unsupported or no active rates could be retrieved from the U.S. Treasury API.");
                }
                rateUsed = rate.Value;
                convertedBalance = availableBalanceUsd * rateUsed;
            }

            return new CardBalanceResponse
            {
                CardId = card.Id,
                Holder = card.Holder,
                Last4 = card.Last4,
                Limit = card.Limit,
                SpentUsd = card.Spent,
                AvailableBalanceUsd = availableBalanceUsd,
                TargetCurrency = currency.ToUpperInvariant(),
                ExchangeRateUsed = rateUsed,
                ConvertedAvailableBalance = convertedBalance
            };
        }
    }
}
