using Microsoft.AspNetCore.Mvc;
using BadHabitApp.Services;

namespace BadHabitApp.Controllers {
    [ApiController]
    [Route("api/[controller]")]
    public class HabitController : ControllerBase {
    //    private readonly HabitService _habitService;
    //    public HabitController(HabitService habitService) {
    //        _habitService = habitService;
    //    }
    //    [HttpPost("add")]
    //    public IActionResult AddHabit(string username, string habitName) {
    //        var result = _habitService.AddHabit(username, habitName);
    //        return Ok(result);
    //    }
    //    [HttpGet("list/{username}")]
    //    public IActionResult ListHabits(string username) {
    //        var habits = _habitService.ListHabits(username);
    //        return Ok(habits);
    //    }
    //    [HttpDelete("remove")]
    //    public IActionResult RemoveHabit(string username, string habitName) {
    //        var result = _habitService.RemoveHabit(username, habitName);
    //        if(result == "Habit not found.") {
    //            return NotFound(result);
    //        } else {
    //            return Ok(result);
    //        }
    //    }
    }
}
