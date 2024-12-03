using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BadHabitApp.Attributes;

namespace BadHabitApp.Models
{
	public class RegisterModel
	{
		// User fields
		[Required(ErrorMessage = "Email is required.")]
		[EmailAddress]
		public string Email { get; set; } = string.Empty;

		[Required(ErrorMessage = "Password is required.")]
		public string Password { get; set; } = string.Empty;

		// Added TimeZoneId
		[Required(ErrorMessage = "Time Zone is required.")]
		[TimeZoneIdValidation]
		public string TimeZoneId { get; set; } = "UTC";

		// New goal fields
		[Required(ErrorMessage = "Goal Type is required.")]
		[StringLength(10)]
		[GoalTypeValidation]
		public string GoalType { get; set; } = "quit";

		[StringLength(5)]
		[GoalMetricValidation]
		public string? GoalMetric { get; set; }

		public decimal? GoalValue { get; set; }

		// Habit fields
		[Required(ErrorMessage = "Addiction Type is required.")]
		[StringLength(100)]
		public string AddictionType { get; set; } = string.Empty;

		[Required(ErrorMessage = "Habit Start Date is required.")]
		public DateTime? HabitStartDate { get; set; }

		[StringLength(500)]
		public string? HabitDescription { get; set; }

		[StringLength(500)]
		public string? UserMotivation { get; set; }

		[Column(TypeName = "decimal(10,2)")]
		public decimal? CostPerOccurrence { get; set; }

		[Column(TypeName = "decimal(10,2)")]
		public decimal? OccurrencesPerMonth { get; set; }
	}
}
