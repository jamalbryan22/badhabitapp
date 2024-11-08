using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BadHabitApp.Models
{
	public class UserHabit
	{
		[Key]
		public int Id { get; set; }

		[Required]
		public string UserId { get; set; } = string.Empty;

		[Required(ErrorMessage = "Addiction Type is required.")]
		[StringLength(100)]
		public string AddictionType { get; set; } = string.Empty;

		[Required(ErrorMessage = "Habit Start Date is required.")]
		public DateTime HabitStartDate { get; set; }

		[Required(ErrorMessage = "Last Relapse Date is required.")]
		public DateTime LastRelapseDate { get; set; }

		[StringLength(500)]
		public string? HabitDescription { get; set; }

		[StringLength(500)]
		public string? UserMotivation { get; set; }

		[StringLength(500)]
		public string? ReasonForLastRelapse { get; set; }

		[Column(TypeName = "decimal(10,2)")]
		public decimal? CostPerOccurrence { get; set; }

		[Column(TypeName = "decimal(10,2)")]
		public decimal? OccurrencesPerMonth { get; set; }
	}
}
