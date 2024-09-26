using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BadHabitApp.Models
{
	public class UserGoal
	{
		[Key]
		public int UserGoalId { get; set; }

		[Required]
		public string UserId { get; set; } = string.Empty;

		[Required]
		public int GoalId { get; set; }

		[Required]
		public int UserHabitId { get; set; }

		[Column(TypeName = "decimal(10,2)")]
		public decimal? TargetValue { get; set; }

		public DateTime? TargetDate { get; set; }

		public bool IsActive { get; set; }

		[Required]
		public DateTime StartDate { get; set; }

		public DateTime? CompletionDate { get; set; }

		// Navigation properties
		public ApplicationUser User { get; set; } = new ApplicationUser();
		public Goal Goal { get; set; } = new Goal();
		public UserHabit UserHabit { get; set; } = new UserHabit();
	}
}
