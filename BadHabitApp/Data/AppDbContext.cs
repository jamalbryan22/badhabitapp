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

		// Seed method to add initial data
		/*public static void Seed(AppDbContext context)
		{
			// Seed Users

			var userList = new List<User>
			{
				new User
				{
					Username = "admin",
					PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"), // Admin password
					Email = "admin@admin.net",
					RegistrationDate = DateTime.UtcNow,
					LastLogin = DateTime.UtcNow
				},
				new User
				{
					Username = "ifc21a",
					PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password1!"),
					Email = "igor.couto@example.com",
					RegistrationDate = DateTime.UtcNow.AddDays(-30),
					LastLogin = DateTime.UtcNow.AddHours(-10)
				},
				new User
				{
					Username = "mws19b",
					PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password2@"),
					Email = "matthew.schueder@example.com",
					RegistrationDate = DateTime.UtcNow.AddDays(-25),
					LastLogin = DateTime.UtcNow.AddHours(-5)
				},
				new User
				{
					Username = "jma21c",
					PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password3#"),
					Email = "joey.aschenbrenner@example.com",
					RegistrationDate = DateTime.UtcNow.AddDays(-20),
					LastLogin = DateTime.UtcNow.AddHours(-2)
				},
				new User
				{
					Username = "jb23bf",
					PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password4$"),
					Email = "jamal.bryan@example.com",
					RegistrationDate = DateTime.UtcNow.AddDays(-15),
					LastLogin = DateTime.UtcNow.AddHours(-1)
				},
				// Add more users as needed
			};

			// Check and reseed each user if they don't exist
			foreach (var user in userList)
			{
				if (!context.Users.Any(u => u.Username == user.Username))
				{
					context.Users.Add(user);
				}
			}

			context.SaveChanges();


			// Seed Habits
			if (!context.Habits.Any())
			{
				var habits = new List<Habit>
				{
					new Habit
					{
						HabitName = "Smoking",
						Description = "Smoking cigarettes",
						AverageCostPerOccurrence = 10.00m
					},
					new Habit
					{
						HabitName = "Nail Biting",
						Description = "Biting nails",
						AverageCostPerOccurrence = 0.00m
					},
					new Habit
					{
						HabitName = "Drinking Alcohol",
						Description = "Consuming alcoholic beverages",
						AverageCostPerOccurrence = 5.00m
					},
					new Habit
					{
						HabitName = "Procrastination",
						Description = "Delaying tasks",
						AverageCostPerOccurrence = 0.00m
					},
					new Habit
					{
						HabitName = "Fast Food",
						Description = "Eating unhealthy fast food",
						AverageCostPerOccurrence = 8.00m
					},
					new Habit
					{
						HabitName = "Overspending",
						Description = "Spending more than budgeted",
						AverageCostPerOccurrence = 20.00m
					},
                    // Add more habits as needed
                };

				context.Habits.AddRange(habits);
				context.SaveChanges();
			}

			// Seed UserHabits
			if (!context.UserHabits.Any())
			{
				var users = context.Users.ToList();
				var habits = context.Habits.ToList();

				var userHabits = new List<UserHabit>
				{
					new UserHabit
					{
						UserId = users.First(u => u.Username == "ifc21a").Id,
						HabitId = habits.First(h => h.HabitName == "Smoking").Id,
						StartDate = DateTime.UtcNow.AddDays(-15),
						LastRelapseDate = DateTime.UtcNow.AddDays(-5),
						CostPerOccurrence = 11.00m,
						FrequencyPerDay = 2,
						IsActive = true
					},
					new UserHabit
					{
						UserId = users.First(u => u.Username == "mws19b").Id,
						HabitId = habits.First(h => h.HabitName == "Procrastination").Id,
						StartDate = DateTime.UtcNow.AddDays(-20),
						LastRelapseDate = null,
						CostPerOccurrence = 0.00m,
						FrequencyPerDay = 1,
						IsActive = true
					},
					new UserHabit
					{
						UserId = users.First(u => u.Username == "jma21c").Id,
						HabitId = habits.First(h => h.HabitName == "Fast Food").Id,
						StartDate = DateTime.UtcNow.AddDays(-10),
						LastRelapseDate = DateTime.UtcNow.AddDays(-2),
						CostPerOccurrence = 8.50m,
						FrequencyPerDay = 1,
						IsActive = true
					},
					new UserHabit
					{
						UserId = users.First(u => u.Username == "jb23bf").Id,
						HabitId = habits.First(h => h.HabitName == "Overspending").Id,
						StartDate = DateTime.UtcNow.AddDays(-5),
						LastRelapseDate = DateTime.UtcNow.AddDays(-1),
						CostPerOccurrence = 25.00m,
						FrequencyPerDay = 1,
						IsActive = true
					},
                    // Add more user habits as needed
                };

				context.UserHabits.AddRange(userHabits);
				context.SaveChanges();
			}

			// Seed Relapses
			if (!context.Relapses.Any())
			{
				var userHabits = context.UserHabits.Include(uh => uh.User).Include(uh => uh.Habit).ToList();

				var relapses = new List<Relapse>
				{
					new Relapse
					{
						UserHabitId = userHabits.First(uh => uh.User.Username == "ifc21a" && uh.Habit.HabitName == "Smoking").Id,
						RelapseDate = DateTime.UtcNow.AddDays(-5),
						Quantity = 4,
						Comments = "Smoked during a stressful day"
					},
					new Relapse
					{
						UserHabitId = userHabits.First(uh => uh.User.Username == "jma21c" && uh.Habit.HabitName == "Fast Food").Id,
						RelapseDate = DateTime.UtcNow.AddDays(-2),
						Quantity = 1,
						Comments = "Ate fast food due to time constraints"
					},
					new Relapse
					{
						UserHabitId = userHabits.First(uh => uh.User.Username == "jb23bf" && uh.Habit.HabitName == "Overspending").Id,
						RelapseDate = DateTime.UtcNow.AddDays(-1),
						Quantity = 50,
						Comments = "Bought unnecessary items on sale"
					},
                    // Add more relapses as needed
                };

				context.Relapses.AddRange(relapses);
				context.SaveChanges();
			}

			// Seed Goals
			if (!context.Goals.Any())
			{
				var userHabits = context.UserHabits.Include(uh => uh.User).Include(uh => uh.Habit).ToList();

				var goals = new List<Goal>
				{
					new Goal
					{
						UserHabitId = userHabits.First(uh => uh.User.Username == "ifc21a" && uh.Habit.HabitName == "Smoking").Id,
						GoalType = "TimeWithoutHabit",
						GoalValue = 30, // days
                        AchievedDate = null,
						IsAchieved = false
					},
					new Goal
					{
						UserHabitId = userHabits.First(uh => uh.User.Username == "mws19b" && uh.Habit.HabitName == "Procrastination").Id,
						GoalType = "TasksCompleted",
						GoalValue = 10, // tasks
                        AchievedDate = DateTime.UtcNow.AddDays(-2),
						IsAchieved = true
					},
					new Goal
					{
						UserHabitId = userHabits.First(uh => uh.User.Username == "jma21c" && uh.Habit.HabitName == "Fast Food").Id,
						GoalType = "MoneySaved",
						GoalValue = 50.00m, // dollars
                        AchievedDate = null,
						IsAchieved = false
					},
					new Goal
					{
						UserHabitId = userHabits.First(uh => uh.User.Username == "jb23bf" && uh.Habit.HabitName == "Overspending").Id,
						GoalType = "SpendingLimit",
						GoalValue = 100.00m, // dollars
                        AchievedDate = null,
						IsAchieved = false
					},
                    // Add more goals as needed
                };

				context.Goals.AddRange(goals);
				context.SaveChanges();
			}
		}*/

		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
            base.OnModelCreating(modelBuilder);

/*            // Configure User entity
            modelBuilder.Entity<User>()
				.HasIndex(u => u.Username)
				.IsUnique();

			modelBuilder.Entity<User>()
				.HasIndex(u => u.Email)
				.IsUnique();

			// Configure relationships
			modelBuilder.Entity<UserHabit>()
				.HasOne(uh => uh.User)
				.WithMany(u => u.UserHabits)
				.HasForeignKey(uh => uh.UserId);

			modelBuilder.Entity<UserHabit>()
				.HasOne(uh => uh.Habit)
				.WithMany(h => h.UserHabits)
				.HasForeignKey(uh => uh.HabitId);

			modelBuilder.Entity<Relapse>()
				.HasOne(r => r.UserHabit)
				.WithMany(uh => uh.Relapses)
				.HasForeignKey(r => r.UserHabitId);

			modelBuilder.Entity<Goal>()
				.HasOne(g => g.UserHabit)
				.WithMany(uh => uh.Goals)
				.HasForeignKey(g => g.UserHabitId);

			// Configure decimal precision
			modelBuilder.Entity<Habit>()
				.Property(h => h.AverageCostPerOccurrence)
				.HasColumnType("decimal(18,2)");

			modelBuilder.Entity<UserHabit>()
				.Property(uh => uh.CostPerOccurrence)
				.HasColumnType("decimal(18,2)");

			modelBuilder.Entity<Goal>()
				.Property(g => g.GoalValue)
				.HasColumnType("decimal(18,2)");

			base.OnModelCreating(modelBuilder);*/
		}
	}
}
