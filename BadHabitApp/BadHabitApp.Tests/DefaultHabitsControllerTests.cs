using Xunit;
using BadHabitApp.Controllers;
using BadHabitApp.Data;
using BadHabitApp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BadHabitApp.Tests.Controllers
{
	public class DefaultHabitsControllerTests
	{
		private readonly DefaultHabitsController _controller;
		private readonly AppDbContext _context;

		public DefaultHabitsControllerTests()
		{
			// Set up in-memory database
			var options = new DbContextOptionsBuilder<AppDbContext>()
						  .UseInMemoryDatabase(databaseName: "TestDatabase")
						  .Options;

			_context = new AppDbContext(options);

			// Clear database before each test
			_context.Database.EnsureDeleted();
			_context.Database.EnsureCreated();

			// Seed test data
			SeedDatabase();

			// Initialize controller with the in-memory context
			_controller = new DefaultHabitsController(_context);
		}

		private void SeedDatabase()
		{
			if (!_context.DefaultHabits.Any()) // Only seed if no data exists
			{
				_context.DefaultHabits.AddRange(new List<DefaultHabit>
				{
					new DefaultHabit { HabitId = 1, Name = "Test Default Habit 1" },
					new DefaultHabit { HabitId = 2, Name = "Test Default Habit 2" },
					new DefaultHabit { HabitId = 3, Name = "Test Default Habit 3" }
				});

				_context.SaveChanges();
			}
		}

		[Fact]
		public async Task GetDefaultHabits_ReturnsOk_WithDefaultHabits()
		{
			// Act
			var result = await _controller.GetDefaultHabits();

			// Assert
			var okResult = Assert.IsType<OkObjectResult>(result.Result);
			var returnHabits = Assert.IsType<List<DefaultHabit>>(okResult.Value);
			Assert.Equal(3, returnHabits.Count);  // We expect 3 default habits
		}

		[Fact]
		public async Task GetHabit_ReturnsNotFound_WhenHabitDoesNotExist()
		{
			// Act
			var result = await _controller.GetHabit(999);  // Non-existent ID

			// Assert
			Assert.IsType<NotFoundResult>(result.Result);
		}

		[Fact]
		public async Task GetHabit_ReturnsOk_WithExistingHabit()
		{
			// Act
			var result = await _controller.GetHabit(1);  // Existing habit

			// Assert
			var okResult = Assert.IsType<OkObjectResult>(result.Result);
			var returnHabit = Assert.IsType<DefaultHabit>(okResult.Value);
			Assert.Equal(1, returnHabit.HabitId);
		}
	}
}
