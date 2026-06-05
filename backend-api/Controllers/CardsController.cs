using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using backend_api.Domain;
using backend_api.DTOs;
using backend_api.Services;
using backend_api.Interfaces;

namespace backend_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("StrictPolicy")]
    public class CardsController : ControllerBase
    {
        private readonly ICardService _cardService;

        public CardsController(ICardService cardService)
        {
            _cardService = cardService;
        }

        // GET: api/cards
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Card>>> GetCards()
        {
            var cards = await _cardService.GetCardsAsync();
            return Ok(cards);
        }

        // GET: api/cards/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Card>> GetCard(Guid id)
        {
            var card = await _cardService.GetCardByIdAsync(id);
            return Ok(card);
        }

        // POST: api/cards
        [HttpPost]
        public async Task<ActionResult<Card>> CreateCard([FromBody] CreateCardRequest request)
        {
            var card = await _cardService.CreateCardAsync(request);
            return CreatedAtAction(nameof(GetCard), new { id = card.Id }, card);
        }

        // PUT: api/cards/{id}/limit
        [HttpPut("{id}/limit")]
        public async Task<IActionResult> UpdateLimit(Guid id, [FromBody] decimal newLimit)
        {
            await _cardService.UpdateLimitAsync(id, newLimit);
            return NoContent();
        }

        // POST: api/cards/{id}/toggle-status
        [HttpPost("{id}/toggle-status")]
        public async Task<IActionResult> ToggleStatus(Guid id)
        {
            var card = await _cardService.ToggleStatusAsync(id);
            return Ok(new { card.Id, card.Status });
        }

        // GET: api/cards/{id}/balance
        [HttpGet("{id}/balance")]
        public async Task<ActionResult<CardBalanceResponse>> GetConvertedBalance(Guid id, [FromQuery] string currency = "USD")
        {
            var response = await _cardService.GetConvertedBalanceAsync(id, currency);
            return Ok(response);
        }
    }
}
