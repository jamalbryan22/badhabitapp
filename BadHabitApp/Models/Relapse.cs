using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BadHabitApp.Models
{
	public class Relapse
	{
		[Key]
		public int Id { get; set; }

		[Required]
		public int UserHabitId { get; set; }

		[Required]
		public DateTime RelapseDate { get; set; }

		[StringLength(500)]
		public string? Reason { get; set; }
	}
}
