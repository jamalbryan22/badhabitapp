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

		public DbSet<DefaultHabit> DefaultHabits { get; set; }
		public DbSet<UserHabit> UserHabits { get; set; }
		public DbSet<Relapse> Relapses { get; set; }
		public DbSet<Goal> Goals { get; set; }
		public DbSet<UserGoal> UserGoals { get; set; }

		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			base.OnModelCreating(modelBuilder);

			// Configure relationships and constraints

			// Configure one-to-many relationship between ApplicationUser and UserHabit
			modelBuilder.Entity<UserHabit>()
				.HasOne(uh => uh.User)
				.WithMany(u => u.UserHabits)
				.HasForeignKey(uh => uh.UserId)
				.OnDelete(DeleteBehavior.Cascade);

			// Configure optional relationship between UserHabit and DefaultHabit
			modelBuilder.Entity<UserHabit>()
				.HasOne(uh => uh.Habit)
				.WithMany(h => h.UserHabits)
				.HasForeignKey(uh => uh.HabitId)
				.OnDelete(DeleteBehavior.Cascade);

			// Configure one-to-many relationship between UserHabit and Relapse
			modelBuilder.Entity<Relapse>()
				.HasOne(r => r.UserHabit)
				.WithMany(uh => uh.Relapses)
				.HasForeignKey(r => r.UserHabitId)
				.OnDelete(DeleteBehavior.Cascade);

			// Configure one-to-many relationship between ApplicationUser and UserGoal
			modelBuilder.Entity<UserGoal>()
				.HasOne(ug => ug.User)
				.WithMany(u => u.UserGoals)
				.HasForeignKey(ug => ug.UserId)
				.OnDelete(DeleteBehavior.Cascade);

			// Configure relationships in UserGoal
			modelBuilder.Entity<UserGoal>()
				.HasOne(ug => ug.Goal)
				.WithMany(g => g.UserGoals)
				.HasForeignKey(ug => ug.GoalId)
				.OnDelete(DeleteBehavior.Cascade);

			// Resolve multiple cascade paths by using DeleteBehavior.NoAction for UserHabit in UserGoal
			modelBuilder.Entity<UserGoal>()
				.HasOne(ug => ug.UserHabit)
				.WithMany(uh => uh.UserGoals)
				.HasForeignKey(ug => ug.UserHabitId)
				.OnDelete(DeleteBehavior.NoAction);  // Use NoAction to prevent cascade path conflict

			// Seed Default Habits
			modelBuilder.Entity<DefaultHabit>().HasData(
				new DefaultHabit
				{
					HabitId = 1,
					Name = "Smoking",
					Description = "Smoking cigarettes or other tobacco products.",
					DefaultCostPerOccurrence = 0.50m,
					DefaultOccurrencesPerDay = 15
				},
				// Add more default habits as needed
				new DefaultHabit
				{
					HabitId = 2,
					Name = "Nail Biting",
					Description = "Biting your fingernails.",
					DefaultCostPerOccurrence = 0m,
					DefaultOccurrencesPerDay = 20
				},
				// ... (other default habits)
				new DefaultHabit
				{
					HabitId = 10,
					Name = "Late Night Snacking",
					Description = "Eating snacks late at night.",
					DefaultCostPerOccurrence = 2.00m,
					DefaultOccurrencesPerDay = 1
				}
			);

			// Seed Default Goals
			modelBuilder.Entity<Goal>().HasData(
				new Goal
				{
					GoalId = 1,
					Name = "Quit Smoking",
					Description = "Completely stop smoking.",
					GoalType = "Quit",
					IsDefault = true
				},
				// ... (other default goals)
				new Goal
				{
					GoalId = 10,
					Name = "Stop Late Night Snacking",
					Description = "Avoid eating after 8 PM.",
					GoalType = "Quit",
					IsDefault = true
				}
			);
		}
	}
}
