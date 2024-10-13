using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BadHabitApp.Migrations
{
    /// <inheritdoc />
    public partial class RemoveCreatedByUserIDColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Goals_AspNetUsers_CreatedByUserId",
                table: "Goals");

            migrationBuilder.DropForeignKey(
                name: "FK_Habits_AspNetUsers_CreatedByUserId",
                table: "Habits");

            migrationBuilder.DropIndex(
                name: "IX_Habits_CreatedByUserId",
                table: "Habits");

            migrationBuilder.DropIndex(
                name: "IX_Goals_CreatedByUserId",
                table: "Goals");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Habits");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Goals");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CreatedByUserId",
                table: "Habits",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedByUserId",
                table: "Goals",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Goals",
                keyColumn: "GoalId",
                keyValue: 1,
                column: "CreatedByUserId",
                value: null);

            migrationBuilder.UpdateData(
                table: "Goals",
                keyColumn: "GoalId",
                keyValue: 2,
                column: "CreatedByUserId",
                value: null);

            migrationBuilder.UpdateData(
                table: "Goals",
                keyColumn: "GoalId",
                keyValue: 3,
                column: "CreatedByUserId",
                value: null);

            migrationBuilder.UpdateData(
                table: "Goals",
                keyColumn: "GoalId",
                keyValue: 4,
                column: "CreatedByUserId",
                value: null);

            migrationBuilder.UpdateData(
                table: "Goals",
                keyColumn: "GoalId",
                keyValue: 5,
                column: "CreatedByUserId",
                value: null);

            migrationBuilder.UpdateData(
                table: "Goals",
                keyColumn: "GoalId",
                keyValue: 6,
                column: "CreatedByUserId",
                value: null);

            migrationBuilder.UpdateData(
                table: "Goals",
                keyColumn: "GoalId",
                keyValue: 7,
                column: "CreatedByUserId",
                value: null);

            migrationBuilder.UpdateData(
                table: "Goals",
                keyColumn: "GoalId",
                keyValue: 8,
                column: "CreatedByUserId",
                value: null);

            migrationBuilder.UpdateData(
                table: "Goals",
                keyColumn: "GoalId",
                keyValue: 9,
                column: "CreatedByUserId",
                value: null);

            migrationBuilder.UpdateData(
                table: "Goals",
                keyColumn: "GoalId",
                keyValue: 10,
                column: "CreatedByUserId",
                value: null);

            migrationBuilder.UpdateData(
                table: "Habits",
                keyColumn: "HabitId",
                keyValue: 1,
                column: "CreatedByUserId",
                value: null);

            migrationBuilder.UpdateData(
                table: "Habits",
                keyColumn: "HabitId",
                keyValue: 2,
                column: "CreatedByUserId",
                value: null);

            migrationBuilder.UpdateData(
                table: "Habits",
                keyColumn: "HabitId",
                keyValue: 3,
                column: "CreatedByUserId",
                value: null);

            migrationBuilder.UpdateData(
                table: "Habits",
                keyColumn: "HabitId",
                keyValue: 4,
                column: "CreatedByUserId",
                value: null);

            migrationBuilder.UpdateData(
                table: "Habits",
                keyColumn: "HabitId",
                keyValue: 5,
                column: "CreatedByUserId",
                value: null);

            migrationBuilder.UpdateData(
                table: "Habits",
                keyColumn: "HabitId",
                keyValue: 6,
                column: "CreatedByUserId",
                value: null);

            migrationBuilder.UpdateData(
                table: "Habits",
                keyColumn: "HabitId",
                keyValue: 7,
                column: "CreatedByUserId",
                value: null);

            migrationBuilder.UpdateData(
                table: "Habits",
                keyColumn: "HabitId",
                keyValue: 8,
                column: "CreatedByUserId",
                value: null);

            migrationBuilder.UpdateData(
                table: "Habits",
                keyColumn: "HabitId",
                keyValue: 9,
                column: "CreatedByUserId",
                value: null);

            migrationBuilder.UpdateData(
                table: "Habits",
                keyColumn: "HabitId",
                keyValue: 10,
                column: "CreatedByUserId",
                value: null);

            migrationBuilder.CreateIndex(
                name: "IX_Habits_CreatedByUserId",
                table: "Habits",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Goals_CreatedByUserId",
                table: "Goals",
                column: "CreatedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Goals_AspNetUsers_CreatedByUserId",
                table: "Goals",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Habits_AspNetUsers_CreatedByUserId",
                table: "Habits",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
