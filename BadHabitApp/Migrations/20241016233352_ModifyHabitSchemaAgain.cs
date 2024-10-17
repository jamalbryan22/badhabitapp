using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BadHabitApp.Migrations
{
    /// <inheritdoc />
    public partial class ModifyHabitSchemaAgain : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserHabits_Habits_HabitId",
                table: "UserHabits");

            migrationBuilder.DropTable(
                name: "Habits");

            migrationBuilder.DropIndex(
                name: "IX_UserHabits_UserId_HabitId",
                table: "UserHabits");

            migrationBuilder.DeleteData(
                table: "Goals",
                keyColumn: "GoalId",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Goals",
                keyColumn: "GoalId",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Goals",
                keyColumn: "GoalId",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Goals",
                keyColumn: "GoalId",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Goals",
                keyColumn: "GoalId",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Goals",
                keyColumn: "GoalId",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Goals",
                keyColumn: "GoalId",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Goals",
                keyColumn: "GoalId",
                keyValue: 9);

            migrationBuilder.AlterColumn<int>(
                name: "HabitId",
                table: "UserHabits",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "UserHabits",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "UserHabits",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "DefaultHabits",
                columns: table => new
                {
                    HabitId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    DefaultCostPerOccurrence = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    DefaultOccurrencesPerDay = table.Column<decimal>(type: "decimal(10,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DefaultHabits", x => x.HabitId);
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

            migrationBuilder.CreateIndex(
                name: "IX_UserHabits_UserId",
                table: "UserHabits",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserHabits_DefaultHabits_HabitId",
                table: "UserHabits",
                column: "HabitId",
                principalTable: "DefaultHabits",
                principalColumn: "HabitId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserHabits_DefaultHabits_HabitId",
                table: "UserHabits");

            migrationBuilder.DropTable(
                name: "DefaultHabits");

            migrationBuilder.DropIndex(
                name: "IX_UserHabits_UserId",
                table: "UserHabits");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "UserHabits");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "UserHabits");

            migrationBuilder.AlterColumn<int>(
                name: "HabitId",
                table: "UserHabits",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "Habits",
                columns: table => new
                {
                    HabitId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DefaultCostPerOccurrence = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    DefaultOccurrencesPerDay = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Habits", x => x.HabitId);
                });

            migrationBuilder.InsertData(
                table: "Goals",
                columns: new[] { "GoalId", "Description", "GoalType", "IsDefault", "Name" },
                values: new object[,]
                {
                    { 2, "Reduce nail biting occurrences.", "Reduce", true, "Reduce Nail Biting" },
                    { 3, "Reduce soda consumption to one can per day.", "Reduce", true, "Limit Soda Intake" },
                    { 4, "Stop eating fast food.", "Quit", true, "Avoid Fast Food" },
                    { 5, "Limit screen time to 2 hours per day.", "Reduce", true, "Reduce Screen Time" },
                    { 6, "Engage in physical activity 5 times a week.", "Increase", true, "Exercise Regularly" },
                    { 7, "Complete tasks promptly.", "Improve", true, "Stop Procrastinating" },
                    { 8, "Only make planned purchases.", "Quit", true, "Control Impulse Buying" },
                    { 9, "Avoid overeating by eating slowly.", "Improve", true, "Eat Mindfully" }
                });

            migrationBuilder.InsertData(
                table: "Habits",
                columns: new[] { "HabitId", "DefaultCostPerOccurrence", "DefaultOccurrencesPerDay", "Description", "IsDefault", "Name" },
                values: new object[,]
                {
                    { 1, 0.50m, 15m, "Smoking cigarettes or other tobacco products.", true, "Smoking" },
                    { 2, 0m, 20m, "Biting your fingernails.", true, "Nail Biting" },
                    { 3, 1.50m, 3m, "Consuming sugary sodas.", true, "Drinking Soda" },
                    { 4, 7.00m, 1m, "Eating fast food meals.", true, "Fast Food Consumption" },
                    { 5, 0m, 5m, "Spending too much time on screens.", true, "Excessive Screen Time" },
                    { 6, 0m, 1m, "Not engaging in physical activity.", true, "Skipping Exercise" },
                    { 7, 0m, 2m, "Delaying tasks that need to be done.", true, "Procrastination" },
                    { 8, 20.00m, 0.5m, "Making unplanned purchases.", true, "Impulse Buying" },
                    { 9, 5.00m, 1m, "Consuming more food than necessary.", true, "Overeating" },
                    { 10, 2.00m, 1m, "Eating snacks late at night.", true, "Late Night Snacking" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserHabits_UserId_HabitId",
                table: "UserHabits",
                columns: new[] { "UserId", "HabitId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_UserHabits_Habits_HabitId",
                table: "UserHabits",
                column: "HabitId",
                principalTable: "Habits",
                principalColumn: "HabitId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
