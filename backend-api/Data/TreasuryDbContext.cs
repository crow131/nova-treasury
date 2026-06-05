using System;
using Microsoft.EntityFrameworkCore;
using backend_api.Domain;

namespace backend_api.Data
{
    public class TreasuryDbContext : DbContext
    {
        public TreasuryDbContext(DbContextOptions<TreasuryDbContext> options) : base(options)
        {
        }

        public DbSet<Card> Cards => Set<Card>();
        public DbSet<Transaction> Transactions => Set<Transaction>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Card constraints
            modelBuilder.Entity<Card>(entity =>
            {
                entity.HasKey(c => c.Id);
                entity.Property(c => c.Last4).IsRequired().HasMaxLength(4);
                entity.Property(c => c.FullNumber).IsRequired().HasMaxLength(19);
                entity.Property(c => c.Holder).IsRequired().HasMaxLength(100);
                entity.Property(c => c.Status).IsRequired().HasMaxLength(20);
                entity.Property(c => c.CardType).IsRequired().HasMaxLength(20);
            });

            // Configure Transaction constraints
            modelBuilder.Entity<Transaction>(entity =>
            {
                entity.HasKey(t => t.Id);
                entity.Property(t => t.Description).IsRequired().HasMaxLength(200);
                entity.Property(t => t.CardLast4).IsRequired().HasMaxLength(4);
                entity.Property(t => t.Status).IsRequired().HasMaxLength(20);
                entity.Property(t => t.Category).IsRequired().HasMaxLength(50);
                entity.Property(t => t.Entity).IsRequired().HasMaxLength(100);
                entity.Property(t => t.OriginalCurrency).IsRequired().HasMaxLength(3);
            });

            // Seed Cards matching src/data.ts
            var card1Id = Guid.Parse("e43dbfb4-e5de-4d76-b51c-43db35948951");
            var card2Id = Guid.Parse("b25c345a-c603-4fba-80d5-1c3905c317f2");
            var card3Id = Guid.Parse("76db01aa-2782-411a-8bb7-09a8ab7d91cb");
            var card4Id = Guid.Parse("9420db20-8041-4ea6-ab7b-d68a2db7a31b");

            modelBuilder.Entity<Card>().HasData(
                new Card
                {
                    Id = card1Id,
                    Last4 = "4412",
                    FullNumber = "4412 8821 0092 4556",
                    Holder = "Neil Armstrong",
                    Limit = 25000m,
                    Spent = 16250.40m,
                    Expires = "12/26",
                    Status = "ACTIVE",
                    CardType = "Platinum",
                    RelativeBg = "#0F172A",
                    CreatedAt = DateTime.SpecifyKind(new DateTime(2023, 10, 1), DateTimeKind.Utc)
                },
                new Card
                {
                    Id = card2Id,
                    Last4 = "8901",
                    FullNumber = "4912 3781 8901 0212",
                    Holder = "Sally Ride",
                    Limit = 10000m,
                    Spent = 1250.00m,
                    Expires = "08/25",
                    Status = "ACTIVE",
                    CardType = "Physical",
                    RelativeBg = "#1E293B",
                    CreatedAt = DateTime.SpecifyKind(new DateTime(2023, 10, 1), DateTimeKind.Utc)
                },
                new Card
                {
                    Id = card3Id,
                    Last4 = "1122",
                    FullNumber = "4112 0044 1122 8989",
                    Holder = "Buzz Aldrin",
                    Limit = 50000m,
                    Spent = 0.00m,
                    Expires = "11/27",
                    Status = "LOCKED",
                    CardType = "Platinum",
                    RelativeBg = "#475569",
                    CreatedAt = DateTime.SpecifyKind(new DateTime(2023, 10, 1), DateTimeKind.Utc)
                },
                new Card
                {
                    Id = card4Id,
                    Last4 = "5564",
                    FullNumber = "4412 9901 5564 3321",
                    Holder = "Mae Jemison",
                    Limit = 5000m,
                    Spent = 1450.45m,
                    Expires = "05/26",
                    Status = "ACTIVE",
                    CardType = "Virtual",
                    RelativeBg = "#334155",
                    CreatedAt = DateTime.SpecifyKind(new DateTime(2023, 10, 1), DateTimeKind.Utc)
                }
            );

            // Seed Transactions matching src/data.ts
            modelBuilder.Entity<Transaction>().HasData(
                new Transaction
                {
                    Id = "#TRX-99210",
                    Description = "AWS Cloud Services",
                    Date = DateTime.SpecifyKind(new DateTime(2023, 10, 24), DateTimeKind.Utc),
                    Amount = -1240.00m,
                    CardLast4 = "4412",
                    Status = "Cleared",
                    Category = "Infrastructure",
                    Entity = "Proton North America",
                    OriginalCurrency = "USD"
                },
                new Transaction
                {
                    Id = "#TRX-99208",
                    Description = "United Airlines - Q4",
                    Date = DateTime.SpecifyKind(new DateTime(2023, 10, 23), DateTimeKind.Utc),
                    Amount = -12400.00m,
                    CardLast4 = "8901",
                    Status = "Pending",
                    Category = "Travel",
                    Entity = "Global Executive",
                    OriginalCurrency = "USD"
                },
                new Transaction
                {
                    Id = "#TRX-98144",
                    Description = "Goldman Sachs Treasury Transfer",
                    Date = DateTime.SpecifyKind(new DateTime(2023, 10, 22), DateTimeKind.Utc),
                    Amount = 2400000.00m,
                    CardLast4 = "4412",
                    Status = "Cleared",
                    Category = "Infrastructure",
                    Entity = "Master Holding",
                    OriginalCurrency = "USD"
                },
                new Transaction
                {
                    Id = "#TRX-99150",
                    Description = "Marsh McLennan Software",
                    Date = DateTime.SpecifyKind(new DateTime(2023, 10, 20), DateTimeKind.Utc),
                    Amount = -156000.00m,
                    CardLast4 = "5564",
                    Status = "Flagged",
                    Category = "Software & SaaS",
                    Entity = "Proton UK Ltd",
                    OriginalCurrency = "USD"
                },
                new Transaction
                {
                    Id = "#TRX-00101",
                    Description = "Starbucks Coffee - Strategy",
                    Date = DateTime.SpecifyKind(new DateTime(2023, 10, 22), DateTimeKind.Utc),
                    Amount = -12.45m,
                    CardLast4 = "4412",
                    Status = "Cleared",
                    Category = "Entertainment",
                    Entity = "Director Lunch",
                    OriginalCurrency = "USD"
                },
                new Transaction
                {
                    Id = "#TRX-00102",
                    Description = "GitHub Inc. - Enterprise Seats",
                    Date = DateTime.SpecifyKind(new DateTime(2023, 10, 21), DateTimeKind.Utc),
                    Amount = -49.00m,
                    CardLast4 = "4412",
                    Status = "Pending",
                    Category = "Software",
                    Entity = "Development Tooling",
                    OriginalCurrency = "USD"
                }
            );
        }
    }
}
