import { Component, OnInit } from '@angular/core';
import { HabitService, Relapse, UserHabit } from '../services/habit.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-relapse-management',
  templateUrl: './relapse-management.component.html',
  styleUrls: ['./relapse-management.component.css'],
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
  actionTerm: string = 'Relapse';
  userTimeZone: string = 'UTC';

  constructor(
    private habitService: HabitService,
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.habitId = Number(this.route.snapshot.paramMap.get('id'));

    // Determine the active route to set the appropriate term
    const currentRoute = this.router.url;
    if (currentRoute.includes('manage-occurrences')) {
      this.actionTerm = 'Occurrence';
    } else if (currentRoute.includes('manage-relapses')) {
      this.actionTerm = 'Relapse';
    }

    // Fetch the user's time zone before loading relapses
    this.userService.getUserTimeZone().subscribe(
      (data) => {
        this.userTimeZone = data.timeZoneId || 'UTC';
        this.loadRelapses();
      },
      (error) => {
        console.error('Error fetching user time zone', error);
        this.errorMessage = 'Failed to load user time zone.';
        this.userTimeZone = 'UTC';
        this.loadRelapses();
      }
    );
  }

  loadRelapses(): void {
    this.habitService.getUserHabit(this.habitId).subscribe(
      (habit) => {
        this.habit = habit;
        this.habitStartDate = habit.habitStartDate;
        if (habit.relapses) {
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

    // Convert date to ISO string in the user's time zone
    const relapseDate = moment(this.newRelapseDate)
      .tz(this.userTimeZone)
      .toISOString();

    this.habitService
      .logRelapse(this.habitId, this.newRelapseReason, relapseDate)
      .subscribe(
        () => {
          this.successMessage = `${this.actionTerm} added successfully.`;
          this.newRelapseReason = '';
          this.newRelapseDate = '';
          this.loadRelapses();
        },
        (error) => {
          this.errorMessage = `Failed to add ${this.actionTerm.toLowerCase()}.`;
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

  // Formatting dates for display
  formatDate(dateString: string): string {
    var tempdate = moment.utc(dateString);
    return moment(tempdate).tz(this.userTimeZone).format('MM/DD/YYYY');
  }

  // Validate the date
  isValidDate(dateStr: string): boolean {
    const date = moment(dateStr, 'YYYY-MM-DD', true).tz(this.userTimeZone);
    const habitStartDate = moment(this.habitStartDate, 'YYYY-MM-DD', true).tz(
      this.userTimeZone
    );
    const today = moment().tz(this.userTimeZone).endOf('day');

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
