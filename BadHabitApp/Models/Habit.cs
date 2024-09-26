using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BadHabitApp.Models
{
	public class Habit
	{
		[Key]
		public int HabitId { get; set; }

		[Required]
		[StringLength(100)]
		public string Name { get; set; } = string.Empty;

		[StringLength(500)]
		public string Description { get; set; } = string.Empty;

		[Column(TypeName = "decimal(10,2)")]
		public decimal? DefaultCostPerOccurrence { get; set; }

		[Column(TypeName = "decimal(10,2)")]
		public decimal? DefaultOccurrencesPerDay { get; set; }

		public bool IsDefault { get; set; }

		public string? CreatedByUserId { get; set; }

		// Navigation properties
		public ApplicationUser? CreatedByUser { get; set; }
		public ICollection<UserHabit> UserHabits { get; set; } = new List<UserHabit>();
	}
}
