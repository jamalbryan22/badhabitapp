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
  progressValue: number = 0;
  goalReached: boolean = false;
  editedHabit: UserHabit = {
    id: 0,
    userId: '',
    addictionType: '',
    habitStartDate: '',
    habitDescription: '',
    userMotivation: '',
    costPerOccurrence: 0,
    occurrencesPerMonth: 0,
    goalType: '',
    goalMetric: '',
    goalValue: 0,
    relapses: []
  };
  showEditModal: boolean = false;

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

    this.habitService.getUserHabitIds(userId).subscribe(
      (habitIds) => {
        if (!habitIds || habitIds.length === 0) {
          this.errorMessage = 'No habits found for the user.';
          return;
        }

        const firstHabitId = habitIds[0];

        this.habitService.getUserHabit(firstHabitId).subscribe(
          (habit) => {
            this.habit = habit;

            if (this.habit.relapses) {
              this.habit.relapses.forEach((relapse) => {
                try {
                  const parsedReason = JSON.parse(relapse.reason);
                  relapse.reason = parsedReason.reason || JSON.stringify(parsedReason) || 'Unknown reason';
                } catch (error) {
                  console.error('Error parsing relapse reason', error);
                  relapse.reason = 'Invalid reason format';
                }
              });

              this.recentRelapses = this.habit.relapses
                ? this.habit.relapses.sort(
                  (a, b) =>
                   new Date(a.relapseDate).getTime() - new Date(b.relapseDate).getTime()
               )
                : [];
            } else {
            this.recentRelapses = [];
            }
            this.calculateInsights();
            this.calculateStreaks();
            this.calculateCumulativeMoneySaved();
            this.checkAchievements();
            this.setMotivationalMessage();
            this.calculateMonthlyProgress();
          },
          (error) => {
            console.error('Error loading habit', error);
            this.errorMessage = 'Failed to load habit.';
          }
        );
      },
      (error) => {
        console.error('Error fetching habit IDs', error);
        this.errorMessage = 'Failed to load habits.';
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

  calculateMonthlyProgress(): void {
    if (!this.habit) return;

    const currentMonth = moment().month();
    const currentYear = moment().year();

    // Ensure relapses is defined and filter relapses within the current month
    const monthlyRelapses = this.habit.relapses
      ? this.habit.relapses.filter((relapse) => {
        const relapseDate = moment(relapse.relapseDate);
        return relapseDate.month() === currentMonth && relapseDate.year() === currentYear;
      })
      : [];

    if (this.habit.goalMetric === 'freq') {
      // Frequency-based goal
      const occurrencesThisMonth = monthlyRelapses.length;
      this.progressValue = Math.min(
        (occurrencesThisMonth / (this.habit.goalValue || 1)) * 100,
        100
      );
      this.goalReached = occurrencesThisMonth <= (this.habit.goalValue || 1);
    } else if (this.habit.goalMetric === 'cost') {
      // Cost-based goal
      const totalSpentThisMonth =
        monthlyRelapses.length * (this.habit.costPerOccurrence || 0);
      this.progressValue = Math.min(
        (totalSpentThisMonth / (this.habit.goalValue || 1)) * 100,
        100
      );
      this.goalReached = totalSpentThisMonth <= (this.habit.goalValue || 1);
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
        this.loadHabit();
      },
      (error) => {
        console.error('Error logging relapse', error);
        this.errorMessage = 'Failed to log relapse.';
      }
    );
  }

  openEditModal(): void {
    if (this.habit) {
      this.editedHabit = { ...this.habit };
    } else {
      // Set default values if `habit` hasn't been loaded yet
      this.editedHabit = {
        id: 0,
        userId: '',
        addictionType: '',
        habitStartDate: '',
        habitDescription: '',
        userMotivation: '',
        costPerOccurrence: 0,
        occurrencesPerMonth: 0,
        goalType: '',
        goalMetric: '',
        goalValue: 0,
        relapses: []
      };
    }
    this.showEditModal = true;
  }


  closeEditModal(): void {
    this.showEditModal = false;
    this.editedHabit = {
      id: 0,
      userId: '',
      addictionType: '',
      habitStartDate: '',
      habitDescription: '',
      userMotivation: '',
      costPerOccurrence: 0,
      occurrencesPerMonth: 0,
      goalType: '',
      goalMetric: '',
      goalValue: 0,
      relapses: []
    };
  }

  updateHabit(): void {
    if (!this.editedHabit || !this.editedHabit.id) return;

    this.habitService.updateUserHabit(this.editedHabit.id, this.editedHabit).subscribe(
      (updatedHabit) => {
        this.successMessage = 'Habit updated successfully.';
        this.habit = updatedHabit; // Update the displayed habit with new data
        this.closeEditModal();
      },
      (error) => {
        this.errorMessage = 'Failed to update habit.';
        console.error('Error updating habit', error);
      }
    );
    this.closeEditModal()
  }

  logOut(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  goToManageRelapses(): void {
    if (this.habit) {
      this.router.navigate(['/manage-relapses', this.habit.id]);
    } else {
      this.errorMessage = 'Habit not loaded.';
    }
  }
}
