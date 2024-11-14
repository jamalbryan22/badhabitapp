using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BadHabitApp.Migrations
{
    /// <inheritdoc />
    public partial class AddRelapsesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastRelapseDate",
                table: "UserHabits");

            migrationBuilder.DropColumn(
                name: "ReasonForLastRelapse",
                table: "UserHabits");

            migrationBuilder.CreateTable(
                name: "Relapses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserHabitId = table.Column<int>(type: "int", nullable: false),
                    RelapseDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Relapses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Relapses_UserHabits_UserHabitId",
                        column: x => x.UserHabitId,
                        principalTable: "UserHabits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Relapses_UserHabitId",
                table: "Relapses",
                column: "UserHabitId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Relapses");

            migrationBuilder.AddColumn<DateTime>(
                name: "LastRelapseDate",
                table: "UserHabits",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "ReasonForLastRelapse",
                table: "UserHabits",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);
        }
    }
}
