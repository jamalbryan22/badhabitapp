using System;
using System.Collections.Generic;

namespace BadHabitApp.Services
{
    public class HabitService
    {
        private Dictionary<string, List<Habit>> userHabits = new Dictionary<string, List<Habit>>();

        // Add a new habit for a user
        public string AddHabit(string username, string habitName)
        {
            if (!userHabits.ContainsKey(username))
                userHabits[username] = new List<Habit>();

            userHabits[username].Add(new Habit { Name = habitName, StartDate = DateTime.Now });
            return $"Habit '{habitName}' added for {username}.";
        }

        // List habits for a user
        public List<Habit> ListHabits(string username)
        {
            if (!userHabits.ContainsKey(username))
                return new List<Habit>();

            return userHabits[username];
        }

        // Remove a habit
        public string RemoveHabit(string username, string habitName)
        {
            if (!userHabits.ContainsKey(username) || userHabits[username].RemoveAll(h => h.Name == habitName) == 0)
                return "Habit not found.";

            return $"Habit '{habitName}' removed for {username}.";
        }
    }

    // Habit model
    public class Habit
    {
        public string Name { get; set; }
        public DateTime StartDate { get; set; }
    }
}
