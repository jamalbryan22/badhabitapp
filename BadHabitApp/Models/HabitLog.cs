using System.ComponentModel.DataAnnotations;

namespace BadHabitApp.Models
{
    public class HabitLog
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [DataType(DataType.Date)]
        public DateTime DateLogged { get; set; }

        public bool Completed { get; set; }
        //todo: validation on note length?
        public string Notes { get; set; } = string.Empty;
        [Required]
        public int HabitId { get; set; }

        public Habit Habit { get; set; } = null!;
    }
}
