using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BadHabitApp.Migrations
{
    /// <inheritdoc />
    public partial class MoveGoalFieldsToUserHabit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GoalMetric",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "GoalType",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "GoalValue",
                table: "AspNetUsers");

            migrationBuilder.AddColumn<string>(
                name: "GoalMetric",
                table: "UserHabits",
                type: "nvarchar(5)",
                maxLength: 5,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GoalType",
                table: "UserHabits",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "GoalValue",
                table: "UserHabits",
                type: "decimal(10,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GoalMetric",
                table: "UserHabits");

            migrationBuilder.DropColumn(
                name: "GoalType",
                table: "UserHabits");

            migrationBuilder.DropColumn(
                name: "GoalValue",
                table: "UserHabits");

            migrationBuilder.AddColumn<string>(
                name: "GoalMetric",
                table: "AspNetUsers",
                type: "nvarchar(5)",
                maxLength: 5,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GoalType",
                table: "AspNetUsers",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "GoalValue",
                table: "AspNetUsers",
                type: "decimal(10,2)",
                nullable: true);
        }
    }
}
