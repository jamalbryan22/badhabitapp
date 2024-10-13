using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using BadHabitApp.Models;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;

namespace BadHabitApp.Controllers
{
	[ApiController]
	[Route("[controller]")]
	public class AccountController : ControllerBase
	{
		private readonly UserManager<ApplicationUser> _userManager;
		private readonly IConfiguration _configuration;

		public AccountController(
			UserManager<ApplicationUser> userManager,
			IConfiguration configuration)
		{
			_userManager = userManager;
			_configuration = configuration;
		}

		// POST: /account/login
		[HttpPost("login")]
		public async Task<IActionResult> Login([FromBody] LoginModel model)
		{
			// Validate user credentials
			var user = await _userManager.FindByNameAsync(model.Email);
			if (user != null && await _userManager.CheckPasswordAsync(user, model.Password))
			{
				// Update LastLogin field and save changes
				user.LastLogin = DateTime.Now;
				await _userManager.UpdateAsync(user);

				// Generate JWT token
				var authClaims = new List<Claim>
		{
			// Add NameIdentifier claim with the user ID
			new Claim(ClaimTypes.NameIdentifier, user.Id),
			new Claim(ClaimTypes.Name, user.Email ?? throw new ArgumentNullException(nameof(user.Email))),
			new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
		};

				var jwtKey = _configuration["Jwt:Key"] ?? throw new ArgumentNullException("Jwt:Key");
				var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

				var token = new JwtSecurityToken(
					issuer: _configuration["Jwt:Issuer"],
					audience: _configuration["Jwt:Audience"],
					expires: DateTime.Now.AddHours(3),
					claims: authClaims,
					signingCredentials: new SigningCredentials(
						authSigningKey,
						SecurityAlgorithms.HmacSha256
					)
				);

				return Ok(new
				{
					token = new JwtSecurityTokenHandler().WriteToken(token),
					expiration = token.ValidTo,
					errors = new List<string>() // No errors during successful login
				});
			}

			return Unauthorized();
		}

		// POST: /account/register
		[HttpPost("register")]
		public async Task<IActionResult> Register([FromBody] RegisterModel model)
		{
			// Check if user already exists
			var userExists = await _userManager.FindByEmailAsync(model.Email);
			if (userExists != null)
			{
				return BadRequest(new
				{
					token = string.Empty,
					expiration = (DateTime?)null,
					errors = new List<string> { "User already exists!" }
				});
			}

			// Create new user
			var user = new ApplicationUser
			{
				UserName = model.Email,
				Email = model.Email,
				SecurityStamp = Guid.NewGuid().ToString()
			};
			var result = await _userManager.CreateAsync(user, model.Password);

			// Check if user creation was successful
			if (!result.Succeeded)
			{
				// Collect Identity error messages
				var errors = result.Errors.Select(e => e.Description).ToList();
				return StatusCode(StatusCodes.Status500InternalServerError, new
				{
					token = string.Empty,
					expiration = (DateTime?)null,
					errors = errors
				});
			}

			return Ok(new
			{
				token = string.Empty, // No token generated during registration
				expiration = (DateTime?)null,
				errors = new List<string>() // No errors during successful registration
			});
		}
	}
}
