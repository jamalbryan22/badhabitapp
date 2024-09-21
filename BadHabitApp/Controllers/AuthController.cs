using Microsoft.AspNetCore.Mvc;
using BadHabitApp.Services;
using BadHabitApp.Models;  // Import your models for login and registration

namespace BadHabitApp.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class AuthController : ControllerBase
	{
		private readonly AuthService _authService;

		public AuthController(AuthService authService)
		{
			_authService = authService;
		}

		// Register endpoint expects a JSON body with username and password
		[HttpPost("register")]
		public IActionResult Register([FromBody] RegisterRequest registerRequest)
		{
			var result = _authService.Register(registerRequest.Username, registerRequest.Password, registerRequest.Email);
			if (result == "Username already exists." || result == "Email already exists.")
				return BadRequest(new { message = result });

			if (result == "Username must be at least 4 characters and password must be at least 8 characters.")
				return BadRequest(new { message = result });

			return Ok(new { message = result });
		}

		// Login endpoint expects a JSON body with username and password
		[HttpPost("login")]
		public IActionResult Login([FromBody] LoginRequest loginRequest)
		{
			if (_authService.Login(loginRequest.Username, loginRequest.Password, out var token))
			{
				Console.WriteLine($"Login successful for {loginRequest.Username}");
				return Ok(new { token });
			}

			Console.WriteLine($"Login failed for {loginRequest.Username}");
			return Unauthorized("Invalid username or password.");
		}
	}
}
