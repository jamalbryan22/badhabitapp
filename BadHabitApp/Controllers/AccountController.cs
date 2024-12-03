using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using BadHabitApp.Models;
using BadHabitApp.Data;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;

namespace BadHabitApp.Controllers
{
	[ApiController]
	[Route("[controller]")]
	public class AccountController : ControllerBase
	{
		private readonly UserManager<ApplicationUser> _userManager;
		private readonly IConfiguration _configuration;
		private readonly AppDbContext _context;

		public AccountController(
			UserManager<ApplicationUser> userManager,
			IConfiguration configuration,
			AppDbContext context)
		{
			_userManager = userManager;
			_configuration = configuration;
			_context = context;
		}

		// POST: /account/login
		[HttpPost("login")]
		public async Task<IActionResult> Login([FromBody] LoginModel model)
		{
			// Validate user credentials
			var user = await _userManager.FindByEmailAsync(model.Email);
			if (user != null && await _userManager.CheckPasswordAsync(user, model.Password))
			{
				// Update LastLogin field and save changes
				user.LastLogin = DateTime.UtcNow;
				await _userManager.UpdateAsync(user);

				// Generate JWT token
				var authClaims = new List<Claim>
				{
                    // Add NameIdentifier claim with the user ID
                    new Claim(ClaimTypes.NameIdentifier, user.Id),
					new Claim(ClaimTypes.Name, user.Email ?? string.Empty),
					new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
				};

				var jwtKey = _configuration["Jwt:Key"] ?? throw new ArgumentNullException("Jwt:Key");
				var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

				var token = new JwtSecurityToken(
					issuer: _configuration["Jwt:Issuer"],
					audience: _configuration["Jwt:Audience"],
					expires: DateTime.UtcNow.AddHours(3),
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
			var errors = new List<string>();

			if (model == null)
			{
				errors.Add("Request body cannot be empty or invalid.");
				return BadRequest(new { token = string.Empty, expiration = (DateTime?)null, errors });
			}

			// Validate the model
			if (!TryValidateModel(model))
			{
				errors.AddRange(ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
			}

			// Validate TimeZoneId
			try
			{
				TimeZoneInfo.FindSystemTimeZoneById(model.TimeZoneId);
			}
			catch (TimeZoneNotFoundException)
			{
				errors.Add("Invalid time zone ID.");
			}
			catch (InvalidTimeZoneException)
			{
				errors.Add("Invalid time zone ID.");
			}

			// Check if user already exists
			var userExists = await _userManager.FindByEmailAsync(model.Email).ConfigureAwait(false);
			if (userExists != null)
			{
				errors.Add("User already exists!");
			}

			// Create new user object for validation
			var user = new ApplicationUser
			{
				UserName = model.Email,
				Email = model.Email,
				SecurityStamp = Guid.NewGuid().ToString(),
				TimeZoneId = model.TimeZoneId
			};

			// Validate password
			var passwordValidationResults = new List<IdentityError>();
			foreach (var validator in _userManager.PasswordValidators)
			{
				var result = await validator.ValidateAsync(_userManager, user, model.Password);
				if (!result.Succeeded)
				{
					passwordValidationResults.AddRange(result.Errors);
				}
			}
			if (passwordValidationResults.Any())
			{
				errors.AddRange(passwordValidationResults.Select(e => e.Description));
			}

			// Validate user
			var userValidationResults = new List<IdentityError>();
			foreach (var validator in _userManager.UserValidators)
			{
				var result = await validator.ValidateAsync(_userManager, user);
				if (!result.Succeeded)
				{
					userValidationResults.AddRange(result.Errors);
				}
			}
			if (userValidationResults.Any())
			{
				errors.AddRange(userValidationResults.Select(e => e.Description));
			}

			// Validate the habit model
			var userHabit = new UserHabit
			{
				UserId = user.Id,
				AddictionType = model.AddictionType,
				HabitStartDate = model.HabitStartDate ?? DateTime.UtcNow,
				HabitDescription = model.HabitDescription,
				UserMotivation = model.UserMotivation,
				CostPerOccurrence = model.CostPerOccurrence,
				OccurrencesPerMonth = model.OccurrencesPerMonth,
				GoalType = model.GoalType,
				GoalMetric = model.GoalMetric,
				GoalValue = model.GoalValue
			};

			var habitValidationContext = new ValidationContext(userHabit, null, null);
			var habitValidationResults = new List<ValidationResult>();
			bool isHabitValid = Validator.TryValidateObject(userHabit, habitValidationContext, habitValidationResults, true);

			if (!isHabitValid)
			{
				errors.AddRange(habitValidationResults.Select(e => e.ErrorMessage));
			}

			// If any errors occurred, return them
			if (errors.Count > 0)
			{
				return BadRequest(new
				{
					token = string.Empty,
					expiration = (DateTime?)null,
					errors = errors
				});
			}

			// Begin transaction
			using var transaction = await _context.Database.BeginTransactionAsync();

			try
			{
				// Create new user
				var result = await _userManager.CreateAsync(user, model.Password);

				// Check if user creation was successful
				if (!result.Succeeded)
				{
					// Collect Identity error messages
					errors.AddRange(result.Errors.Select(e => e.Description));

					// Rollback transaction
					await transaction.RollbackAsync();

					return BadRequest(new
					{
						token = string.Empty,
						expiration = (DateTime?)null,
						errors = errors
					});
				}

				// Add user habit
				_context.UserHabits.Add(userHabit);
				await _context.SaveChangesAsync();

				// Commit transaction
				await transaction.CommitAsync();

				return Ok(new
				{
					userId = user.Id
				});
			}
			catch (Exception ex)
			{
				// Rollback transaction in case of error
				await transaction.RollbackAsync();

				// Delete the user if created
				var createdUser = await _userManager.FindByEmailAsync(model.Email);
				if (createdUser != null)
				{
					await _userManager.DeleteAsync(createdUser);
				}

				return StatusCode(StatusCodes.Status500InternalServerError, new
				{
					token = string.Empty,
					expiration = (DateTime?)null,
					errors = new List<string> { "An error occurred during registration.", ex.Message }
				});
			}
		}

		// GET: /account/timezone
		[HttpGet("timezone")]
		[Authorize]
		public async Task<IActionResult> GetUserTimeZone()
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
			if (string.IsNullOrEmpty(userId))
			{
				return Unauthorized();
			}

			var user = await _userManager.FindByIdAsync(userId);
			if (user == null)
			{
				return NotFound();
			}

			return Ok(new { TimeZoneId = user.TimeZoneId });
		}
	}
}
