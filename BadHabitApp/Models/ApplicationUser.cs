using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace BadHabitApp.Models
{
    public class ApplicationUser : IdentityUser
    {
        public DateTime RegistrationDate { get; set; } = DateTime.UtcNow;

        [DataType(DataType.Date)]
        public DateTime? LastLogin { get; set; }
    }
}
