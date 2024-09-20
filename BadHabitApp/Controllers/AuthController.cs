using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace BadHabitApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        // This method is for user registration
        [HttpPost("register")]
        public async Task<IActionResult> Register(string username, string password)
        {
            // Placeholder logic for registration (we can integrate with a real user service later)
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            {
                return BadRequest("Username or password cannot be empty");
            }

            // Simulate user registration logic
            return Ok(new { message = "User registered successfully!" });
        }

        // This method is for user login
        [HttpPost("login")]
        public async Task<IActionResult> Login(string username, string password)
        {
            // Placeholder logic for login (replace with real authentication logic)
            if (username == "test" && password == "password")
            {
                return Ok(new { token = "fake-jwt-token" });
            }

            return Unauthorized("Invalid credentials");
        }
    }
}
