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
    public class HabitsControllerTests
    {
        private readonly HabitsController _controller;
        private readonly AppDbContext _context;

        public HabitsControllerTests()
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
            _controller = new HabitsController(_context);
        }

        private void SeedDatabase()
        {
            if (!_context.Habits.Any()) // Only seed if no data exists
            {
                _context.Habits.AddRange(new List<Habit>
                {
                    new Habit { HabitId = 1, Name = "Test Habit 1", IsDefault = true },
                    new Habit { HabitId = 2, Name = "Test Habit 2", IsDefault = true },
                    new Habit { HabitId = 3, Name = "Test Habit 3", IsDefault = false }
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
            var returnHabits = Assert.IsType<List<Habit>>(okResult.Value);
            Assert.Equal(10, returnHabits.Count);  // We expect 10 default habits
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
            var returnHabit = Assert.IsType<Habit>(okResult.Value);
            Assert.Equal(1, returnHabit.HabitId);
        }
    }
}
