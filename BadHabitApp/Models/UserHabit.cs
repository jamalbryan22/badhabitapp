using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BadHabitApp.Models
{
	public class UserHabit
	{
		[Key]
        public int Id { get; set; }

		[Required]
		public string UserId { get; set; } = string.Empty;

		// Fields for custom habits
		//TO-DO: Make Enum
		[StringLength(100)]
		public string AddictionType { get; set; } = string.Empty;

        [Required]
		public DateTime HabitStartDate { get; set; }

        [Required]
        public DateTime LastRelapseDate { get; set; }

		[StringLength(500)]
		public string? HabitDescription { get; set; } = string.Empty;

        [StringLength(500)]
        public string? UserMotivation { get; set; } = string.Empty;

        [StringLength(500)]
        public string? ReasonForLastRelapse { get; set; } = string.Empty;

        [Column(TypeName = "decimal(10,2)")]
		public decimal? CostPerOccurrence { get; set; }

		[Column(TypeName = "decimal(10,2)")]
		public decimal? OccurrencesPerMonth { get; set; }
	}
}
