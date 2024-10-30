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
	[ApiController]
	[Route("api/[controller]")]
	public class UserHabitsController : ControllerBase
	{
		private readonly AppDbContext _context;

		public UserHabitsController(AppDbContext context)
		{
			_context = context;
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

			var userHabit = new UserHabit
			{
   
                UserId = model.UserId,
				AddictionType = model.AddictionType,
				HabitStartDate = model.HabitStartDate,
				LastRelapseDate = model.LastRelapseDate,
				HabitDescription = model.HabitDescription,
				UserMotivation = model.UserMotivation,
				ReasonForLastRelapse = model.ReasonForLastRelapse,

				CostPerOccurrence = model.CostPerOccurrence,
				OccurrencesPerMonth = model.OccurrencesPerMonth

				     

            };

			_context.UserHabits.Add(userHabit);
			await _context.SaveChangesAsync();

			return CreatedAtAction("GetUserHabit", new { id = userHabit.Id }, userHabit);
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
		/*		.Include(uh => uh.Habit)*/
				.FirstOrDefaultAsync(uh => uh.Id == id && uh.UserId == userId);

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
				.FirstOrDefaultAsync(uh => uh.Id == id && uh.UserId == userId);

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
