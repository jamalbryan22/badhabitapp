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

		public string Register(string username, string password)
		{
			if (_context.Users.Any(u => u.Username == username))
				return "Username already exists.";

			var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

			var user = new User
			{
				Username = username,
				PasswordHash = hashedPassword
			};

			_context.Users.Add(user);
			_context.SaveChanges();

			return "User registered successfully.";
		}

		public bool Login(string username, string password, out string token)
		{
			token = null;
			var user = _context.Users.SingleOrDefault(u => u.Username == username);

			if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
			{
				return false;
			}

			// Generate JWT token
			token = GenerateJwtToken(user);
			return true;
		}

		public string GenerateJwtToken(User user)
		{
			var tokenHandler = new JwtSecurityTokenHandler();
			var key = Encoding.UTF8.GetBytes("YourSecretKeyHere"); // Use a strong secret key

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
