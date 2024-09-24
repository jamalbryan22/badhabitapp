using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace BadHabitApp.Models
{
	public class UserHabit
	{
		[Key]
		public int Id { get; set; }

		[Required]
		public int UserId { get; set; }

		[Required]
		public int HabitId { get; set; }

		[Required]
		[DataType(DataType.Date)]
		public DateTime StartDate { get; set; }

		[DataType(DataType.Date)]
		public DateTime? LastRelapseDate { get; set; }

		[Required]
		public decimal CostPerOccurrence { get; set; }

		[Required]
		public int FrequencyPerDay { get; set; }

		[Required]
		public bool IsActive { get; set; } = true;

		/*		// Navigation properties
				public User User { get; set; }
				public Habit Habit { get; set; }
				public ICollection<Relapse> Relapses { get; set; }
				public ICollection<Goal> Goals { get; set; }
			}*/
	}
}
