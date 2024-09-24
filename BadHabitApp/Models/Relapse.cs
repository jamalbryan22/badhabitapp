using System;
using System.ComponentModel.DataAnnotations;

namespace BadHabitApp.Models
{
	public class Relapse
	{
		[Key]
		public int Id { get; set; }

		public int UserHabitId { get; set; }

		public DateTime RelapseDate { get; set; }

		public int Quantity { get; set; }

		public string Comments { get; set; } = string.Empty;

/*		// Navigation property
		public UserHabit UserHabit { get; set; }*/
	}
}
