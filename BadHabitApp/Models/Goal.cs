using System.ComponentModel.DataAnnotations;

namespace BadHabitApp.Models
{
	public class Goal
	{
		[Key]
		public int Id { get; set; }

		public int UserHabitId { get; set; }

		[Required]
		public string GoalType { get; set; } = string.Empty;

		[Required]
		public decimal GoalValue { get; set; }

        [DataType(DataType.Date)]
        public DateTime? AchievedDate { get; set; }
		public bool IsAchieved { get; set; } = false;

		// Navigation property
		public UserHabit UserHabit { get; set; }
	}
}
