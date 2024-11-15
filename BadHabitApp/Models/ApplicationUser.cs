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
	}
}
