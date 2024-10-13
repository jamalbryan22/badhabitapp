import { Component, OnInit } from '@angular/core';
import { HabitService, Habit, UserHabit } from '../services/habit.service';

@Component({
  selector: 'app-habits',
  templateUrl: './habits.component.html',
  styleUrls: ['./habits.component.css']
})
export class HabitsComponent implements OnInit {
  defaultHabits: Habit[] = [];
  userHabits: UserHabit[] = [];
  selectedDefaultHabit: Habit | null = null;
  newHabit: any = {
    name: '',
    description: '',
    defaultCostPerOccurrence: null,
    defaultOccurrencesPerDay: null
  };
  errorMessage: string = '';

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
      this.newHabit = {
        name: this.selectedDefaultHabit.name,
        description: this.selectedDefaultHabit.description,
        defaultCostPerOccurrence: this.selectedDefaultHabit.defaultCostPerOccurrence,
        defaultOccurrencesPerDay: this.selectedDefaultHabit.defaultOccurrencesPerDay
      };
    } else {
      this.resetForm();
    }
  }

  saveHabit(): void {
    if (!this.newHabit.name.trim()) {
      this.errorMessage = 'Name is required.';
      return;
    }

    this.habitService.createCustomHabit(this.newHabit).subscribe(
      (userHabit) => {
        this.userHabits.push(userHabit);
        this.resetForm();
        alert('Habit created and associated successfully.');
      },
      (error) => {
        console.error('Error creating habit', error);
        alert('Failed to create habit.');
      }
    );
  }

  resetForm(): void {
    this.newHabit = {
      name: '',
      description: '',
      defaultCostPerOccurrence: null,
      defaultOccurrencesPerDay: null
    };
    this.selectedDefaultHabit = null;
    this.errorMessage = '';
  }

  deleteUserHabit(userHabitId: number): void {
    if (!confirm('Are you sure you want to delete this habit?')) {
      return;
    }

    this.habitService.deleteUserHabit(userHabitId).subscribe(
      () => {
        this.userHabits = this.userHabits.filter(uh => uh.userHabitId !== userHabitId);
        alert('Habit deleted successfully.');
      },
      (error) => {
        console.error('Error deleting habit', error);
        alert('Failed to delete habit.');
      }
    );
  }
}
