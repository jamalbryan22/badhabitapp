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
  currentMonthName: string = '';
  occurrencesThisMonth: number = 0;
  totalSpentThisMonth: number = 0;

  constructor(
    private habitService: HabitService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadHabit();
    this.currentMonthName = moment().format('MMMM');
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
              this.recentRelapses = this.habit.relapses.sort(
                (a, b) =>
                  new Date(a.relapseDate).getTime() - new Date(b.relapseDate).getTime()
              );
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
    if (!this.habit) return;

    const today = moment.utc();
    const startOfMonth = today.clone().startOf('month');
    const habitStartDate = moment.utc(this.habit.habitStartDate);

    const progressStartDate = habitStartDate.isAfter(startOfMonth) ? habitStartDate : startOfMonth;

    const daysInMonth = today.daysInMonth();
    const daysSinceProgressStart = today.diff(progressStartDate, 'days') + 1; // +1 to include today
    const proportionOfMonth = daysSinceProgressStart / daysInMonth;

    // Actual occurrences and cost this month
    const monthlyRelapses = this.habit.relapses
      ? this.habit.relapses.filter((relapse) => {
        const relapseDate = moment.utc(relapse.relapseDate);
        return relapseDate.isBetween(progressStartDate.startOf('day'), today.endOf('day'), null, '[]');
      })
      : [];

    const actualOccurrences = monthlyRelapses.length;
    const actualCost = actualOccurrences * (this.habit.costPerOccurrence || 0);

    let expectedCost: number;

    if (this.habit.goalType === 'reduce' && this.habit.goalMetric === 'cost') {
      // Use the goalValue as the expected cost
      expectedCost = this.habit.goalValue ?? 0;
    } else {
      // Expected occurrences and cost based on user's baseline adjusted for the period
      const expectedOccurrences = (this.habit.occurrencesPerMonth || 0) * proportionOfMonth;
      expectedCost = expectedOccurrences * (this.habit.costPerOccurrence || 0);
    }

    // Money saved or overspent this month
    this.moneySaved = expectedCost - actualCost;

    // Days since last relapse
    if (this.recentRelapses.length > 0) {
      const lastRelapseDate = moment.utc(this.recentRelapses[this.recentRelapses.length - 1].relapseDate);
      this.daysSinceLastRelapse = today.startOf('day').diff(lastRelapseDate.startOf('day'), 'days');
      if (this.daysSinceLastRelapse < 0) {
        this.daysSinceLastRelapse = 0;
      }
    } else {
      if (!this.habit?.habitStartDate) {
        this.daysSinceLastRelapse = 0;
        return;
      }
      const habitStartDate = moment.utc(this.habit.habitStartDate);
      this.daysSinceLastRelapse = today.startOf('day').diff(habitStartDate.startOf('day'), 'days');
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

    const today = moment.utc();
    const startOfMonth = today.clone().startOf('month');
    const habitStartDate = moment.utc(this.habit.habitStartDate);

    const progressStartDate = habitStartDate.isAfter(startOfMonth) ? habitStartDate : startOfMonth;

    // Filter relapses within the progress period
    const monthlyRelapses = this.habit.relapses
      ? this.habit.relapses.filter((relapse) => {
        const relapseDate = moment.utc(relapse.relapseDate);
        return relapseDate.isBetween(progressStartDate.startOf('day'), today.endOf('day'), null, '[]');
      })
      : [];

    if (this.habit.goalMetric === 'freq') {
      // Frequency-based goal
      this.occurrencesThisMonth = monthlyRelapses.length;
      this.progressValue = (this.occurrencesThisMonth / (this.habit.goalValue || 1)) * 100;
      this.goalReached = this.occurrencesThisMonth <= (this.habit.goalValue || 1);
    } else if (this.habit.goalMetric === 'cost') {
      // Cost-based goal
      this.totalSpentThisMonth = monthlyRelapses.length * (this.habit.costPerOccurrence || 0);
      this.progressValue = (this.totalSpentThisMonth / (this.habit.goalValue || 1)) * 100;
      this.goalReached = this.totalSpentThisMonth <= (this.habit.goalValue || 1);
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

    // Get current date and time in ISO format
    const relapseDate = moment().toISOString();

    this.habitService.logRelapse(this.habit.id, this.reasonForRelapse, relapseDate).subscribe(
      () => {
        this.successMessage = 'Occurrence logged successfully.';
        this.closeRelapseModal();
        this.loadHabit();
      },
      (error) => {
        console.error('Error logging relapse', error);
        this.errorMessage = 'Failed to log occurrence.';
      }
    );
  }

  openEditModal(): void {
    if (this.habit) {
      this.editedHabit = { ...this.habit };

      // Format the habitStartDate for the date input
      if (this.editedHabit.habitStartDate) {
        this.editedHabit.habitStartDate = moment(this.editedHabit.habitStartDate).format('YYYY-MM-DD');
      }
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
        this.closeEditModal();
        this.loadHabit(); // Reload habit data
      },
      (error) => {
        this.errorMessage = 'Failed to update habit.';
        console.error('Error updating habit', error);
      }
    );
  }

  logOut(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  goToManageRelapses(): void {
    if (this.habit) {
      const path = this.habit.goalType === 'reduce' ? 'manage-occurrences' : 'manage-relapses';
      this.router.navigate([`/${path}`, this.habit.id]);
    } else {
      this.errorMessage = 'Habit not loaded.';
    }
  }

  onGoalTypeChange(): void {
    // Reset GoalMetric and GoalValue if GoalType is not 'reduce'
    if (this.editedHabit.goalType !== 'reduce') {
      this.editedHabit.goalMetric = undefined;
      this.editedHabit.goalValue = undefined;
    }
  }

  formatCurrencyInput(event: any, field: 'costPerOccurrence' | 'goalValue'): void {
    const value = event.target.value;

    // Ensure two decimal places
    const formattedValue = parseFloat(value).toFixed(2);
    if (field === 'costPerOccurrence') {
      this.editedHabit.costPerOccurrence = parseFloat(formattedValue);
    } else if (field === 'goalValue' && this.editedHabit.goalMetric === 'cost') {
      this.editedHabit.goalValue = parseFloat(formattedValue);
    }
  }

  enforceWholeNumber(event: any): void {
    const value = event.target.value;

    // Ensure the value is a whole number
    const wholeNumber = Math.floor(Number(value));
    if (Number(value) !== wholeNumber) {
      event.target.value = wholeNumber; // Update the displayed value
      this.editedHabit.goalValue = wholeNumber; // Update the model
    } else {
      this.editedHabit.goalValue = wholeNumber;
    }
  }

  get actionTerm(): string {
    return this.habit?.goalType === 'reduce' ? 'Occurrence' : 'Relapse';
  }

  get actionTermLowercase(): string {
    return this.actionTerm.toLowerCase();
  }

  formatMoneySaved(value: number): string {
    const absValue = Math.abs(value);
    const formattedCurrency = absValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    return value < 0 ? `(${formattedCurrency})` : formattedCurrency;
  }

}
