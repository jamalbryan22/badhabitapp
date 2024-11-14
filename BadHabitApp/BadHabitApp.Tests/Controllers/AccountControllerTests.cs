using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using BadHabitApp.Controllers;
using BadHabitApp.Models;
using BadHabitApp.Data;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using System.Linq;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace BadHabitApp.Tests.Controllers
{
	public class AccountControllerTests
	{
		private Mock<UserManager<ApplicationUser>> GetMockUserManager()
		{
			var store = new Mock<IUserStore<ApplicationUser>>();

			var mockUserManager = new Mock<UserManager<ApplicationUser>>(
				store.Object, null, null, null, null, null, null, null, null);

			// Mock Password Validator
			var mockPasswordValidator = new Mock<IPasswordValidator<ApplicationUser>>();
			mockPasswordValidator.Setup(v => v.ValidateAsync(
				It.IsAny<UserManager<ApplicationUser>>(),
				It.IsAny<ApplicationUser>(),
				It.IsAny<string>()))
				.ReturnsAsync(IdentityResult.Success);
			mockUserManager.Object.PasswordValidators.Add(mockPasswordValidator.Object);

			// Mock User Validator
			var mockUserValidator = new Mock<IUserValidator<ApplicationUser>>();
			mockUserValidator.Setup(v => v.ValidateAsync(
				It.IsAny<UserManager<ApplicationUser>>(),
				It.IsAny<ApplicationUser>()))
				.ReturnsAsync(IdentityResult.Success);
			mockUserManager.Object.UserValidators.Add(mockUserValidator.Object);

			return mockUserManager;
		}

		// Implementation of NoopObjectModelValidator
		public class NoopObjectModelValidator : IObjectModelValidator
		{
			public void Validate(ActionContext actionContext, ValidationStateDictionary? validationState, string prefix, object? model)
			{
				// Do nothing
			}
		}

		public class LoginResponse
		{
			public string token { get; set; } = string.Empty;
			public DateTime expiration { get; set; }
			public List<string> errors { get; set; } = new List<string>();
		}

		public class RegisterResponse
		{
			public string userId { get; set; } = string.Empty;
		}

		[Fact]
		public async Task Register_ValidModel_ReturnsUserId()
		{
			// Arrange
			var userEmail = "newuser@example.com";
			var password = "Password123!";
			var userId = Guid.NewGuid().ToString();

			var user = new ApplicationUser
			{
				Id = userId,
				Email = userEmail,
				UserName = userEmail
			};

			var mockUserManager = GetMockUserManager();
			mockUserManager.Setup(um => um.FindByEmailAsync(userEmail))
						   .ReturnsAsync((ApplicationUser?)null);
			mockUserManager.Setup(um => um.CreateAsync(It.IsAny<ApplicationUser>(), password))
						   .ReturnsAsync(IdentityResult.Success)
						   .Callback<ApplicationUser, string>((newUser, pwd) => newUser.Id = userId);

			var configuration = new ConfigurationBuilder().Build();

			var options = new DbContextOptionsBuilder<AppDbContext>()
				.UseInMemoryDatabase(databaseName: "RegisterTest")
				.ConfigureWarnings(x => x.Ignore(InMemoryEventId.TransactionIgnoredWarning)) // Suppress the transaction warning
				.Options;
			var context = new AppDbContext(options);

			var controller = new AccountController(mockUserManager.Object, configuration, context);
			controller.ObjectValidator = new NoopObjectModelValidator();

			var registerModel = new RegisterModel
			{
				Email = userEmail,
				Password = password,
				AddictionType = "Smoking",
				HabitStartDate = DateTime.UtcNow.AddDays(-30),
				HabitDescription = "Smoking habit",
				UserMotivation = "Health",
				CostPerOccurrence = 10,
				OccurrencesPerMonth = 20
			};

			// Act
			var result = await controller.Register(registerModel);

			// Assert
			var okResult = Assert.IsType<OkObjectResult>(result);
			var response = okResult.Value;
			var responseJson = JsonSerializer.Serialize(response);
			var registerResponse = JsonSerializer.Deserialize<RegisterResponse>(responseJson);

			Assert.Equal(userId, registerResponse?.userId);
		}

		[Fact]
		public async Task Login_InvalidCredentials_ReturnsUnauthorized()
		{
			// Arrange
			var userEmail = "test@example.com";
			var password = "WrongPassword";
			var user = new ApplicationUser
			{
				Id = Guid.NewGuid().ToString(),
				Email = userEmail,
				UserName = userEmail
			};

			var mockUserManager = GetMockUserManager();
			mockUserManager.Setup(um => um.FindByEmailAsync(userEmail))
						   .ReturnsAsync(user);
			mockUserManager.Setup(um => um.CheckPasswordAsync(user, password))
						   .ReturnsAsync(false);

			var configuration = new ConfigurationBuilder().Build();
			var options = new DbContextOptionsBuilder<AppDbContext>()
				.UseInMemoryDatabase(databaseName: "LoginInvalidTest")
				.Options;
			var context = new AppDbContext(options);

			var controller = new AccountController(mockUserManager.Object, configuration, context);
			controller.ObjectValidator = new NoopObjectModelValidator();

			var loginModel = new LoginModel
			{
				Email = userEmail,
				Password = password
			};

			// Act
			var result = await controller.Login(loginModel);

			// Assert
			Assert.IsType<UnauthorizedResult>(result);
		}

		[Fact]
		public async Task Register_UserAlreadyExists_ReturnsBadRequest()
		{
			// Arrange
			var userEmail = "existinguser@example.com";
			var password = "Password123!";

			var user = new ApplicationUser
			{
				Id = Guid.NewGuid().ToString(),
				Email = userEmail,
				UserName = userEmail
			};

			var mockUserManager = GetMockUserManager();
			mockUserManager.Setup(um => um.FindByEmailAsync(userEmail))
						   .ReturnsAsync(user);

			var configuration = new ConfigurationBuilder().Build();
			var options = new DbContextOptionsBuilder<AppDbContext>()
				.UseInMemoryDatabase(databaseName: "RegisterUserExistsTest")
				.Options;
			var context = new AppDbContext(options);

			var controller = new AccountController(mockUserManager.Object, configuration, context);
			controller.ObjectValidator = new NoopObjectModelValidator();

			var registerModel = new RegisterModel
			{
				Email = userEmail,
				Password = password,
				AddictionType = "Smoking",
				HabitStartDate = DateTime.UtcNow.AddDays(-30),
				HabitDescription = "Smoking habit",
				UserMotivation = "Health",
				CostPerOccurrence = 10,
				OccurrencesPerMonth = 20
			};

			// Act
			var result = await controller.Register(registerModel);

			// Assert
			var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
			var response = badRequestResult.Value;
			var responseJson = JsonSerializer.Serialize(response);
			var errorResponse = JsonSerializer.Deserialize<Dictionary<string, object>>(responseJson);

			Assert.True(errorResponse?.ContainsKey("errors"));
			var errors = errorResponse?["errors"] as JsonElement?;
			Assert.Contains("User already exists!", errors?.EnumerateArray().Select(e => e.GetString()));
		}

		[Fact]
		public async Task Register_InvalidModel_ReturnsBadRequest()
		{
			// Arrange
			var mockUserManager = GetMockUserManager();
			var configuration = new ConfigurationBuilder().Build();
			var options = new DbContextOptionsBuilder<AppDbContext>()
				.UseInMemoryDatabase(databaseName: "RegisterInvalidModelTest")
				.Options;
			var context = new AppDbContext(options);

			var controller = new AccountController(mockUserManager.Object, configuration, context);
			controller.ObjectValidator = new NoopObjectModelValidator();
			controller.ModelState.AddModelError("Email", "Email is required.");

			var registerModel = new RegisterModel
			{
				// Missing Email
				Password = "Password123!",
				AddictionType = "Smoking",
				HabitStartDate = DateTime.UtcNow.AddDays(-30),
				HabitDescription = "Smoking habit",
				UserMotivation = "Health",
				CostPerOccurrence = 10,
				OccurrencesPerMonth = 20
			};

			// Act
			var result = await controller.Register(registerModel);

			// Assert
			var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
			var response = badRequestResult.Value;
			var responseJson = JsonSerializer.Serialize(response);
			var errorResponse = JsonSerializer.Deserialize<Dictionary<string, object>>(responseJson);

			Assert.True(errorResponse?.ContainsKey("errors"));
			var errors = errorResponse?["errors"] as JsonElement?;
			Assert.Contains("Email is required.", errors?.EnumerateArray().Select(e => e.GetString()));
		}
	}
}
