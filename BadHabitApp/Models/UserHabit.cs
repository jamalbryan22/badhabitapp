using System;
using System.Collections.Generic;

namespace BadHabitApp.Models
{
	public class UserHabit
	{
		public int Id { get; set; }
		public int UserId { get; set; }
		public int HabitId { get; set; }
		public DateTime StartDate { get; set; }
		public DateTime? LastRelapseDate { get; set; }
		public decimal CostPerOccurrence { get; set; }
		public int FrequencyPerDay { get; set; }
		public bool IsActive { get; set; } = true;

		// Navigation properties
		public User User { get; set; }
		public Habit Habit { get; set; }
		public ICollection<Relapse> Relapses { get; set; }
		public ICollection<Goal> Goals { get; set; }
	}
}
