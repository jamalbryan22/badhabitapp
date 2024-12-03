using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace BadHabitApp.Attributes
{
	public class TimeZoneIdValidationAttribute : ValidationAttribute
	{
		protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
		{
			if (value is not string timeZoneId)
			{
				return new ValidationResult("Time zone ID is required.");
			}

			// Check against system time zones
			var isValid = TimeZoneInfo.GetSystemTimeZones().Any(tz => tz.Id.Equals(timeZoneId, StringComparison.OrdinalIgnoreCase));

			// If not valid, check against IANA to Windows conversion (optional fallback)
			if (!isValid)
			{
				isValid = TryGetTimeZoneById(timeZoneId) != null;
			}

			return isValid ? ValidationResult.Success : new ValidationResult("Invalid time zone ID.");
		}

		private static TimeZoneInfo? TryGetTimeZoneById(string timeZoneId)
		{
			try
			{
				return TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
			}
			catch (TimeZoneNotFoundException)
			{
				return null;
			}
			catch (InvalidTimeZoneException)
			{
				return null;
			}
		}
	}
}
