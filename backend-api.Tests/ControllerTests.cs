using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using backend_api.Data;
using backend_api.Domain;
using backend_api.DTOs;
using backend_api.Controllers;
using backend_api.Services;
using Moq;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace backend_api.Tests
{
    public class ControllerTests : IDisposable
    {
        private readonly SqliteConnection _connection;
        private readonly DbContextOptions<TreasuryDbContext> _dbContextOptions;
        private readonly Mock<ITreasuryService> _mockTreasuryService;

        public ControllerTests()
        {
            // Setup SQLite connection in memory
            _connection = new SqliteConnection("Filename=:memory:");
            _connection.Open();

            _dbContextOptions = new DbContextOptionsBuilder<TreasuryDbContext>()
                .UseSqlite(_connection)
                .Options;

            // Ensure schema is created
            using (var context = new TreasuryDbContext(_dbContextOptions))
            {
                context.Database.EnsureCreated();
            }

            _mockTreasuryService = new Mock<ITreasuryService>();
        }

        public void Dispose()
        {
            _connection.Dispose();
        }

        [Fact]
        public async Task CreateCard_ShouldSaveCardAndReturnCreatedResult()
        {
            // Arrange
            using var context = new TreasuryDbContext(_dbContextOptions);
            var controller = new CardsController(context, _mockTreasuryService.Object);
            var request = new CreateCardRequest
            {
                Holder = "John Doe",
                Limit = 15000m,
                CardType = "Virtual"
            };

            // Act
            var actionResult = await controller.CreateCard(request);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(actionResult.Result);
            var card = Assert.IsType<Card>(createdResult.Value);
            Assert.Equal("John Doe", card.Holder);
            Assert.Equal(15000m, card.Limit);
            Assert.Equal("Virtual", card.CardType);
            Assert.Equal(4, card.Last4.Length);
            Assert.Equal("ACTIVE", card.Status);

            // Verify saved in DB
            Assert.NotNull(await context.Cards.FindAsync(card.Id));
        }

        [Fact]
        public async Task GetConvertedBalance_ShouldReturnConvertedBalanceWithLatestRate()
        {
            // Arrange
            var cardId = Guid.NewGuid();
            using (var context = new TreasuryDbContext(_dbContextOptions))
            {
                context.Cards.Add(new Card
                {
                    Id = cardId,
                    Holder = "Jane Smith",
                    Limit = 10000m,
                    Spent = 3000m,
                    Last4 = "9999",
                    FullNumber = "9999 1234 5678 9012",
                    Expires = "12/28",
                    Status = "ACTIVE"
                });
                await context.SaveChangesAsync();
            }

            _mockTreasuryService
                .Setup(s => s.GetLatestExchangeRateAsync("EUR"))
                .ReturnsAsync(0.92m);

            using var testContext = new TreasuryDbContext(_dbContextOptions);
            var controller = new CardsController(testContext, _mockTreasuryService.Object);

            // Act
            var actionResult = await controller.GetConvertedBalance(cardId, "EUR");

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var response = Assert.IsType<CardBalanceResponse>(okResult.Value);
            Assert.Equal(cardId, response.CardId);
            Assert.Equal(7000m, response.AvailableBalanceUsd); // 10000 limit - 3000 spent = 7000 available USD
            Assert.Equal("EUR", response.TargetCurrency);
            Assert.Equal(0.92m, response.ExchangeRateUsed);
            Assert.Equal(6440m, response.ConvertedAvailableBalance); // 7000 * 0.92 = 6440
        }

        [Fact]
        public async Task RecordTransaction_ShouldDeductLimit_WhenValidExpense()
        {
            // Arrange
            var cardId = Guid.NewGuid();
            using (var context = new TreasuryDbContext(_dbContextOptions))
            {
                context.Cards.Add(new Card
                {
                    Id = cardId,
                    Holder = "Alice Cooper",
                    Limit = 5000m,
                    Spent = 1000m,
                    Last4 = "5555",
                    FullNumber = "5555 1234 5678 9012",
                    Expires = "12/28",
                    Status = "ACTIVE"
                });
                await context.SaveChangesAsync();
            }

            using var testContext = new TreasuryDbContext(_dbContextOptions);
            var controller = new TransactionsController(testContext, _mockTreasuryService.Object);
            var request = new CreateTransactionRequest
            {
                CardLast4 = "5555",
                Amount = -500m, // Expense
                Description = "Software license"
            };

            // Act
            var actionResult = await controller.RecordTransaction(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var transaction = Assert.IsType<Transaction>(okResult.Value);
            Assert.Equal(-500m, transaction.Amount);
            Assert.Equal("5555", transaction.CardLast4);

            // Verify card spent was updated
            var updatedCard = await testContext.Cards.FindAsync(cardId);
            Assert.NotNull(updatedCard);
            Assert.Equal(1500m, updatedCard.Spent); // 1000 original + 500 purchase = 1500 Spent
        }

        [Fact]
        public async Task RecordTransaction_ShouldDecline_WhenInsufficientFunds()
        {
            // Arrange
            using (var context = new TreasuryDbContext(_dbContextOptions))
            {
                context.Cards.Add(new Card
                {
                    Id = Guid.NewGuid(),
                    Holder = "Bob Marley",
                    Limit = 200m,
                    Spent = 150m,
                    Last4 = "4444",
                    FullNumber = "4444 1234 5678 9012",
                    Expires = "12/28",
                    Status = "ACTIVE"
                });
                await context.SaveChangesAsync();
            }

            using var testContext = new TreasuryDbContext(_dbContextOptions);
            var controller = new TransactionsController(testContext, _mockTreasuryService.Object);
            var request = new CreateTransactionRequest
            {
                CardLast4 = "4444",
                Amount = -100m, // Purchase of 100 USD (available is only 50)
                Description = "Office desk"
            };

            // Act
            var actionResult = await controller.RecordTransaction(request);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(actionResult.Result);
            var problemDetails = Assert.IsType<ProblemDetails>(badRequestResult.Value);
            Assert.Equal(400, problemDetails.Status);
            Assert.Equal("Transaction Declined", problemDetails.Title);
        }

        [Fact]
        public async Task RecordTransaction_ShouldDecline_WhenCardIsLocked()
        {
            // Arrange
            using (var context = new TreasuryDbContext(_dbContextOptions))
            {
                context.Cards.Add(new Card
                {
                    Id = Guid.NewGuid(),
                    Holder = "Frozen Cardholder",
                    Limit = 2000m,
                    Spent = 0m,
                    Last4 = "1111",
                    FullNumber = "1111 1234 5678 9012",
                    Expires = "12/28",
                    Status = "LOCKED"
                });
                await context.SaveChangesAsync();
            }

            using var testContext = new TreasuryDbContext(_dbContextOptions);
            var controller = new TransactionsController(testContext, _mockTreasuryService.Object);
            var request = new CreateTransactionRequest
            {
                CardLast4 = "1111",
                Amount = -100m,
                Description = "Locked test"
            };

            // Act
            var actionResult = await controller.RecordTransaction(request);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(actionResult.Result);
            var problemDetails = Assert.IsType<ProblemDetails>(badRequestResult.Value);
            Assert.Equal(400, problemDetails.Status);
            Assert.Contains("frozen/locked", problemDetails.Detail);
        }
    }
}
