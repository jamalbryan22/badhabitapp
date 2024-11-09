using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace BadHabitApp.Models
{
    public class ResetPasswordModel
    {
        public string Email { get; set; }
        public string Token { get; set; }
        public string NewPassword { get; set; }
    }
}