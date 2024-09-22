namespace BadHabitApp.Services
{
	public static class ValidationMessages
	{
		public const string InvalidUsernameOrPassword = "Username must be at least 4 characters and password must be at least 8 characters.";
		public const string UsernameExists = "Username already exists.";
		public const string EmailExists = "Email already exists.";
		public const string UserRegistered = "User registered successfully.";
		public const string InvalidEmail = "Invalid email format.";
	}
}
