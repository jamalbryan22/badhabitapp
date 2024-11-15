import { Component, OnInit } from '@angular/core';
import { HabitService, UserHabit, Relapse } from '../services/habit.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import * as moment from 'moment';

@Component({
  selector: 'app-habits',
  templateUrl: './habits.component.html',
  styleUrls: ['./habits.component.css'],
})
export class HabitsComponent implements OnInit {
  habit: UserHabit | null = null;
  daysSinceLastRelapse: number = 0;
  moneySaved: number = 0;
  currentDate: Date = new Date();
  reasonForRelapse: string = '';
  showRelapseModal: boolean = false;
  recentRelapses: Relapse[] = [];
  streaks = { currentStreak: 0, longestStreak: 0 };
  cumulativeMoneySaved: number[] = [];
  cumulativeDates: string[] = [];
  achievements: string[] = [];
  motivationalMessage: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private habitService: HabitService,
    private authService: AuthService,
    private router: Router
  ) { }

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
        this.recentRelapses = this.habit.relapses.sort(
          (a, b) =>
            new Date(a.relapseDate).getTime() - new Date(b.relapseDate).getTime()
        );
        this.calculateInsights();
        this.calculateStreaks();
        this.calculateCumulativeMoneySaved();
        this.checkAchievements();
        this.setMotivationalMessage();
      },
      (error) => {
        console.error('Error loading habit', error);
        this.errorMessage = 'Failed to load habit.';
      }
    );
  }

  calculateInsights(): void {
    if (this.recentRelapses.length > 0) {
      const lastRelapseDate = new Date(
        this.recentRelapses[this.recentRelapses.length - 1].relapseDate
      );
      const timeDiff = this.currentDate.getTime() - lastRelapseDate.getTime();
      this.daysSinceLastRelapse = Math.floor(timeDiff / (1000 * 3600 * 24));
      if (this.daysSinceLastRelapse < 0) {
        this.daysSinceLastRelapse = 0;
      }
      this.moneySaved =
        this.daysSinceLastRelapse * (this.habit?.costPerOccurrence || 0);
    } else {
      if (!this.habit?.habitStartDate) {
        this.daysSinceLastRelapse = 0;
        this.moneySaved = 0;
        return;
      }
      const habitStartDate = new Date(this.habit.habitStartDate);
      const timeDiff = this.currentDate.getTime() - habitStartDate.getTime();
      this.daysSinceLastRelapse = Math.floor(timeDiff / (1000 * 3600 * 24));
      this.moneySaved =
        this.daysSinceLastRelapse * (this.habit?.costPerOccurrence || 0);
    }
  }

  calculateStreaks(): void {
    if (!this.habit?.habitStartDate) {
      this.streaks.currentStreak = 0;
      this.streaks.longestStreak = 0;
      return;
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let streakStartDate = moment(this.habit.habitStartDate);
    let lastRelapseDate = streakStartDate;

    this.recentRelapses.forEach((relapse) => {
      const relapseMoment = moment(relapse.relapseDate);
      const streakLength = relapseMoment.diff(lastRelapseDate, 'days');
      if (streakLength > longestStreak) {
        longestStreak = streakLength;
      }
      lastRelapseDate = relapseMoment;
    });

    currentStreak = moment().diff(lastRelapseDate, 'days');
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    this.streaks.currentStreak = currentStreak;
    this.streaks.longestStreak = longestStreak;
  }

  calculateCumulativeMoneySaved(): void {
    if (!this.habit?.habitStartDate) {
      this.cumulativeMoneySaved = [];
      this.cumulativeDates = [];
      return;
    }

    this.cumulativeMoneySaved = [];
    this.cumulativeDates = [];
    let totalSaved = 0;
    let date = moment(this.habit.habitStartDate);
    const endDate = moment();
    const relapsesSet = new Set(
      this.recentRelapses.map((r) => moment(r.relapseDate).format('YYYY-MM-DD'))
    );

    while (date.isSameOrBefore(endDate)) {
      const dateStr = date.format('YYYY-MM-DD');
      if (!relapsesSet.has(dateStr)) {
        totalSaved += this.habit?.costPerOccurrence || 0;
      }
      this.cumulativeMoneySaved.push(totalSaved);
      this.cumulativeDates.push(date.format('YYYY-MM-DD'));
      date.add(1, 'days');
    }
  }

  checkAchievements(): void {
    this.achievements = [];
    if (this.daysSinceLastRelapse >= 7) {
      this.achievements.push('1 Week Clean!');
    }
    if (this.daysSinceLastRelapse >= 30) {
      this.achievements.push('1 Month Clean!');
    }
    if (this.daysSinceLastRelapse >= 100) {
      this.achievements.push('100 Days Clean!');
    }
    // Add more achievements as needed
  }

  setMotivationalMessage(): void {
    if (this.daysSinceLastRelapse === 0) {
      this.motivationalMessage = 'Every setback is a setup for a comeback!';
    } else if (this.daysSinceLastRelapse < 7) {
      this.motivationalMessage = 'Great start! Keep going one day at a time.';
    } else if (this.daysSinceLastRelapse < 30) {
      this.motivationalMessage = 'You are doing amazing! Stay strong.';
    } else {
      this.motivationalMessage = 'Incredible progress! Keep up the great work.';
    }
  }

  onSelect(event: any): void {
    console.log('Selected date', event);
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
        this.loadHabit();
      },
      (error) => {
        console.error('Error logging relapse', error);
        this.errorMessage = 'Failed to log relapse.';
      }
    );
  }

  logOut(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
