// relapse-management.component.ts

import { Component, OnInit } from '@angular/core';
import { HabitService, Relapse, UserHabit } from '../services/habit.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';

@Component({
  selector: 'app-relapse-management',
  templateUrl: './relapse-management.component.html',
  styleUrls: ['./relapse-management.component.css']
})
export class RelapseManagementComponent implements OnInit {
  habitId: number = 0;
  habit: UserHabit | null = null;
  relapses: Relapse[] = [];
  newRelapseReason: string = '';
  newRelapseDate: string = '';
  editRelapse: Relapse | null = null;
  errorMessage: string = '';
  successMessage: string = '';
  habitStartDate: string = '';

  constructor(
    private habitService: HabitService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.habitId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadRelapses();
  }

  loadRelapses(): void {
    this.habitService.getUserHabit(this.habitId).subscribe(
      (habit) => {
        this.habit = habit;
        this.habitStartDate = habit.habitStartDate;
        if (habit.relapses) {
          habit.relapses.forEach((relapse) => {
            // Parse the reason field
            try {
              const parsedReason = JSON.parse(relapse.reason);
              relapse.reason = parsedReason.reason || JSON.stringify(parsedReason) || 'Unknown reason';
            } catch (error) {
              console.error('Error parsing relapse reason', error);
              relapse.reason = 'Invalid reason format';
            }
          });
          // Sort relapses by date
          this.relapses = habit.relapses.sort(
            (a, b) =>
              new Date(a.relapseDate).getTime() - new Date(b.relapseDate).getTime()
          );
        } else {
          this.relapses = [];
        }
      },
      (error) => {
        this.errorMessage = 'Failed to load relapses.';
        console.error(error);
      }
    );
  }

  addRelapse(): void {
    if (!this.newRelapseReason) {
      this.errorMessage = 'Reason is required.';
      return;
    }
    if (!this.newRelapseDate) {
      this.errorMessage = 'Date is required.';
      return;
    }

    if (!this.isValidDate(this.newRelapseDate)) {
      this.errorMessage = 'Date must be between habit start date and today.';
      return;
    }

    this.habitService.logRelapse(this.habitId, this.newRelapseReason, this.newRelapseDate).subscribe(
      () => {
        this.successMessage = 'Relapse added successfully.';
        this.newRelapseReason = '';
        this.newRelapseDate = '';
        this.loadRelapses();
      },
      (error) => {
        this.errorMessage = 'Failed to add relapse.';
        console.error(error);
      }
    );
  }

  deleteRelapse(relapseId: number): void {
    this.habitService.deleteRelapse(this.habitId, relapseId).subscribe(
      () => {
        this.successMessage = 'Relapse deleted successfully.';
        this.loadRelapses();
      },
      (error) => {
        this.errorMessage = 'Failed to delete relapse.';
        console.error(error);
      }
    );
  }

  deleteAllRelapses(): void {
    this.habitService.deleteAllRelapses(this.habitId).subscribe(
      () => {
        this.successMessage = 'All relapses deleted successfully.';
        this.loadRelapses();
      },
      (error) => {
        this.errorMessage = 'Failed to delete all relapses.';
        console.error(error);
      }
    );
  }

  startEditing(relapse: Relapse): void {
    this.editRelapse = { ...relapse };
    // Format the date for the date input
    this.editRelapse.relapseDate = moment(this.editRelapse.relapseDate).format('YYYY-MM-DD');
  }

  cancelEditing(): void {
    this.editRelapse = null;
  }

  updateRelapse(): void {
    if (!this.editRelapse) {
      return;
    }

    if (!this.isValidDate(this.editRelapse.relapseDate)) {
      this.errorMessage = 'Date must be between habit start date and today.';
      return;
    }

    this.habitService.updateRelapse(this.habitId, this.editRelapse.id, this.editRelapse).subscribe(
      (updatedRelapse) => {
        this.successMessage = 'Relapse updated successfully.';
        this.editRelapse = null;
        this.loadRelapses();
      },
      (error) => {
        this.errorMessage = 'Failed to update relapse.';
        console.error(error);
      }
    );
  }

  // Validate the date
  isValidDate(dateStr: string): boolean {
    const date = moment(dateStr, 'YYYY-MM-DD', true);
    const habitStartDate = moment(this.habitStartDate, 'YYYY-MM-DD', true);
    const today = moment().endOf('day');

    if (!date.isValid()) {
      return false;
    }

    if (date.isBefore(habitStartDate) || date.isAfter(today)) {
      return false;
    }

    return true;
  }

  goBack(): void {
    this.router.navigate(['/habits']);
  }
}
