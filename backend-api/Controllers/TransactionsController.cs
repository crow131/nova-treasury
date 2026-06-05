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
    public class TransactionsController : ControllerBase
    {
        private readonly ITransactionService _transactionService;

        public TransactionsController(ITransactionService transactionService)
        {
            _transactionService = transactionService;
        }

        // GET: api/transactions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ConvertedTransactionResponse>>> GetTransactions(
            [FromQuery] Guid? cardId, 
            [FromQuery] string currency = "USD")
        {
            var response = await _transactionService.GetTransactionsAsync(cardId, currency);
            return Ok(response);
        }

        // POST: api/transactions
        [HttpPost]
        public async Task<ActionResult<Transaction>> RecordTransaction([FromBody] CreateTransactionRequest request)
        {
            var transaction = await _transactionService.RecordTransactionAsync(request);
            return Ok(transaction);
        }
    }
}
