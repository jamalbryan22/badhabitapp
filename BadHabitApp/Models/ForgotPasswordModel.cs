using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace BadHabitApp.Models
{
    public class ForgotPasswordModel
    {
        public string Email { get; set; }
    }
}