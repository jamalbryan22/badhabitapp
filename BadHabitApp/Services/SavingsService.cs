namespace BadHabitApp.Services
{
    public class SavingsService
    {
        // Calculate savings based on cost per day and days without the habit
        public double CalculateSavings(double costPerDay, int daysWithoutHabit)
        {
            return costPerDay * daysWithoutHabit;
        }
    }
}
