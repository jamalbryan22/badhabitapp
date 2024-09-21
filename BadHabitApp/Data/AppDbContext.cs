using Microsoft.EntityFrameworkCore;
using BadHabitApp.Models; // Add this to reference User and Habit models

namespace BadHabitApp.Data
{
	public class AppDbContext : DbContext
	{
		public AppDbContext(DbContextOptions<AppDbContext> options)
			: base(options)
		{
		}

		public DbSet<User> Users { get; set; }
		public DbSet<Habit> Habits { get; set; }

		// Seed method to add initial data
		public static void Seed(AppDbContext context)
		{
			if (!context.Users.Any())
			{
				context.Users.Add(new User
				{
					Username = "admin",
					PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"), // Admin password
					Email = "admin@admin.net"
				});

				context.SaveChanges();
			}
		}
	}
}
