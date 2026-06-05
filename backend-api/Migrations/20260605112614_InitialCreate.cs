using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend_api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Cards",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Last4 = table.Column<string>(type: "character varying(4)", maxLength: 4, nullable: false),
                    FullNumber = table.Column<string>(type: "character varying(19)", maxLength: 19, nullable: false),
                    Holder = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Limit = table.Column<decimal>(type: "numeric", nullable: false),
                    Spent = table.Column<decimal>(type: "numeric", nullable: false),
                    Expires = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CardType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    RelativeBg = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cards", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Transactions",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
                    CardLast4 = table.Column<string>(type: "character varying(4)", maxLength: 4, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Entity = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    OriginalCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transactions", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Cards",
                columns: new[] { "Id", "CardType", "CreatedAt", "Expires", "FullNumber", "Holder", "Last4", "Limit", "RelativeBg", "Spent", "Status" },
                values: new object[,]
                {
                    { new Guid("76db01aa-2782-411a-8bb7-09a8ab7d91cb"), "Platinum", new DateTime(2023, 10, 1, 0, 0, 0, 0, DateTimeKind.Utc), "11/27", "4112 0044 1122 8989", "Mark Thompson", "1122", 50000m, "#475569", 0.00m, "LOCKED" },
                    { new Guid("9420db20-8041-4ea6-ab7b-d68a2db7a31b"), "Virtual", new DateTime(2023, 10, 1, 0, 0, 0, 0, DateTimeKind.Utc), "05/26", "4412 9901 5564 3321", "Elena Rodriguez", "5564", 5000m, "#334155", 1450.45m, "ACTIVE" },
                    { new Guid("b25c345a-c603-4fba-80d5-1c3905c317f2"), "Physical", new DateTime(2023, 10, 1, 0, 0, 0, 0, DateTimeKind.Utc), "08/25", "4912 3781 8901 0212", "David Chen", "8901", 10000m, "#1E293B", 1250.00m, "ACTIVE" },
                    { new Guid("e43dbfb4-e5de-4d76-b51c-43db35948951"), "Platinum", new DateTime(2023, 10, 1, 0, 0, 0, 0, DateTimeKind.Utc), "12/26", "4412 8821 0092 4556", "Sarah Jenkins", "4412", 25000m, "#0F172A", 16250.40m, "ACTIVE" }
                });

            migrationBuilder.InsertData(
                table: "Transactions",
                columns: new[] { "Id", "Amount", "CardLast4", "Category", "Date", "Description", "Entity", "OriginalCurrency", "Status" },
                values: new object[,]
                {
                    { "#TRX-00101", -12.45m, "4412", "Entertainment", new DateTime(2023, 10, 22, 0, 0, 0, 0, DateTimeKind.Utc), "Starbucks Coffee - Strategy", "Director Lunch", "USD", "Cleared" },
                    { "#TRX-00102", -49.00m, "4412", "Software", new DateTime(2023, 10, 21, 0, 0, 0, 0, DateTimeKind.Utc), "GitHub Inc. - Enterprise Seats", "Development Tooling", "USD", "Pending" },
                    { "#TRX-98144", 2400000.00m, "4412", "Infrastructure", new DateTime(2023, 10, 22, 0, 0, 0, 0, DateTimeKind.Utc), "Goldman Sachs Treasury Transfer", "Master Holding", "USD", "Cleared" },
                    { "#TRX-99150", -156000.00m, "5564", "Software & SaaS", new DateTime(2023, 10, 20, 0, 0, 0, 0, DateTimeKind.Utc), "Marsh McLennan Software", "Proton UK Ltd", "USD", "Flagged" },
                    { "#TRX-99208", -12400.00m, "8901", "Travel", new DateTime(2023, 10, 23, 0, 0, 0, 0, DateTimeKind.Utc), "United Airlines - Q4", "Global Executive", "USD", "Pending" },
                    { "#TRX-99210", -1240.00m, "4412", "Infrastructure", new DateTime(2023, 10, 24, 0, 0, 0, 0, DateTimeKind.Utc), "AWS Cloud Services", "Proton North America", "USD", "Cleared" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Cards");

            migrationBuilder.DropTable(
                name: "Transactions");
        }
    }
}
