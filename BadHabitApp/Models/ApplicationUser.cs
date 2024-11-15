using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BadHabitApp.Models
{
	public class ApplicationUser : IdentityUser
	{
		public DateTime RegistrationDate { get; set; } = DateTime.UtcNow;

		[DataType(DataType.Date)]
		public DateTime? LastLogin { get; set; }

		[Required]
		[StringLength(10)]
		public string GoalType { get; set; } = "quit";

		[StringLength(5)]
		public string? GoalMetric { get; set; }

		[Column(TypeName = "decimal(10,2)")]
		public decimal? GoalValue { get; set; }
	}
}
