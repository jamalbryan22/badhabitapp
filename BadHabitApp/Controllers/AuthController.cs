using Microsoft.AspNetCore.Mvc;
using BadHabitApp.Services;

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

		[HttpPost("register")]
		public IActionResult Register(string username, string password)
		{
			var result = _authService.Register(username, password);
			if (result == "Username already exists.")
				return BadRequest(result);

			return Ok(result);
		}

		[HttpPost("login")]
		public IActionResult Login(string username, string password)
		{
			if (_authService.Login(username, password, out var token))
				return Ok(new { token });

			return Unauthorized("Invalid username or password.");
		}
	}
}
