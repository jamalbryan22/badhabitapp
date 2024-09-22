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
		public IActionResult Register([FromBody] RegisterRequest request)
		{
			var response = _authService.Register(request.Username, request.Password, request.Email);
			if (!response.IsSuccess)
				return BadRequest(response);

			return Ok(response);
		}

		// Login endpoint expects a JSON body with username and password
		[HttpPost("login")]
		public IActionResult Login([FromBody] LoginRequest request)
		{
			var response = _authService.Login(request.Username, request.Password, out string? token);
			if (!response.IsSuccess)
				return Unauthorized(response);

			return Ok(response);
		}
	}
}
