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

		[StringLength(500)]
		public string? HabitDescription { get; set; }

		[StringLength(500)]
		public string? UserMotivation { get; set; }

		[Column(TypeName = "decimal(10,2)")]
		public decimal? CostPerOccurrence { get; set; }

		[Column(TypeName = "decimal(10,2)")]
		public decimal? OccurrencesPerMonth { get; set; }

		public ICollection<Relapse> Relapses { get; set; } = new List<Relapse>();
	}

}
