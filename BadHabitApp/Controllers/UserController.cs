using Microsoft.AspNetCore.Mvc;
using BadHabitApp.Services;

namespace BadHabitApp.Controllers {
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase {
        private readonly UserService _userService;
        public UserController(UserService userService) {
            _userService = userService;
        }
        [HttpPost("register")]
        public IActionResult Register(string username, string password) {
            var result = _userService.Register(username, password);
            if(result == "User registered successfully!") {
                return Ok(result);
            } else {
                return BadRequest(result);
            }
        }
        [HttpPost("login")]
        public IActionResult Login(string username, string password) {
            var result = _userService.Login(username, password);
            if(result) {
                return Ok(new { Message = "Login successful", Token = "SomeJWTToken" });
            } else {
                return Unauthorized("Login failed");
            }
        }
    }
}
