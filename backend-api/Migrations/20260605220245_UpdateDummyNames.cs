using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend_api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDummyNames : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Cards",
                keyColumn: "Id",
                keyValue: new Guid("76db01aa-2782-411a-8bb7-09a8ab7d91cb"),
                column: "Holder",
                value: "Buzz Aldrin");

            migrationBuilder.UpdateData(
                table: "Cards",
                keyColumn: "Id",
                keyValue: new Guid("9420db20-8041-4ea6-ab7b-d68a2db7a31b"),
                column: "Holder",
                value: "Mae Jemison");

            migrationBuilder.UpdateData(
                table: "Cards",
                keyColumn: "Id",
                keyValue: new Guid("b25c345a-c603-4fba-80d5-1c3905c317f2"),
                column: "Holder",
                value: "Sally Ride");

            migrationBuilder.UpdateData(
                table: "Cards",
                keyColumn: "Id",
                keyValue: new Guid("e43dbfb4-e5de-4d76-b51c-43db35948951"),
                column: "Holder",
                value: "Neil Armstrong");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Cards",
                keyColumn: "Id",
                keyValue: new Guid("76db01aa-2782-411a-8bb7-09a8ab7d91cb"),
                column: "Holder",
                value: "Mark Thompson");

            migrationBuilder.UpdateData(
                table: "Cards",
                keyColumn: "Id",
                keyValue: new Guid("9420db20-8041-4ea6-ab7b-d68a2db7a31b"),
                column: "Holder",
                value: "Elena Rodriguez");

            migrationBuilder.UpdateData(
                table: "Cards",
                keyColumn: "Id",
                keyValue: new Guid("b25c345a-c603-4fba-80d5-1c3905c317f2"),
                column: "Holder",
                value: "David Chen");

            migrationBuilder.UpdateData(
                table: "Cards",
                keyColumn: "Id",
                keyValue: new Guid("e43dbfb4-e5de-4d76-b51c-43db35948951"),
                column: "Holder",
                value: "Sarah Jenkins");
        }
    }
}
