using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using BadHabitApp.Controllers;
using BadHabitApp.Models;
using BadHabitApp.Data;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.IO;
using System.Text;
using System;

public class UserHabitsControllerTests
{
	private UserHabitsController _controller;
	private AppDbContext _context;

	public UserHabitsControllerTests()
	{
		var options = new DbContextOptionsBuilder<AppDbContext>()
			.UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Use unique DB for each test
			.Options;

		_context = new AppDbContext(options);
		_controller = new UserHabitsController(_context);

		// Set up HttpContext if needed globally
		// If not, set it up in each test where necessary
	}

	private void SetUserClaims(ControllerBase controller, string userId)
	{
		var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
		{
			new Claim(ClaimTypes.NameIdentifier, userId)
		}, "TestAuthentication"));
		controller.ControllerContext.HttpContext = new DefaultHttpContext { User = user };
	}

	[Fact]
	public async Task CreateUserHabit_ValidModel_ReturnsCreatedAtActionResult()
	{
		// Arrange
		var model = new UserHabitCreateModel
		{
			UserId = "user123",
			AddictionType = "Smoking",
			HabitStartDate = DateTime.UtcNow.AddDays(-30),
			LastRelapseDate = DateTime.UtcNow.AddDays(-5),
			HabitDescription = "Smoking habit",
			UserMotivation = "Health",
			ReasonForLastRelapse = "Stress",
			CostPerOccurrence = 10,
			OccurrencesPerMonth = 20
		};

		// Act
		var result = await _controller.CreateUserHabit(model);

		// Assert
		var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
		var returnValue = Assert.IsType<UserHabit>(createdAtActionResult.Value);
		Assert.Equal("user123", returnValue.UserId);
	}

	[Fact]
	public async Task GetUserHabit_ValidId_ReturnsOkObjectResult()
	{
		// Arrange
		var userId = "user123";
		var habit = new UserHabit
		{
			Id = 1,
			UserId = userId,
			AddictionType = "Smoking"
		};
		_context.UserHabits.Add(habit);
		await _context.SaveChangesAsync();

		SetUserClaims(_controller, userId);

		// Act
		var result = await _controller.GetUserHabit(userId);

		// Assert
		var okResult = Assert.IsType<OkObjectResult>(result.Result);
		var returnValue = Assert.IsType<UserHabit>(okResult.Value);
		Assert.Equal(userId, returnValue.UserId);
	}

	[Fact]
	public async Task LogRelapse_ValidId_ReturnsNoContentResult()
	{
		// Arrange
		var userId = "user123";
		var habit = new UserHabit
		{
			Id = 1,
			UserId = userId,
			AddictionType = "Smoking",
			LastRelapseDate = DateTime.UtcNow.AddDays(-10)
		};
		_context.UserHabits.Add(habit);
		await _context.SaveChangesAsync();

		SetUserClaims(_controller, userId);

		// Simulate the request body
		var reasonForRelapse = "Had a bad day";
		var stream = new MemoryStream(Encoding.UTF8.GetBytes(reasonForRelapse));
		_controller.ControllerContext.HttpContext.Request.Body = stream;

		// Act
		var result = await _controller.LogRelapse(userId);

		// Assert
		Assert.IsType<NoContentResult>(result);
		var updatedHabit = await _context.UserHabits.FirstOrDefaultAsync(h => h.UserId == userId);
		Assert.Equal(reasonForRelapse, updatedHabit.ReasonForLastRelapse);
		Assert.True(updatedHabit.LastRelapseDate >= DateTime.UtcNow.AddMinutes(-1));
	}

	[Fact]
	public async Task DeleteUserHabit_ValidId_ReturnsNoContentResult()
	{
		// Arrange
		var userId = "user123";
		var habit = new UserHabit
		{
			Id = 1,
			UserId = userId,
			AddictionType = "Smoking"
		};
		_context.UserHabits.Add(habit);
		await _context.SaveChangesAsync();

		SetUserClaims(_controller, userId);

		// Act
		var result = await _controller.DeleteUserHabit(userId);

		// Assert
		Assert.IsType<NoContentResult>(result);
		var deletedHabit = await _context.UserHabits.FirstOrDefaultAsync(h => h.UserId == userId);
		Assert.Null(deletedHabit);
	}
}
