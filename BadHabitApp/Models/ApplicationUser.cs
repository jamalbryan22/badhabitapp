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

		// Added TimeZoneId property
		[Required]
		[StringLength(100)]
		public string TimeZoneId { get; set; } = "UTC";
	}
}
