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

		[Required]
		public int HabitId { get; set; }

		[Required]
		public DateTime StartDate { get; set; }

		[Column(TypeName = "decimal(10,2)")]
		public decimal? CostPerOccurrence { get; set; }

		[Column(TypeName = "decimal(10,2)")]
		public decimal? OccurrencesPerDay { get; set; }

		public bool IsActive { get; set; }

		// Navigation properties
		public ApplicationUser User { get; set; } = new ApplicationUser();
		public Habit Habit { get; set; } = new Habit();
		public ICollection<Relapse> Relapses { get; set; } = new List<Relapse>();
		public ICollection<UserGoal> UserGoals { get; set; } = new List<UserGoal>();
	}
}
