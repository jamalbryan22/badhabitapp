using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using BadHabitApp.Models;
using BadHabitApp.Data;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations;
using Azure.Core;
using System;

namespace BadHabitApp.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly AppDbContext _context;

        public AccountController(
            UserManager<ApplicationUser> userManager,
            IConfiguration configuration,
            AppDbContext context)
        {
            _userManager = userManager;
            _configuration = configuration;
            _context = context;
        }

        // POST: /account/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            // Validate user credentials
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user != null && await _userManager.CheckPasswordAsync(user, model.Password))
            {
                // Update LastLogin field and save changes
                user.LastLogin = DateTime.Now;
                await _userManager.UpdateAsync(user);

                // Generate JWT token
                var authClaims = new List<Claim>
                {
                    new(ClaimTypes.NameIdentifier, user.Id),
                    new(ClaimTypes.Name, user.Email ?? throw new ArgumentNullException(nameof(user.Email))),
                    new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                };

                var jwtKey = _configuration["Jwt:Key"] ?? throw new ArgumentNullException(nameof(_configuration), "Jwt:Key is missing in the configuration.");
                var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

                var token = new JwtSecurityToken(
                    issuer: _configuration["Jwt:Issuer"],
                    audience: _configuration["Jwt:Audience"],
                    expires: DateTime.Now.AddHours(3),
                    claims: authClaims,
                    signingCredentials: new SigningCredentials(
                        authSigningKey,
                        SecurityAlgorithms.HmacSha256
                    )
                );

                return Ok(new
                {
                    token = new JwtSecurityTokenHandler().WriteToken(token),
                    expiration = token.ValidTo,
                    errors = new List<string>() // No errors during successful login
                });
            }

            return Unauthorized();
        }

        // POST: /account/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            var errors = new List<string>();

            if (model == null)
            {
                errors.Add("Request body cannot be empty or invalid.");
                return BadRequest(new { token = string.Empty, expiration = (DateTime?)null, errors });
            }

            // Validate the model
            if (!TryValidateModel(model))
            {
                errors.AddRange(ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).Where(e => e != null)!);
            }

            // Check if user already exists
            var userExists = await _userManager.FindByEmailAsync(model.Email).ConfigureAwait(false);
            if (userExists != null)
            {
                errors.Add("User already exists!");
            }

            // Create new user object for validation
            var user = new ApplicationUser
            {
                UserName = model.Email,
                Email = model.Email,
                SecurityStamp = Guid.NewGuid().ToString()
            };

            // Validate password
            var passwordValidationResults = new List<IdentityError>();
            foreach (var validator in _userManager.PasswordValidators)
            {
                var result = await validator.ValidateAsync(_userManager, user, model.Password);
                if (!result.Succeeded)
                {
                    passwordValidationResults.AddRange(result.Errors);
                }
            }
            if (passwordValidationResults.Count > 0)
            {
                errors.AddRange(passwordValidationResults.Select(e => e.Description).Where(e => e != null)!);
            }

            // Validate user
            var userValidationResults = new List<IdentityError>();
            foreach (var validator in _userManager.UserValidators)
            {
                var result = await validator.ValidateAsync(_userManager, user);
                if (!result.Succeeded)
                {
                    userValidationResults.AddRange(result.Errors);
                }
            }
            if (userValidationResults.Count > 0)
            {
                errors.AddRange(userValidationResults.Select(e => e.Description).Where(e => e != null)!);
            }

            // Validate the habit model
            if (model.HabitStartDate == null || model.LastRelapseDate == null)
            {
                errors.Add("HabitStartDate and LastRelapseDate cannot be null.");
                return BadRequest(new { Errors = errors });
            }

            var userHabit = new UserHabit
            {
                UserId = user.Id,
                AddictionType = model.AddictionType,
                HabitStartDate = model.HabitStartDate.Value,
                LastRelapseDate = model.LastRelapseDate.Value,
                HabitDescription = model.HabitDescription,
                UserMotivation = model.UserMotivation,
                ReasonForLastRelapse = model.ReasonForLastRelapse,
                CostPerOccurrence = model.CostPerOccurrence,
                OccurrencesPerMonth = model.OccurrencesPerMonth
            };

            var habitValidationContext = new ValidationContext(userHabit, null, null);
            var habitValidationResults = new List<ValidationResult>();
            bool isHabitValid = Validator.TryValidateObject(userHabit, habitValidationContext, habitValidationResults, true);

            if (!isHabitValid)
            {
                errors.AddRange(habitValidationResults.Select(e => e.ErrorMessage).Where(e => e != null)!);
            }

            if (errors.Count > 0)
            {
                return BadRequest(new
                {
                    token = string.Empty,
                    expiration = (DateTime?)null,
                    errors = errors
                });
            }

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var result = await _userManager.CreateAsync(user, model.Password);

                if (!result.Succeeded)
                {
                    errors.AddRange(result.Errors.Select(e => e.Description).Where(e => e != null)!);
                    await transaction.RollbackAsync();

                    return BadRequest(new
                    {
                        token = string.Empty,
                        expiration = (DateTime?)null,
                        errors = errors
                    });
                }

                _context.UserHabits.Add(userHabit);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return Ok(new { userId = user.Id });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();

                var createdUser = await _userManager.FindByEmailAsync(model.Email);
                if (createdUser != null)
                {
                    await _userManager.DeleteAsync(createdUser);
                }

                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    token = string.Empty,
                    expiration = (DateTime?)null,
                    errors = new List<string> { "An error occurred during registration.", ex.Message }
                });
            }
        }

        // POST: /account/forgot-password
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordModel model)
        {
            if (ModelState.IsValid)
            {
                var user = await _userManager.FindByEmailAsync(model.Email);
                if (user == null)
                {
                    return Ok(new { Message = "If the email exists, a password reset link has been generated." });
                }

                var token = await _userManager.GeneratePasswordResetTokenAsync(user);

                var resetLink = Url.Action("ResetPasswordPage", "Account", new { token, email = user.Email }, Request.Scheme);

                return Ok(new { Message = "If the email exists, a password reset link has been generated.", ResetLink = resetLink });
            }

            return BadRequest(ModelState);
        }

        // POST: /account/reset-password
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordModel model)
        {
            var errors = new List<string>();

            if (model == null)
            {
                errors.Add("Request body cannot be empty or invalid.");
                return BadRequest(new { Message = "Invalid request.", Errors = errors });
            }

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                errors.Add("Invalid request.");
                return BadRequest(new { Errors = errors });
            }

            var passwordValidationResults = new List<IdentityError>();
            foreach (var validator in _userManager.PasswordValidators)
            {
                var result = await validator.ValidateAsync(_userManager, user, model.NewPassword);
                if (!result.Succeeded)
                {
                    passwordValidationResults.AddRange(result.Errors);
                }
            }
            if (passwordValidationResults.Count > 0)
            {
                errors.AddRange(passwordValidationResults.Select(e => e.Description).Where(e => e != null)!);
            }

            if (errors.Count > 0)
            {
                return BadRequest(new { Message = "Password reset failed.", Errors = errors });
            }

            var resetPassResult = await _userManager.ResetPasswordAsync(user, model.Token, model.NewPassword);
            if (!resetPassResult.Succeeded)
            {
                errors.AddRange(resetPassResult.Errors.Select(e => e.Description).Where(e => e != null)!);
                return BadRequest(new { Message = "Password reset failed.", Errors = errors });
            }

            return Ok(new { Message = "Password has been reset successfully." });
        }
    }
}
