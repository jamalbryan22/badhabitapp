namespace BadHabitApp.Models
{
	public class ApiResponse
	{
		public bool IsSuccess { get; set; }
		public List<string> Messages { get; set; }
		public object? Data { get; set; }  // Optional: to send any additional data like user info

		public ApiResponse(bool isSuccess, List<string> messages, object? data = null)
		{
			IsSuccess = isSuccess;
			Messages = messages;
			Data = data;
		}

		// Constructor for a single message
		public ApiResponse(bool isSuccess, string message, object? data = null)
			: this(isSuccess, new List<string> { message }, data)
		{
		}
	}
}
