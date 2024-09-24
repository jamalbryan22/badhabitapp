using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace BadHabitApp.Models
{
	public class Habit
	{
		protected const int MinHabitCost = 0;
		protected const int MaxHabitCost = 100000000;

		[Key]
		public int Id { get; set; }

		//todo: validation on note length?
		[Required(ErrorMessage = "Habit name required")]
        public string HabitName { get; set; } = string.Empty;

		//todo: validation on note length?
		[Required(ErrorMessage = "Description requried")]
        public string Description { get; set; } = string.Empty;

		[Range(MinHabitCost,MaxHabitCost, ErrorMessage = "Habit cost outside range of acceptablevalues")]
		public decimal AverageCostPerOccurrence { get; set; }

		// Navigation property
		public ICollection<UserHabit> UserHabits { get; set; }
	}
}
