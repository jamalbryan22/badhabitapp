using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BadHabitApp.Models
{
	public class DefaultHabit
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

		// Navigation properties
		public ICollection<UserHabit> UserHabits { get; set; } = new List<UserHabit>();
	}
}
