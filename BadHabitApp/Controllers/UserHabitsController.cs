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
		public class HabitCreateModel
		{
			public string Name { get; set; } = string.Empty;
			public string Description { get; set; } = string.Empty;
			public decimal? DefaultCostPerOccurrence { get; set; }
			public decimal? DefaultOccurrencesPerDay { get; set; }
		}

		public class UserHabitCreateModel
		{
			public int HabitId { get; set; }
			public decimal? CostPerOccurrence { get; set; }
			public decimal? OccurrencesPerDay { get; set; }
		}

		// POST: api/userhabits
		// Create a new custom habit and associate it with the user
		[HttpPost]
		public async Task<ActionResult<UserHabit>> CreateCustomHabit([FromBody] HabitCreateModel model)
		{
			if (model == null)
			{
				return BadRequest("Habit data is required.");
			}

			// Create the new habit
			var habit = new Habit
			{
				Name = model.Name,
				Description = model.Description,
				DefaultCostPerOccurrence = model.DefaultCostPerOccurrence,
				DefaultOccurrencesPerDay = model.DefaultOccurrencesPerDay,
				IsDefault = false
			};

			_context.Habits.Add(habit);
			await _context.SaveChangesAsync();

			// Associate the habit with the user
			var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			if (string.IsNullOrEmpty(userId))
			{
				return Unauthorized();
			}

			var userHabit = new UserHabit
			{
				UserId = userId,
				HabitId = habit.HabitId,
				StartDate = DateTime.UtcNow,
				IsActive = true,
				CostPerOccurrence = model.DefaultCostPerOccurrence,
				OccurrencesPerDay = model.DefaultOccurrencesPerDay
			};

			_context.UserHabits.Add(userHabit);
			await _context.SaveChangesAsync();

			return CreatedAtAction("GetUserHabit", new { id = userHabit.UserHabitId }, userHabit);
		}

		// POST: api/userhabits/associate
		// Associate an existing habit with the user
		[HttpPost("associate")]
		public async Task<ActionResult<UserHabit>> AssociateHabit([FromBody] UserHabitCreateModel model)
		{
			if (model == null)
			{
				return BadRequest("Habit data is required.");
			}

			// Check if the habit exists
			var habit = await _context.Habits.FindAsync(model.HabitId);
			if (habit == null)
			{
				return NotFound("Habit not found.");
			}

			// Get user ID
			var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			if (string.IsNullOrEmpty(userId))
			{
				return Unauthorized();
			}

			// Check if the user already has this habit
			var existingUserHabit = await _context.UserHabits
				.FirstOrDefaultAsync(uh => uh.UserId == userId && uh.HabitId == model.HabitId);

			if (existingUserHabit != null)
			{
				return BadRequest("User already has this habit associated.");
			}

			userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

			// Associate the habit with the user
			var userHabit = new UserHabit
			{
				UserId = userId,
				HabitId = model.HabitId,
				StartDate = DateTime.UtcNow,
				IsActive = true,
				CostPerOccurrence = model.CostPerOccurrence ?? habit.DefaultCostPerOccurrence,
				OccurrencesPerDay = model.OccurrencesPerDay ?? habit.DefaultOccurrencesPerDay
			};

			_context.UserHabits.Add(userHabit);
			await _context.SaveChangesAsync();

			return CreatedAtAction("GetUserHabit", new { id = userHabit.UserHabitId }, userHabit);
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

			// Optionally, delete the habit if it's custom and not associated with any other user
			var habit = await _context.Habits.FindAsync(userHabit.HabitId);
			if (habit != null && !habit.IsDefault)
			{
				var isHabitUsedByOthers = await _context.UserHabits.AnyAsync(uh => uh.HabitId == habit.HabitId);
				if (!isHabitUsedByOthers)
				{
					_context.Habits.Remove(habit);
					await _context.SaveChangesAsync();
				}
			}

			return NoContent();
		}
	}
}
