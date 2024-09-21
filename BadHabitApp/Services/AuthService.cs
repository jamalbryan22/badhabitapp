using System;
using System.Linq;
using BCrypt.Net;
using BadHabitApp.Data;
using BadHabitApp.Models;
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
				return "Username must be at least 4 characters and password must be at least 8 characters.";

			// Check if the username already exists
			if (_context.Users.Any(u => u.Username == username))
				return "Username already exists.";

			// Check if the email already exists
			if (_context.Users.Any(u => u.Email == email))
			 	return "Email already exists.";

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

			return "User registered successfully.";
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
