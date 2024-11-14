import { Component, OnInit } from '@angular/core';
import { HabitService, DefaultHabit, UserHabit, Relapse } from '../services/habit.service';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-habits',
  templateUrl: './habits.component.html',
  styleUrls: ['./habits.component.css']
})
export class HabitsComponent implements OnInit {
  defaultHabits: DefaultHabit[] = [];
  userHabits: UserHabit[] = [];
  selectedDefaultHabit: DefaultHabit | null = null;
  newHabit: any = {
    habitId: null,
    name: '',
    description: '',
    costPerOccurrence: null,
    occurrencesPerDay: null
  };
  successMessage: string = ''; // Success message
  errorMessage: string = '';   // Error message
  isModified: boolean = false; // Track if the user modifies the default habit
  isFadingOut: boolean = false; // Track fading state for success message
  habit: any;
  daysSinceLastRelapse: number = 0;
  moneySaved: number = 0;
  currentDate: Date = new Date();
  reasonForRelapse: string = '';
  showRelapseModal: boolean = false;
  recentRelapses: Relapse[] = [];

  constructor(private habitService: HabitService, private authService: AuthService, private http: HttpClient) { }

  ngOnInit(): void {
    this.loadHabit();
  }

  loadHabit(): void {
    const userId = this.authService.getUserID();
    if (!userId) {
      this.errorMessage = 'User not logged in.';
      return;
    }

    this.habitService.getUserHabit(userId).subscribe(
      (habit) => {
        this.habit = habit;
        // Parse each reason in recent relapses
        this.recentRelapses = this.habit.relapses.slice(-5).reverse().map((relapse: Relapse) => {
          try {
            // Try to parse the reason as JSON and extract the 'reason' field
            const parsedReason = JSON.parse(relapse.reason);
            relapse.reason = parsedReason.reason || relapse.reason;
          } catch (error) {
            console.error('Failed to parse reason JSON:', error);
          }
          return relapse;
        });
        this.calculateInsights();
      },
      (error) => {
        console.error('Error loading habit', error);
        this.errorMessage = 'Failed to load habit.';
      }
    );
  }

  calculateInsights(): void {
    if (this.recentRelapses.length > 0) {
      // Get the most recent relapse date
      const lastRelapseDate = new Date(this.recentRelapses[0].relapseDate);

      // Calculate the difference in days between today and the last relapse date
      const timeDiff = this.currentDate.getTime() - lastRelapseDate.getTime();
      this.daysSinceLastRelapse = Math.floor(timeDiff / (1000 * 3600 * 24));

      // Ensure daysSinceLastRelapse is not negative
      if (this.daysSinceLastRelapse < 0) {
        this.daysSinceLastRelapse = 0;
      }

      // Calculate money saved based on the days since the last relapse
      this.moneySaved = this.daysSinceLastRelapse * (this.habit.costPerOccurrence || 0);
    } else {
      // If there are no relapses, assume it has been since the habit start date
      const habitStartDate = new Date(this.habit.habitStartDate);
      const timeDiff = this.currentDate.getTime() - habitStartDate.getTime();
      this.daysSinceLastRelapse = Math.floor(timeDiff / (1000 * 3600 * 24));
      this.moneySaved = this.daysSinceLastRelapse * (this.habit.costPerOccurrence || 0);
    }
  }


  openRelapseModal(): void {
    this.reasonForRelapse = '';
    this.showRelapseModal = true;
  }

  closeRelapseModal(): void {
    this.showRelapseModal = false;
  }

  logRelapse(): void {
    if (!this.habit) {
      return;
    }

    this.habitService.logRelapse(this.habit.id, this.reasonForRelapse).subscribe(
      () => {
        this.successMessage = 'Relapse logged successfully.';
        this.closeRelapseModal();
        this.loadHabit(); // Reload habit data to update insights
      },
      (error) => {
        console.error('Error logging relapse', error);
        this.errorMessage = 'Failed to log relapse.';
      }
    );
  }
 
  populateFormWithDefaultHabit(): void {
    if (this.selectedDefaultHabit) {
      this.isModified = false;  // Reset the modification flag
      this.newHabit = {
        habitId: this.selectedDefaultHabit.habitId,
        name: this.selectedDefaultHabit.name,  // Pre-fill with default values
        description: this.selectedDefaultHabit.description,
        costPerOccurrence: this.selectedDefaultHabit.defaultCostPerOccurrence,
        occurrencesPerDay: this.selectedDefaultHabit.defaultOccurrencesPerDay
      };
    } else {
      this.resetForm();
    }
  }

  // Triggered when the user modifies the habit's name or description
  onHabitModified(): void {
    this.isModified = true;
  }

  saveHabit(): void {
    // Reset messages
    this.errorMessage = '';
    this.successMessage = '';
    this.isFadingOut = false; // Reset fading state

    // If the user modified the default habit, we create a custom habit
    const habitData: any = {
      habitId: this.isModified ? null : this.selectedDefaultHabit ? this.selectedDefaultHabit.habitId : null,
      name: this.isModified ? this.newHabit.name : this.selectedDefaultHabit ? null : this.newHabit.name,
      description: this.isModified ? this.newHabit.description : this.selectedDefaultHabit ? null : this.newHabit.description,
      costPerOccurrence: this.newHabit.costPerOccurrence,
      occurrencesPerDay: this.newHabit.occurrencesPerDay
    };

    if (!habitData.habitId && (!habitData.name || !habitData.name.trim())) {
      this.errorMessage = 'Name is required for custom habits.';
      return;
    }

    this.habitService.createUserHabit(habitData).subscribe(
      (userHabit) => {
        this.userHabits.push(userHabit);
        this.resetForm();
        this.successMessage = 'Habit created and associated successfully.';

        // Start the fade-out after 3 seconds, and fully remove the message after 1 more second (for fade effect)
        setTimeout(() => {
          this.isFadingOut = true;
          setTimeout(() => {
            this.successMessage = '';
            this.isFadingOut = false;
          }, 1000); // Matches the CSS fade-out duration
        }, 3000);
      },
      (error) => {
        console.error('Error creating habit', error);
        this.errorMessage = 'Failed to create habit.';
      }
    );
  }

  resetForm(): void {
    this.newHabit = {
      habitId: null,
      name: '',
      description: '',
      costPerOccurrence: null,
      occurrencesPerDay: null
    };
    this.selectedDefaultHabit = null;
    this.isModified = false;  // Reset the modification flag
    this.errorMessage = '';   // Reset error message
    this.successMessage = ''; // Reset success message
  }

  // TO-DO IMPLEMENT METHOD
  deleteUserHabit(userHabitId: number): void {
    if (!confirm('Are you sure you want to delete this habit?')) {
      return;
    }

    this.habitService.deleteUserHabit(userHabitId).subscribe(
      () => {
        this.userHabits = this.userHabits.filter(uh => uh.userHabitId !== userHabitId);
        this.successMessage = 'Habit deleted successfully.';

        // Start the fade-out after 3 seconds, and fully remove the message after 1 more second
        setTimeout(() => {
          this.isFadingOut = true;
          setTimeout(() => {
            this.successMessage = '';
            this.isFadingOut = false;
          }, 1000); // Matches the CSS fade-out duration
        }, 3000);
      },
      (error) => {
        console.error('Error deleting habit', error);
        this.errorMessage = 'Failed to delete habit.';
      }
    );
  }
}
