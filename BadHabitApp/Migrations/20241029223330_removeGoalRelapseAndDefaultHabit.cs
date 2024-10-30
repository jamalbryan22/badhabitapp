using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BadHabitApp.Migrations
{
    /// <inheritdoc />
    public partial class removeGoalRelapseAndDefaultHabit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserHabits_DefaultHabits_DefaultHabitHabitId",
                table: "UserHabits");

            migrationBuilder.DropTable(
                name: "DefaultHabits");

            migrationBuilder.DropTable(
                name: "Relapses");

            migrationBuilder.DropTable(
                name: "UserGoals");

            migrationBuilder.DropTable(
                name: "Goals");

            migrationBuilder.DropIndex(
                name: "IX_UserHabits_DefaultHabitHabitId",
                table: "UserHabits");

            migrationBuilder.DropColumn(
                name: "DefaultHabitHabitId",
                table: "UserHabits");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DefaultHabitHabitId",
                table: "UserHabits",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "DefaultHabits",
                columns: table => new
                {
                    HabitId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DefaultCostPerOccurrence = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    DefaultOccurrencesPerDay = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DefaultHabits", x => x.HabitId);
                });

            migrationBuilder.CreateTable(
                name: "Goals",
                columns: table => new
                {
                    GoalId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    GoalType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Goals", x => x.GoalId);
                });

            migrationBuilder.CreateTable(
                name: "Relapses",
                columns: table => new
                {
                    RelapseId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserHabitId = table.Column<int>(type: "int", nullable: false),
                    DateTime = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Relapses", x => x.RelapseId);
                    table.ForeignKey(
                        name: "FK_Relapses_UserHabits_UserHabitId",
                        column: x => x.UserHabitId,
                        principalTable: "UserHabits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserGoals",
                columns: table => new
                {
                    UserGoalId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GoalId = table.Column<int>(type: "int", nullable: false),
                    UserHabitId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CompletionDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TargetDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TargetValue = table.Column<decimal>(type: "decimal(10,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserGoals", x => x.UserGoalId);
                    table.ForeignKey(
                        name: "FK_UserGoals_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserGoals_Goals_GoalId",
                        column: x => x.GoalId,
                        principalTable: "Goals",
                        principalColumn: "GoalId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserGoals_UserHabits_UserHabitId",
                        column: x => x.UserHabitId,
                        principalTable: "UserHabits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "DefaultHabits",
                columns: new[] { "HabitId", "DefaultCostPerOccurrence", "DefaultOccurrencesPerDay", "Description", "Name" },
                values: new object[,]
                {
                    { 1, 0.50m, 15m, "Smoking cigarettes or other tobacco products.", "Smoking" },
                    { 2, 0m, 20m, "Biting your fingernails.", "Nail Biting" },
                    { 10, 2.00m, 1m, "Eating snacks late at night.", "Late Night Snacking" }
                });

            migrationBuilder.InsertData(
                table: "Goals",
                columns: new[] { "GoalId", "Description", "GoalType", "IsDefault", "Name" },
                values: new object[,]
                {
                    { 1, "Completely stop smoking.", "Quit", true, "Quit Smoking" },
                    { 10, "Avoid eating after 8 PM.", "Quit", true, "Stop Late Night Snacking" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserHabits_DefaultHabitHabitId",
                table: "UserHabits",
                column: "DefaultHabitHabitId");

            migrationBuilder.CreateIndex(
                name: "IX_Relapses_UserHabitId",
                table: "Relapses",
                column: "UserHabitId");

            migrationBuilder.CreateIndex(
                name: "IX_UserGoals_GoalId",
                table: "UserGoals",
                column: "GoalId");

            migrationBuilder.CreateIndex(
                name: "IX_UserGoals_UserHabitId",
                table: "UserGoals",
                column: "UserHabitId");

            migrationBuilder.CreateIndex(
                name: "IX_UserGoals_UserId",
                table: "UserGoals",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserHabits_DefaultHabits_DefaultHabitHabitId",
                table: "UserHabits",
                column: "DefaultHabitHabitId",
                principalTable: "DefaultHabits",
                principalColumn: "HabitId");
        }
    }
}
