import { Component, OnInit } from '@angular/core';
import { HabitService } from '../services/habit.service';

@Component({
  selector: 'app-habit-tracker',
  templateUrl: './habit-tracker.component.html',
  styleUrls: ['./habit-tracker.component.css']
})
export class HabitTrackerComponent implements OnInit {
  habits: any[] = [];
  newHabit = { name: '', description: '', startDate: new Date() };

  constructor(private habitService: HabitService) { }

  ngOnInit(): void {
    this.loadHabits();
  }

  loadHabits(): void {
    this.habitService.getHabits().subscribe(data => {
      this.habits = data;
    });
  }

  addHabit(): void {
    this.habitService.addHabit(this.newHabit).subscribe(() => {
      this.loadHabits();
      this.newHabit = { name: '', description: '', startDate: new Date() };
    });
  }
}
