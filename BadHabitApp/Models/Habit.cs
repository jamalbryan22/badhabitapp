namespace BadHabitApp.Models
{
	public class Habit
	{
		public int Id { get; set; }
		public string Name { get; set; } = string.Empty;
		public DateTime StartDate { get; set; }
	}
}
