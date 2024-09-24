using System.ComponentModel.DataAnnotations;

namespace BadHabitApp.Models
{
	public class RegisterRequest
	{
        protected const int MinUsernameLength = 4;
        protected const int MinPasswordLength = 8;
        protected const int MaxUsernameAndPasswordLenth = 50;

        [Required(ErrorMessage ="Username Required")]
        [StringLength(MaxUsernameAndPasswordLenth, MinimumLength = MinUsernameLength, ErrorMessage = "Username must be between 4 and 50 characters")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password Required")]
        [StringLength(MaxUsernameAndPasswordLenth, MinimumLength = MinPasswordLength, ErrorMessage = "Password must be between 8 and 50 characters")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email Required")]
        [EmailAddress(ErrorMessage = "Please enter a valid email address")]
        public string Email { get; set; } = string.Empty;
	}
}
