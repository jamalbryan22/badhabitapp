using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BadHabitApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HabitTrackerController : ControllerBase
    {
        // Simulate an in-memory list of habits for tracking
        private static List<string> habits = new List<string>();

        // Add a new habit to track
        [HttpPost("add")]
        public IActionResult AddHabit(string habit)
        {
            if (string.IsNullOrWhiteSpace(habit))
            {
                return BadRequest("Habit cannot be empty");
            }

            habits.Add(habit);
            return Ok(new { message = $"Habit '{habit}' added successfully!" });
        }

        // Get the list of current habits being tracked
        [HttpGet("list")]
        public IActionResult ListHabits()
        {
            return Ok(habits);
        }

        // Remove a habit from tracking
        [HttpDelete("remove")]
        public IActionResult RemoveHabit(string habit)
        {
            if (habits.Contains(habit))
            {
                habits.Remove(habit);
                return Ok(new { message = $"Habit '{habit}' removed successfully!" });
            }

            return NotFound("Habit not found");
        }
    }
}
