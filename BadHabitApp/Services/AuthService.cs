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

namespace BadHabitApp.Services
{
	public class AuthService
	{
		private readonly AppDbContext _context;

		public AuthService(AppDbContext context)
		{
			_context = context;
		}

		public string Register(string username, string password, string email)
		{
			if (username.Length < 4 || password.Length < 8)
				return ValidationMessages.InvalidUsernameOrPassword;

			// Check if the username already exists
			if (_context.Users.Any(u => u.Username == username))
				return ValidationMessages.UsernameExists;

			// Check if the email already exists
			if (_context.Users.Any(u => u.Email == email))
				return ValidationMessages.EmailExists;

			// Check if the email is in a valid format
			if (!email.Contains("@") || !email.Contains("."))
				return ValidationMessages.InvalidEmail;

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

			return ValidationMessages.UserRegistered;
		}

		public bool Login(string username, string password, out string? token)
		{
			token = null;

			// Log input
			Console.WriteLine($"Login attempt with Username: {username}");

			var user = _context.Users.SingleOrDefault(u => u.Username == username);

			// Log database lookup result
			if (user == null)
			{
				Console.WriteLine($"No user found with Username: {username}");
				return false;
			}

			if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
			{
				Console.WriteLine($"Invalid password for Username: {username}");
				return false;
			}

			// Generate JWT token
			token = GenerateJwtToken(user);
			user.LastLogin = DateTime.UtcNow;
			_context.SaveChanges();
			Console.WriteLine($"Login successful for Username: {username}");
			return true;
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
