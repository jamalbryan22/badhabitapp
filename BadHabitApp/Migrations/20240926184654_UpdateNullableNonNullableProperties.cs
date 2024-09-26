using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BadHabitApp.Migrations
{
    /// <inheritdoc />
    public partial class UpdateNullableNonNullableProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "CreatedByUserId",
                table: "Habits",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AlterColumn<string>(
                name: "CreatedByUserId",
                table: "Goals",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.InsertData(
                table: "Goals",
                columns: new[] { "GoalId", "CreatedByUserId", "Description", "GoalType", "IsDefault", "Name" },
                values: new object[,]
                {
                    { 1, null, "Completely stop smoking.", "Quit", true, "Quit Smoking" },
                    { 2, null, "Reduce nail biting occurrences.", "Reduce", true, "Reduce Nail Biting" },
                    { 3, null, "Reduce soda consumption to one can per day.", "Reduce", true, "Limit Soda Intake" },
                    { 4, null, "Stop eating fast food.", "Quit", true, "Avoid Fast Food" },
                    { 5, null, "Limit screen time to 2 hours per day.", "Reduce", true, "Reduce Screen Time" },
                    { 6, null, "Engage in physical activity 5 times a week.", "Increase", true, "Exercise Regularly" },
                    { 7, null, "Complete tasks promptly.", "Improve", true, "Stop Procrastinating" },
                    { 8, null, "Only make planned purchases.", "Quit", true, "Control Impulse Buying" },
                    { 9, null, "Avoid overeating by eating slowly.", "Improve", true, "Eat Mindfully" },
                    { 10, null, "Avoid eating after 8 PM.", "Quit", true, "Stop Late Night Snacking" }
                });

            migrationBuilder.InsertData(
                table: "Habits",
                columns: new[] { "HabitId", "CreatedByUserId", "DefaultCostPerOccurrence", "DefaultOccurrencesPerDay", "Description", "IsDefault", "Name" },
                values: new object[,]
                {
                    { 1, null, 0.50m, 15m, "Smoking cigarettes or other tobacco products.", true, "Smoking" },
                    { 2, null, 0m, 20m, "Biting your fingernails.", true, "Nail Biting" },
                    { 3, null, 1.50m, 3m, "Consuming sugary sodas.", true, "Drinking Soda" },
                    { 4, null, 7.00m, 1m, "Eating fast food meals.", true, "Fast Food Consumption" },
                    { 5, null, 0m, 5m, "Spending too much time on screens.", true, "Excessive Screen Time" },
                    { 6, null, 0m, 1m, "Not engaging in physical activity.", true, "Skipping Exercise" },
                    { 7, null, 0m, 2m, "Delaying tasks that need to be done.", true, "Procrastination" },
                    { 8, null, 20.00m, 0.5m, "Making unplanned purchases.", true, "Impulse Buying" },
                    { 9, null, 5.00m, 1m, "Consuming more food than necessary.", true, "Overeating" },
                    { 10, null, 2.00m, 1m, "Eating snacks late at night.", true, "Late Night Snacking" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Goals",
                keyColumn: "GoalId",
                keyValue: 1);

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

            migrationBuilder.DeleteData(
                table: "Goals",
                keyColumn: "GoalId",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Habits",
                keyColumn: "HabitId",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Habits",
                keyColumn: "HabitId",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Habits",
                keyColumn: "HabitId",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Habits",
                keyColumn: "HabitId",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Habits",
                keyColumn: "HabitId",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Habits",
                keyColumn: "HabitId",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Habits",
                keyColumn: "HabitId",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Habits",
                keyColumn: "HabitId",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Habits",
                keyColumn: "HabitId",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Habits",
                keyColumn: "HabitId",
                keyValue: 10);

            migrationBuilder.AlterColumn<string>(
                name: "CreatedByUserId",
                table: "Habits",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreatedByUserId",
                table: "Goals",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);
        }
    }
}
