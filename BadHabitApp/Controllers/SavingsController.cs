using Microsoft.AspNetCore.Mvc;
using System;

namespace BadHabitApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SavingsController : ControllerBase
    {
        // Calculate the money saved based on the habit cost and days without the habit
        [HttpGet("calculate")]
        public IActionResult CalculateSavings(double costPerDay, int daysWithoutHabit)
        {
            if (costPerDay <= 0 || daysWithoutHabit < 0)
            {
                return BadRequest("Invalid input values");
            }

            double totalSavings = costPerDay * daysWithoutHabit;
            return Ok(new { totalSavings });
        }
    }
}
