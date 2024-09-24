using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace BadHabitApp.Models
{
	public class User
	{
        protected const int MinUsernameLength = 4;
        protected const int MinPasswordLength = 8;
        protected const int MaxUsernameAndPasswordLenth = 50;

		[Key]
		public int Id { get; set; }

		[Required(ErrorMessage ="Username Required")]
		[StringLength(MaxUsernameAndPasswordLenth, MinimumLength = MinUsernameLength, ErrorMessage = "Username must be between 4 and 50 characters")]
		public string Username { get; set; } = string.Empty;
        
		[Required(ErrorMessage = "Password Required")]
        [StringLength(MaxUsernameAndPasswordLenth, MinimumLength = MinPasswordLength, ErrorMessage = "Password must be between 8 and 50 characters")]
        public string PasswordHash { get; set; } = string.Empty; // Store hashed password

		[EmailAddress(ErrorMessage = "Please enter a valid email address")]
		public string Email { get; set; } = string.Empty;

		public DateTime RegistrationDate { get; set; } = DateTime.UtcNow;

		[DataType(DataType.Date)]
		public DateTime? LastLogin { get; set; }

/*		// Navigation property
		public ICollection<UserHabit> UserHabits { get; set; }*/
	}
}
