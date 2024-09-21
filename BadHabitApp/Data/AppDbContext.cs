using Microsoft.EntityFrameworkCore;
using BadHabitApp.Models; // Add this to reference User and Habit models

namespace BadHabitApp.Models
{
	public class AppDbContext : DbContext
	{
		public AppDbContext(DbContextOptions<AppDbContext> options)
			: base(options)
		{
		}

		public DbSet<User> Users { get; set; }
		public DbSet<Habit> Habits { get; set; }
	}
}
