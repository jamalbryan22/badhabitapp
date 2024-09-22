namespace BadHabitApp.Services
{
	public static class ValidationMessages
	{
		public const string UserDoesNotExistOrPasswordIsIncorrect = "User does not exist or password is incorrect.";
		public const string InvalidUsername = "Username must be at least 4 characters.";
		public const string InvalidPassword = "Password must be at least 8 characters.";
		public const string UsernameExists = "Username already exists.";
		public const string EmailExists = "Email already exists.";
		public const string UserRegistered = "User registered successfully.";
		public const string InvalidEmail = "Invalid email format.";
		public const string PasswordMustContainUppercase = "Password must contain at least one uppercase letter.";
		public const string PasswordMustContainLowercase = "Password must contain at least one lowercase letter.";
		public const string PasswordMustContainNumber = "Password must contain at least one number.";
		public const string PasswordMustContainSpecialCharacter = "Password must contain at least one special character.";
		public const string UsernameTooLong = "Username must be less than 20 characters.";
		public const string EmailTooLong = "Email must be less than 254 characters.";
		public const string PasswordTooLong = "Password must be less than 64 characters.";
	}
}
