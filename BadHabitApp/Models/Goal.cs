namespace BadHabitApp.Models
{
	public class Goal
	{
		public int Id { get; set; }
		public int UserHabitId { get; set; }
		public string GoalType { get; set; } = string.Empty;
		public decimal GoalValue { get; set; }
		public DateTime? AchievedDate { get; set; }
		public bool IsAchieved { get; set; } = false;

		// Navigation property
		public UserHabit UserHabit { get; set; }
	}
}
