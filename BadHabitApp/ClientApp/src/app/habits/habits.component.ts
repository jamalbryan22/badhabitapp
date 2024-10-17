import { Component, OnInit } from '@angular/core';
import { HabitService, DefaultHabit, UserHabit } from '../services/habit.service';

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

  constructor(private habitService: HabitService) { }

  ngOnInit(): void {
    this.loadDefaultHabits();
    this.loadUserHabits();
  }

  loadDefaultHabits(): void {
    this.habitService.getDefaultHabits().subscribe(
      (habits) => this.defaultHabits = habits,
      (error) => console.error('Error loading default habits', error)
    );
  }

  loadUserHabits(): void {
    this.habitService.getUserHabits().subscribe(
      (userHabits) => this.userHabits = userHabits,
      (error) => console.error('Error loading user habits', error)
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
