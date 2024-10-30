using Microsoft.EntityFrameworkCore;
using BadHabitApp.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace BadHabitApp.Data
{
	public class AppDbContext : IdentityDbContext<ApplicationUser>
	{
		public AppDbContext(DbContextOptions<AppDbContext> options)
			: base(options)
		{
		}

		public DbSet<UserHabit> UserHabits { get; set; }

		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			base.OnModelCreating(modelBuilder);
		}
	}
}
