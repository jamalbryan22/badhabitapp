using Microsoft.AspNetCore.Mvc;
using BadHabitApp.Data;
using BadHabitApp.Models;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace BadHabitApp.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	[Authorize]
	public class UserHabitsController : ControllerBase
	{
		private readonly AppDbContext _context;

		public UserHabitsController(AppDbContext context)
		{
			_context = context;
		}

		// Model classes for incoming data
		public class UserHabitCreateModel
		{
			public int? HabitId { get; set; }  // Nullable for custom habits
			public string? Name { get; set; } = string.Empty;  // For custom habits
			public string? Description { get; set; } = string.Empty;  // For custom habits
			public decimal? CostPerOccurrence { get; set; }
			public decimal? OccurrencesPerDay { get; set; }
		}

		// POST: api/userhabits
		// Create a new custom habit or associate an existing default habit with the user
		[HttpPost]
		public async Task<ActionResult<UserHabit>> CreateUserHabit([FromBody] UserHabitCreateModel model)
		{
			if (!ModelState.IsValid)
			{
				return ValidationProblem(ModelState);
			}

			if (model == null)
			{
				return BadRequest("Habit data is required.");
			}

			// Check if we are associating a default habit
			if (model.HabitId.HasValue)
			{
				// Fetch the default habit from the database
				var habit = await _context.DefaultHabits.FindAsync(model.HabitId.Value);
				if (habit == null)
				{
					return NotFound("Habit not found.");
				}

				// Associate the default habit with the user
				var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
				if (string.IsNullOrEmpty(userId))
				{
					return Unauthorized();
				}

				// Check if the user already has this habit associated
				var existingUserHabit = await _context.UserHabits
					.FirstOrDefaultAsync(uh => uh.UserId == userId && uh.HabitId == model.HabitId);

				if (existingUserHabit != null)
				{
					return BadRequest("User already has this habit associated.");
				}

				var userHabit = new UserHabit
				{
					UserId = userId,
					HabitId = model.HabitId.Value,  // Associate the default habit
					StartDate = DateTime.UtcNow,
					IsActive = true,
					CostPerOccurrence = model.CostPerOccurrence ?? habit.DefaultCostPerOccurrence,
					OccurrencesPerDay = model.OccurrencesPerDay ?? habit.DefaultOccurrencesPerDay
				};

				_context.UserHabits.Add(userHabit);
				await _context.SaveChangesAsync();

				return CreatedAtAction("GetUserHabit", new { id = userHabit.UserHabitId }, userHabit);
			}
			else
			{
				// Custom habit creation - validate Name and Description
				if (string.IsNullOrWhiteSpace(model.Name))
				{
					ModelState.AddModelError(nameof(model.Name), "The Name field is required.");
				}
				if (string.IsNullOrWhiteSpace(model.Description))
				{
					ModelState.AddModelError(nameof(model.Description), "The Description field is required.");
				}

				if (!ModelState.IsValid)
				{
					return ValidationProblem(ModelState);
				}

				// Create custom habit
				var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
				if (string.IsNullOrEmpty(userId))
				{
					return Unauthorized();
				}

				var userHabit = new UserHabit
				{
					UserId = userId,
					Name = model.Name,
					Description = model.Description,
					StartDate = DateTime.UtcNow,
					IsActive = true,
					CostPerOccurrence = model.CostPerOccurrence,
					OccurrencesPerDay = model.OccurrencesPerDay
				};

				_context.UserHabits.Add(userHabit);
				await _context.SaveChangesAsync();

				return CreatedAtAction("GetUserHabit", new { id = userHabit.UserHabitId }, userHabit);
			}
		}

		// GET: api/userhabits
		// Return a list of habits associated with the user
		[HttpGet]
		public async Task<ActionResult<IEnumerable<UserHabit>>> GetUserHabits()
		{
			var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			if (string.IsNullOrEmpty(userId))
			{
				return Unauthorized();
			}

			var userHabits = await _context.UserHabits
				.Include(uh => uh.Habit)
				.Where(uh => uh.UserId == userId)
				.ToListAsync();

			return Ok(userHabits);
		}

		// GET: api/userhabits/{id}
		[HttpGet("{id}")]
		public async Task<ActionResult<UserHabit>> GetUserHabit(int id)
		{
			var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			if (string.IsNullOrEmpty(userId))
			{
				return Unauthorized();
			}

			var userHabit = await _context.UserHabits
				.Include(uh => uh.Habit)
				.FirstOrDefaultAsync(uh => uh.UserHabitId == id && uh.UserId == userId);

			if (userHabit == null)
			{
				return NotFound();
			}

			return Ok(userHabit);
		}

		// DELETE: api/userhabits/{id}
		// Delete a habit associated with the user
		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteUserHabit(int id)
		{
			var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			if (string.IsNullOrEmpty(userId))
			{
				return Unauthorized();
			}

			var userHabit = await _context.UserHabits
				.FirstOrDefaultAsync(uh => uh.UserHabitId == id && uh.UserId == userId);

			if (userHabit == null)
			{
				return NotFound();
			}

			// Remove the UserHabit
			_context.UserHabits.Remove(userHabit);
			await _context.SaveChangesAsync();

			return NoContent();
		}
	}
}
