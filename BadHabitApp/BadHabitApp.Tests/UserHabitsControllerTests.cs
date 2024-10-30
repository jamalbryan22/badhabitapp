/*using Xunit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using BadHabitApp.Controllers;
using BadHabitApp.Data;
using BadHabitApp.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace BadHabitApp.Tests.Controllers
{
	public class UserHabitsControllerTests
	{
		private readonly AppDbContext _context;
		private readonly UserHabitsController _controller;

		public UserHabitsControllerTests()
		{
			var options = new DbContextOptionsBuilder<AppDbContext>()
						  .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Unique DB for each test
						  .Options;

			_context = new AppDbContext(options);

			_controller = new UserHabitsController(_context);
		}

		private void SetUserClaims(string userId)
		{
			var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
			{
				new Claim(ClaimTypes.NameIdentifier, userId)
			}, "mock"));

			_controller.ControllerContext = new ControllerContext
			{
				HttpContext = new DefaultHttpContext { User = user }
			};
		}

		[Fact]
		public async Task GetUserHabits_ReturnsOk_WithUserHabits()
		{
			// Arrange
			var defaultHabit = new DefaultHabit { HabitId = 1, Name = "Test Default Habit" };
			_context.DefaultHabits.Add(defaultHabit);
			await _context.SaveChangesAsync();

			var userHabit = new UserHabit
			{
				UserId = "test-user",
				HabitId = defaultHabit.HabitId,
				StartDate = DateTime.UtcNow,
				IsActive = true
			};
			_context.UserHabits.Add(userHabit);
			await _context.SaveChangesAsync();

			SetUserClaims("test-user");

			// Act
			var result = await _controller.GetUserHabits();

			// Assert
			var okResult = Assert.IsType<OkObjectResult>(result.Result);
			var userHabits = Assert.IsType<List<UserHabit>>(okResult.Value);
			Assert.Single(userHabits); // We expect only one user habit
			Assert.Equal("Test Default Habit", userHabits.First().Habit.Name);
		}

		[Fact]
		public async Task CreateUserHabit_ReturnsCreatedAtAction_WhenCustomHabitIsCreated()
		{
			// Arrange
			var userHabitCreateModel = new UserHabitsController.UserHabitCreateModel
			{
				Name = "Custom Habit",
				Description = "Custom Description",
				CostPerOccurrence = 4.0m,
				OccurrencesPerDay = 2
			};

			SetUserClaims("test-user");

			// Act
			var result = await _controller.CreateUserHabit(userHabitCreateModel);

			// Assert
			var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
			var userHabit = Assert.IsType<UserHabit>(createdAtActionResult.Value);
			Assert.Equal("Custom Habit", userHabit.Name);
			Assert.Equal(4.0m, userHabit.CostPerOccurrence);
			Assert.Equal(2, userHabit.OccurrencesPerDay);
			Assert.Equal("test-user", userHabit.UserId);
		}

		[Fact]
		public async Task AssociateHabit_ReturnsCreatedAtAction_WhenHabitIsAssociated()
		{
			// Arrange
			var defaultHabit = new DefaultHabit
			{
				HabitId = 1,
				Name = "Existing Default Habit",
				DefaultCostPerOccurrence = 5.0m,
				DefaultOccurrencesPerDay = 3
			};
			_context.DefaultHabits.Add(defaultHabit);
			await _context.SaveChangesAsync();

			var userHabitCreateModel = new UserHabitsController.UserHabitCreateModel
			{
				HabitId = defaultHabit.HabitId,
				CostPerOccurrence = 4.0m,
				OccurrencesPerDay = 2
			};

			SetUserClaims("test-user");

			// Act
			var result = await _controller.CreateUserHabit(userHabitCreateModel);

			// Assert
			var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
			var userHabit = Assert.IsType<UserHabit>(createdAtActionResult.Value);
			Assert.Equal(4.0m, userHabit.CostPerOccurrence);
			Assert.Equal(2, userHabit.OccurrencesPerDay);
			Assert.Equal("test-user", userHabit.UserId);
		}

		[Fact]
		public async Task DeleteUserHabit_ReturnsNoContent_WhenHabitIsDeleted()
		{
			// Arrange
			var defaultHabit = new DefaultHabit { HabitId = 1, Name = "Test Default Habit" };
			_context.DefaultHabits.Add(defaultHabit);
			await _context.SaveChangesAsync();

			var userHabit = new UserHabit
			{
				UserId = "test-user",
				HabitId = defaultHabit.HabitId,
				StartDate = DateTime.UtcNow,
				IsActive = true
			};
			_context.UserHabits.Add(userHabit);
			await _context.SaveChangesAsync();

			SetUserClaims("test-user");

			// Act
			var result = await _controller.DeleteUserHabit(userHabit.UserHabitId);

			// Assert
			Assert.IsType<NoContentResult>(result);
			var habitStillExists = await _context.UserHabits.FindAsync(userHabit.UserHabitId);
			Assert.Null(habitStillExists);
		}
	}
}
*/