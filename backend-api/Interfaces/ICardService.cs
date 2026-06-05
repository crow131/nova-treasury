using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend_api.Domain;
using backend_api.DTOs;

namespace backend_api.Interfaces
{
    public interface ICardService
    {
        Task<IEnumerable<Card>> GetCardsAsync();
        Task<Card> GetCardByIdAsync(Guid id);
        Task<Card> CreateCardAsync(CreateCardRequest request);
        Task UpdateLimitAsync(Guid id, decimal newLimit);
        Task<Card> ToggleStatusAsync(Guid id);
        Task<CardBalanceResponse> GetConvertedBalanceAsync(Guid id, string currency);
    }
}
