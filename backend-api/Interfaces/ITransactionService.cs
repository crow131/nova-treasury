using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend_api.Domain;
using backend_api.DTOs;

namespace backend_api.Interfaces
{
    public interface ITransactionService
    {
        Task<IEnumerable<ConvertedTransactionResponse>> GetTransactionsAsync(Guid? cardId, string currency);
        Task<Transaction> RecordTransactionAsync(CreateTransactionRequest request);
    }
}
