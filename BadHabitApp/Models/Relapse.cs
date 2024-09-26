using System.ComponentModel.DataAnnotations;

namespace BadHabitApp.Models
{
	public class Relapse
	{
		[Key]
		public int RelapseId { get; set; }

		[Required]
		public int UserHabitId { get; set; }

		[Required]
		public DateTime DateTime { get; set; }

		// Navigation property
		public UserHabit UserHabit { get; set; } = new UserHabit();
	}
}
