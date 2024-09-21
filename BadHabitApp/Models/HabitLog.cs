namespace BadHabitApp.Models
{
    public class HabitLog
    {
        public int Id { get; set; }
        public DateTime DateLogged { get; set; }
        public bool Completed { get; set; }
        public string Notes { get; set; } = string.Empty;
        public int HabitId { get; set; }
        public Habit Habit { get; set; } = null!;
    }
}
