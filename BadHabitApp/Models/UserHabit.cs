using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BadHabitApp.Models
{
	public class UserHabit
	{
		[Key]
		public int UserHabitId { get; set; }

		[Required]
		public string UserId { get; set; } = string.Empty;

		public int? HabitId { get; set; }  // Nullable for custom habits

		// Fields for custom habits
		[StringLength(100)]
		public string? Name { get; set; } = string.Empty;

		[StringLength(500)]
		public string? Description { get; set; } = string.Empty;

		[Required]
		public DateTime StartDate { get; set; }

		[Column(TypeName = "decimal(10,2)")]
		public decimal? CostPerOccurrence { get; set; }

		[Column(TypeName = "decimal(10,2)")]
		public decimal? OccurrencesPerDay { get; set; }

		public bool IsActive { get; set; }

		// Navigation properties
		public ApplicationUser User { get; set; }
		public DefaultHabit Habit { get; set; }
		public ICollection<Relapse> Relapses { get; set; } = new List<Relapse>();
		public ICollection<UserGoal> UserGoals { get; set; } = new List<UserGoal>();
	}
}
