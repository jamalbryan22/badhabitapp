using System.Collections.Generic;
using System.Linq;

namespace BadHabitApp.Services
{
    public class UserService
    {
        private List<User> users = new List<User>();

        // Simulate user registration
        public string Register(string username, string password)
        {
            if (users.Any(u => u.Username == username))
                return "Username already exists!";

            users.Add(new User { Username = username, Password = password });
            return "User registered successfully!";
        }

        // Simulate user login
        public bool Login(string username, string password)
        {
            return users.Any(u => u.Username == username && u.Password == password);
        }
    }

    // Simple User Model (to be moved to a models folder if needed)
    public class User
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }
}
