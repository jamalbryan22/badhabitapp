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

  associateHabit(habitId: number): void {
    this.habitService.associateHabit(habitId).subscribe(
      (userHabit) => {
        this.userHabits.push(userHabit);
        alert('Habit associated successfully.');
      },
      (error) => {
        console.error('Error associating habit', error);
        alert('Failed to associate habit.');
      }
    );
  }

  createCustomHabit(): void {
    if (!this.newHabit.name.trim()) {
      this.errorMessage = 'Name is required.';
      return;
    }

    this.habitService.createCustomHabit(this.newHabit).subscribe(
      (userHabit) => {
        this.userHabits.push(userHabit);
        this.newHabit = {
          name: '',
          description: '',
          defaultCostPerOccurrence: null,
          defaultOccurrencesPerDay: null
        };
        this.errorMessage = '';
        alert('Custom habit created and associated successfully.');
      },
      (error) => {
        console.error('Error creating custom habit', error);
        alert('Failed to create custom habit.');
      }
    );
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
