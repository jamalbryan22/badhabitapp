using System.ComponentModel.DataAnnotations;

namespace BadHabitApp.Models
{
	public class Goal
	{
		[Key]
		public int GoalId { get; set; }

		[Required]
		[StringLength(100)]
		public string Name { get; set; } = string.Empty;

		[StringLength(500)]
		public string Description { get; set; } = string.Empty;

		[Required]
		[StringLength(50)]
		public string GoalType { get; set; } = string.Empty; // e.g., 'Quit', 'Reduce'

		public bool IsDefault { get; set; }

		public string? CreatedByUserId { get; set; }

		// Navigation properties
		public ApplicationUser? CreatedByUser { get; set; }
		public ICollection<UserGoal> UserGoals { get; set; } = new List<UserGoal>();
	}
}
