using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BadHabitApp.Migrations
{
    /// <inheritdoc />
    public partial class FixRelapseReasonField : Migration
    {
		/// <inheritdoc />
		protected override void Up(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.Sql(@"
            -- Loop until all JSON strings are resolved
            WHILE EXISTS (SELECT 1 FROM Relapses WHERE ISJSON(Reason) = 1)
            BEGIN
                UPDATE Relapses
                SET Reason = JSON_VALUE(Reason, '$.reason')
                WHERE ISJSON(Reason) = 1;
            END
        ");
		}

		/// <inheritdoc />
		protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
