using System.Collections.Generic;

namespace BadHabitApp.Models
{
	public class Habit
	{
		public int Id { get; set; }
		public string HabitName { get; set; } = string.Empty;
		public string Description { get; set; } = string.Empty;
		public decimal AverageCostPerOccurrence { get; set; }

		// Navigation property
		public ICollection<UserHabit> UserHabits { get; set; }
	}
}
