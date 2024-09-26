using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace BadHabitApp.Models
{
    public class ApplicationUser : IdentityUser
    {
        public DateTime RegistrationDate { get; set; } = DateTime.UtcNow;

        [DataType(DataType.Date)]
        public DateTime? LastLogin { get; set; }

		// Navigation properties
		public ICollection<Habit> CreatedHabits { get; set; } = new List<Habit>();
		public ICollection<UserHabit> UserHabits { get; set; } = new List<UserHabit>();
		public ICollection<Goal> CreatedGoals { get; set; } = new List<Goal>();
		public ICollection<UserGoal> UserGoals { get; set; } = new List<UserGoal>();
	}
}
