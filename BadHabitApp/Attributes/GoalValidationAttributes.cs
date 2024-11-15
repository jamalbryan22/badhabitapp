using System.ComponentModel.DataAnnotations;
using System.Linq;

public class GoalTypeValidationAttribute : ValidationAttribute
{
	private readonly string[] _allowedValues = { "quit", "reduce" };

	protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
	{
		if (value is string stringValue && _allowedValues.Contains(stringValue))
		{
			return ValidationResult.Success;
		}
		return new ValidationResult("GoalType must be either 'quit' or 'reduce'.");
	}
}

public class GoalMetricValidationAttribute : ValidationAttribute
{
	private readonly string[] _allowedValues = { "freq", "cost", "" };

	protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
	{
		if (value == null || (value is string stringValue && _allowedValues.Contains(stringValue)))
		{
			return ValidationResult.Success;
		}
		return new ValidationResult("GoalMetric must be 'freq', 'cost', or empty.");
	}
}
