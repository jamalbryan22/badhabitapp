using Microsoft.AspNetCore.Mvc;
using BadHabitApp.Data;
using BadHabitApp.Models;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace BadHabitApp.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class HabitsController : ControllerBase
	{
		private readonly AppDbContext _context;

		public HabitsController(AppDbContext context)
		{
			_context = context;
		}

		// GET: api/habits/defaults
		[HttpGet("defaults")]
		public async Task<ActionResult<IEnumerable<Habit>>> GetDefaultHabits()
		{
			var defaultHabits = await _context.Habits.Where(h => h.IsDefault).ToListAsync();
			return Ok(defaultHabits);
		}

		// Optionally, GET: api/habits/{id}
		[HttpGet("{id}")]
		public async Task<ActionResult<Habit>> GetHabit(int id)
		{
			var habit = await _context.Habits.FindAsync(id);

			if (habit == null)
			{
				return NotFound();
			}

			return Ok(habit);
		}
	}
}
