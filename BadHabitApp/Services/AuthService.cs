using System;
using System.Linq;
using BCrypt.Net;
using BadHabitApp.Data;
using BadHabitApp.Models;
using BadHabitApp.Services;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;

namespace BadHabitApp.Services
{
	public class AuthService
	{
		private readonly AppDbContext _context;

		public AuthService(AppDbContext context)
		{
			_context = context;
		}

		public ApiResponse Register(string username, string password, string email)
		{
			List<string> errorMessages = new List<string>();

			if (username.Length < 4)
				errorMessages.Add(ValidationMessages.InvalidUsername);

			if (username.Length > 20)
				errorMessages.Add(ValidationMessages.UsernameTooLong);

			if (email.Length > 254)
				errorMessages.Add(ValidationMessages.EmailTooLong);

			if (password.Length < 8)
				errorMessages.Add(ValidationMessages.InvalidPassword);

			if (password.Length > 64)
				errorMessages.Add(ValidationMessages.PasswordTooLong);

			// check for uppercase, lowercase, number, and special character
			if (!password.Any(char.IsUpper))
				errorMessages.Add(ValidationMessages.PasswordMustContainUppercase);

			if (!password.Any(char.IsLower))
				errorMessages.Add(ValidationMessages.PasswordMustContainLowercase);

			if (!password.Any(char.IsDigit))
				errorMessages.Add(ValidationMessages.PasswordMustContainNumber);

			if (!password.Any(char.IsSymbol) && !password.Any(char.IsPunctuation))
				errorMessages.Add(ValidationMessages.PasswordMustContainSpecialCharacter);


			// Check if the username already exists
			if (_context.Users.Any(u => u.Username == username))
				errorMessages.Add(ValidationMessages.UsernameExists);

			// Check if the email already exists
			if (_context.Users.Any(u => u.Email == email))
				errorMessages.Add(ValidationMessages.EmailExists);

			var emailRegex = new Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$");
			if (!emailRegex.IsMatch(email))
				errorMessages.Add(ValidationMessages.InvalidEmail);

			// If there are any errors, return them
			if (errorMessages.Count > 0)
				return new ApiResponse(false, errorMessages);

			// Hash the password
			var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

			// Create a new user
			var user = new User
			{
				Username = username,
				PasswordHash = hashedPassword,
				Email = email
			};

			// Save the user to the database
			_context.Users.Add(user);
			_context.SaveChanges();

			return new ApiResponse(true, ValidationMessages.UserRegistered);
		}

		public ApiResponse Login(string username, string password, out string? token)
		{
			token = null;

			// Log input
			Console.WriteLine($"Login attempt with Username: {username}");

			var user = _context.Users.SingleOrDefault(u => u.Username == username);

        if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            return new ApiResponse(false, ValidationMessages.UserDoesNotExistOrPasswordIsIncorrect);

			// Generate JWT token
			token = GenerateJwtToken(user);
			user.LastLogin = DateTime.UtcNow;
			_context.SaveChanges();
			Console.WriteLine($"Login successful for Username: {username}");
			return new ApiResponse(true, "Login successful", new { token });
		}

		public string GenerateJwtToken(User user)
		{
			var tokenHandler = new JwtSecurityTokenHandler();
			var key = Encoding.UTF8.GetBytes("ThisisATempSecreteKeyForDevelopmentOnly!!"); // Use a strong secret key

			var tokenDescriptor = new SecurityTokenDescriptor
			{
				Subject = new ClaimsIdentity(new[]
				{
			new Claim("id", user.Id.ToString()),
			new Claim("username", user.Username)
		}),
				Expires = DateTime.UtcNow.AddDays(7),
				SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
			};

			var token = tokenHandler.CreateToken(tokenDescriptor);
			return tokenHandler.WriteToken(token);
		}
	}
}
