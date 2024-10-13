using Microsoft.EntityFrameworkCore;
using BadHabitApp.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace BadHabitApp.Data
{
	public class AppDbContext : IdentityDbContext<ApplicationUser>
	{
		public AppDbContext(DbContextOptions<AppDbContext> options)
			: base(options)
		{
		}

		public DbSet<Habit> Habits { get; set; }
		public DbSet<UserHabit> UserHabits { get; set; }
		public DbSet<Relapse> Relapses { get; set; }
		public DbSet<Goal> Goals { get; set; }
		public DbSet<UserGoal> UserGoals { get; set; }

		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
            base.OnModelCreating(modelBuilder);

			// Configure relationships and constraints

			// Unique constraint on UserHabit: UserId and HabitId
			modelBuilder.Entity<UserHabit>()
				.HasIndex(uh => new { uh.UserId, uh.HabitId })
				.IsUnique();

			// Configure one-to-many relationship between ApplicationUser and UserHabit
			modelBuilder.Entity<UserHabit>()
				.HasOne(uh => uh.User)
				.WithMany(u => u.UserHabits)
				.HasForeignKey(uh => uh.UserId)
				.OnDelete(DeleteBehavior.Cascade);

			// Configure one-to-many relationship between Habit and UserHabit
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
			modelBuilder.Entity<Habit>().HasData(
				new Habit
				{
					HabitId = 1,
					Name = "Smoking",
					Description = "Smoking cigarettes or other tobacco products.",
					DefaultCostPerOccurrence = 0.50m,
					DefaultOccurrencesPerDay = 15,
					IsDefault = true
				},
				new Habit
				{
					HabitId = 2,
					Name = "Nail Biting",
					Description = "Biting your fingernails.",
					DefaultCostPerOccurrence = 0m,
					DefaultOccurrencesPerDay = 20,
					IsDefault = true
				},
				// Add more default habits...
				new Habit
				{
					HabitId = 3,
					Name = "Drinking Soda",
					Description = "Consuming sugary sodas.",
					DefaultCostPerOccurrence = 1.50m,
					DefaultOccurrencesPerDay = 3,
					IsDefault = true
				},
				new Habit
				{
					HabitId = 4,
					Name = "Fast Food Consumption",
					Description = "Eating fast food meals.",
					DefaultCostPerOccurrence = 7.00m,
					DefaultOccurrencesPerDay = 1,
					IsDefault = true
				},
				new Habit
				{
					HabitId = 5,
					Name = "Excessive Screen Time",
					Description = "Spending too much time on screens.",
					DefaultCostPerOccurrence = 0m,
					DefaultOccurrencesPerDay = 5, // hours per day
					IsDefault = true
				},
				new Habit
				{
					HabitId = 6,
					Name = "Skipping Exercise",
					Description = "Not engaging in physical activity.",
					DefaultCostPerOccurrence = 0m,
					DefaultOccurrencesPerDay = 1,
					IsDefault = true
				},
				new Habit
				{
					HabitId = 7,
					Name = "Procrastination",
					Description = "Delaying tasks that need to be done.",
					DefaultCostPerOccurrence = 0m,
					DefaultOccurrencesPerDay = 2,
					IsDefault = true
				},
				new Habit
				{
					HabitId = 8,
					Name = "Impulse Buying",
					Description = "Making unplanned purchases.",
					DefaultCostPerOccurrence = 20.00m,
					DefaultOccurrencesPerDay = 0.5m, // Every other day
					IsDefault = true
				},
				new Habit
				{
					HabitId = 9,
					Name = "Overeating",
					Description = "Consuming more food than necessary.",
					DefaultCostPerOccurrence = 5.00m,
					DefaultOccurrencesPerDay = 1,
					IsDefault = true
				},
				new Habit
				{
					HabitId = 10,
					Name = "Late Night Snacking",
					Description = "Eating snacks late at night.",
					DefaultCostPerOccurrence = 2.00m,
					DefaultOccurrencesPerDay = 1,
					IsDefault = true
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
				new Goal
				{
					GoalId = 2,
					Name = "Reduce Nail Biting",
					Description = "Reduce nail biting occurrences.",
					GoalType = "Reduce",
					IsDefault = true
				},
				new Goal
				{
					GoalId = 3,
					Name = "Limit Soda Intake",
					Description = "Reduce soda consumption to one can per day.",
					GoalType = "Reduce",
					IsDefault = true
				},
				new Goal
				{
					GoalId = 4,
					Name = "Avoid Fast Food",
					Description = "Stop eating fast food.",
					GoalType = "Quit",
					IsDefault = true
				},
				new Goal
				{
					GoalId = 5,
					Name = "Reduce Screen Time",
					Description = "Limit screen time to 2 hours per day.",
					GoalType = "Reduce",
					IsDefault = true
				},
				new Goal
				{
					GoalId = 6,
					Name = "Exercise Regularly",
					Description = "Engage in physical activity 5 times a week.",
					GoalType = "Increase",
					IsDefault = true
				},
				new Goal
				{
					GoalId = 7,
					Name = "Stop Procrastinating",
					Description = "Complete tasks promptly.",
					GoalType = "Improve",
					IsDefault = true
				},
				new Goal
				{
					GoalId = 8,
					Name = "Control Impulse Buying",
					Description = "Only make planned purchases.",
					GoalType = "Quit",
					IsDefault = true
				},
				new Goal
				{
					GoalId = 9,
					Name = "Eat Mindfully",
					Description = "Avoid overeating by eating slowly.",
					GoalType = "Improve",
					IsDefault = true
				},
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
