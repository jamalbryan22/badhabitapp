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
	public class DefaultHabitsController : ControllerBase
	{
		private readonly AppDbContext _context;

		public DefaultHabitsController(AppDbContext context)
		{
			_context = context;
		}

		// GET: api/defaulthabits
		[HttpGet]
		public async Task<ActionResult<IEnumerable<DefaultHabit>>> GetDefaultHabits()
		{
			var defaultHabits = await _context.DefaultHabits.ToListAsync();
			return Ok(defaultHabits);
		}

		// GET: api/defaulthabits/{id}
		[HttpGet("{id}")]
		public async Task<ActionResult<DefaultHabit>> GetHabit(int id)
		{
			var habit = await _context.DefaultHabits.FindAsync(id);

			if (habit == null)
			{
				return NotFound();
			}

			return Ok(habit);
		}
	}
}
