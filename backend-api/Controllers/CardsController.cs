using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.RateLimiting;
using backend_api.Data;
using backend_api.Domain;
using backend_api.DTOs;
using backend_api.Services;

namespace backend_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("StrictPolicy")]
    public class CardsController : ControllerBase
    {
        private readonly TreasuryDbContext _context;
        private readonly ITreasuryService _treasuryService;

        public CardsController(TreasuryDbContext context, ITreasuryService treasuryService)
        {
            _context = context;
            _treasuryService = treasuryService;
        }

        // GET: api/cards
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Card>>> GetCards()
        {
            var cards = await _context.Cards
                .AsNoTracking()
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();
            return Ok(cards);
        }

        // GET: api/cards/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Card>> GetCard(Guid id)
        {
            var card = await _context.Cards
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id);
            if (card == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Card Not Found",
                    Detail = $"Card with ID '{id}' was not found in the portfolio."
                });
            }
            return Ok(card);
        }

        // POST: api/cards
        [HttpPost]
        public async Task<ActionResult<Card>> CreateCard([FromBody] CreateCardRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Holder))
            {
                return BadRequest(new ProblemDetails
                {
                    Status = 400,
                    Title = "Invalid Input",
                    Detail = "Cardholder name is required."
                });
            }

            if (request.Limit <= 0)
            {
                return BadRequest(new ProblemDetails
                {
                    Status = 400,
                    Title = "Invalid Input",
                    Detail = "Credit limit must be a positive decimal number."
                });
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

            return CreatedAtAction(nameof(GetCard), new { id = card.Id }, card);
        }

        // PUT: api/cards/{id}/limit
        [HttpPut("{id}/limit")]
        public async Task<IActionResult> UpdateLimit(Guid id, [FromBody] decimal newLimit)
        {
            if (newLimit <= 0)
            {
                return BadRequest(new ProblemDetails
                {
                    Status = 400,
                    Title = "Invalid Input",
                    Detail = "New credit limit must be a positive decimal number."
                });
            }

            var card = await _context.Cards.FindAsync(id);
            if (card == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Card Not Found",
                    Detail = $"Card with ID '{id}' was not found."
                });
            }

            card.Limit = newLimit;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/cards/{id}/toggle-status
        [HttpPost("{id}/toggle-status")]
        public async Task<IActionResult> ToggleStatus(Guid id)
        {
            var card = await _context.Cards.FindAsync(id);
            if (card == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Card Not Found",
                    Detail = $"Card with ID '{id}' was not found."
                });
            }

            card.Status = card.Status == "ACTIVE" ? "LOCKED" : "ACTIVE";
            await _context.SaveChangesAsync();

            return Ok(new { card.Id, card.Status });
        }

        // GET: api/cards/{id}/balance
        [HttpGet("{id}/balance")]
        public async Task<ActionResult<CardBalanceResponse>> GetConvertedBalance(Guid id, [FromQuery] string currency = "USD")
        {
            var card = await _context.Cards
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id);
            if (card == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = 404,
                    Title = "Card Not Found",
                    Detail = $"Card with ID '{id}' was not found."
                });
            }

            // Available Balance = Limit - Spent
            var availableBalanceUsd = card.Limit - card.Spent;

            decimal rateUsed = 1.0m;
            decimal convertedBalance = availableBalanceUsd;

            if (!string.Equals(currency, "USD", StringComparison.OrdinalIgnoreCase))
            {
                var rate = await _treasuryService.GetLatestExchangeRateAsync(currency);
                if (rate == null)
                {
                    return BadRequest(new ProblemDetails
                    {
                        Status = 400,
                        Type = "https://fiscaldata.treasury.gov/errors/unsupported-currency",
                        Title = "Unsupported Currency",
                        Detail = $"The currency code '{currency}' is either unsupported or no active rates could be retrieved from the U.S. Treasury API."
                    });
                }
                rateUsed = rate.Value;
                convertedBalance = availableBalanceUsd * rateUsed;
            }

            var response = new CardBalanceResponse
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

            return Ok(response);
        }
    }
}
