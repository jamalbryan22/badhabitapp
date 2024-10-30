using System.ComponentModel.DataAnnotations;

namespace BadHabitApp.Models
{
	public class RegisterModel
	{
        [Required(ErrorMessage = "Email is required.")]
		[EmailAddress(ErrorMessage = "Please enter a valid email address.")]
		public string Email { get; set; } = string.Empty;

		[Required]
		public string Password { get; set; } = string.Empty;
	}
}
