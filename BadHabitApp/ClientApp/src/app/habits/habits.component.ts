import { Component, OnInit } from '@angular/core';
import { HabitService, UserHabit, Relapse } from '../services/habit.service';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { motivationalMessages } from '../data/motivational-messages';
import { Router } from '@angular/router';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-habits',
  templateUrl: './habits.component.html',
  styleUrls: ['./habits.component.css'],
})
export class HabitsComponent implements OnInit {
  habit: UserHabit | null = null;
  daysSinceLastRelapse: number = 0;
  moneySaved: number = 0;
  viewingMonth: moment.Moment = moment();
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
    relapses: [],
  };
  showEditModal: boolean = false;
  currentMonthName: string = '';
  occurrencesThisMonth: number = 0;
  totalSpentThisMonth: number = 0;

  heatmapData: { date: moment.Moment | null; count: number }[][] = [];
  maxHeatmapCount: number = 0;

  userTimeZone: string = 'UTC'; // Default time zone

  constructor(
    private habitService: HabitService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userService.getUserTimeZone().subscribe(
      (data) => {
        this.userTimeZone = data.timeZoneId || 'UTC';
        this.viewingMonth = moment().tz(this.userTimeZone);
        this.loadHabit();
      },
      (error) => {
        console.error('Error fetching user time zone', error);
        this.errorMessage = 'Failed to load user time zone.';
        this.viewingMonth = moment().tz('UTC');
        this.loadHabit();
      }
    );
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
              this.habit.relapses.sort(
                (a, b) =>
                  new Date(a.relapseDate).getTime() - new Date(b.relapseDate).getTime()
              );
            }

            // Load insights for the currently viewed month
            this.loadInsightsForMonth();
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

  loadInsightsForMonth(): void {
    this.currentMonthName = this.viewingMonth.format('MMMM');

    if (this.habit && this.habit.relapses) {
      const viewingMonthStart = this.viewingMonth.clone().startOf('month');
      const viewingMonthEnd = this.viewingMonth.clone().endOf('month');

      this.recentRelapses = this.habit.relapses
        .filter((relapse) => {
          const relapseDate = moment(relapse.relapseDate).tz(this.userTimeZone);
          return relapseDate.isBetween(viewingMonthStart, viewingMonthEnd, null, '[]');
        })
        .sort(
          (a, b) =>
            new Date(a.relapseDate).getTime() - new Date(b.relapseDate).getTime()
        );
    } else {
      this.recentRelapses = [];
    }

    this.calculateInsights();
    this.calculateStreaks();
    this.calculateMonthlyProgress();
    this.checkAchievements();
    this.setMotivationalMessage();
    this.generateHeatmapData();
  }

  calculateInsights(): void {
    if (!this.habit) return;

    const viewingMonthStart = this.viewingMonth.clone().startOf('month');
    const viewingMonthEnd = this.viewingMonth.clone().endOf('month');
    const habitStartDate = moment(this.habit.habitStartDate).tz(this.userTimeZone);

    const progressStartDate = habitStartDate.isAfter(viewingMonthStart)
      ? habitStartDate
      : viewingMonthStart;

    // Determine the end date for calculations
    let calculationEndDate = viewingMonthEnd.endOf('day');
    const currentDate = moment().tz(this.userTimeZone).endOf('day');
    if (this.viewingMonth.isSame(moment().tz(this.userTimeZone), 'month')) {
      // If viewing the current month, use today's date
      calculationEndDate = currentDate;
    }

    // Actual occurrences and cost this month
    const monthlyRelapses = this.habit.relapses
      ? this.habit.relapses.filter((relapse) => {
        const relapseDate = moment(relapse.relapseDate).tz(this.userTimeZone);
        return relapseDate.isBetween(
          progressStartDate.startOf('day'),
          calculationEndDate, // Use calculationEndDate here
          null,
          '[]'
        );
      })
      : [];

    const actualOccurrences = monthlyRelapses.length;
    const actualCost = actualOccurrences * (this.habit.costPerOccurrence || 0);

    // Expected occurrences and cost
    let expectedOccurrences: number;
    let expectedCost: number;

    const daysInMonth = viewingMonthEnd.diff(viewingMonthStart, 'days') + 1;
    const daysSinceProgressStart =
      calculationEndDate.diff(progressStartDate, 'days') + 1; // +1 to include the day
    const proportionOfMonth = daysSinceProgressStart / daysInMonth;

    if (
      this.habit.goalType === 'reduce' &&
      this.habit.goalMetric === 'cost'
    ) {
      // Use the goalValue as the expected cost
      expectedCost = this.habit.goalValue ?? 0;
    } else {
      // Expected occurrences and cost based on user's baseline adjusted for the period
      expectedOccurrences =
        (this.habit.occurrencesPerMonth || 0) * proportionOfMonth;
      expectedCost =
        expectedOccurrences * (this.habit.costPerOccurrence || 0);
    }

    // Money saved or overspent this month
    this.moneySaved = expectedCost - actualCost;

    // Days since last relapse
    const relapsesBeforeOrInViewingPeriod = this.habit.relapses
      ? this.habit.relapses.filter((relapse) => {
        const relapseDate = moment(relapse.relapseDate).tz(this.userTimeZone);
        return relapseDate.isBefore(calculationEndDate);
      })
      : [];

    if (relapsesBeforeOrInViewingPeriod.length > 0) {
      const lastRelapseDate = moment(
        relapsesBeforeOrInViewingPeriod[relapsesBeforeOrInViewingPeriod.length - 1]
          .relapseDate
      ).tz(this.userTimeZone);
      this.daysSinceLastRelapse = calculationEndDate.diff(
        lastRelapseDate.startOf('day'),
        'days'
      );
      if (this.daysSinceLastRelapse < 0) {
        this.daysSinceLastRelapse = 0;
      }
    } else {
      if (!this.habit?.habitStartDate) {
        this.daysSinceLastRelapse = 0;
        return;
      }
      this.daysSinceLastRelapse = calculationEndDate.diff(
        habitStartDate.startOf('day'),
        'days'
      );
    }
  }

  calculateStreaks(): void {
    if (!this.habit?.habitStartDate) {
      this.streaks.currentStreak = 0;
      this.streaks.longestStreak = 0;
      return;
    }

    const habitStartDate = moment(this.habit.habitStartDate).tz(this.userTimeZone);
    const viewingMonthEnd = this.viewingMonth.clone().endOf('month');
    const currentDate = moment().tz(this.userTimeZone).endOf('day');

    // Use today's date if viewing the current month, otherwise the end of the viewing month
    const calculationEndDate = this.viewingMonth.isSame(currentDate, 'month')
      ? currentDate
      : viewingMonthEnd.endOf('day');

    let currentStreak = 0;
    let longestStreak = 0;
    let streakStartDate = habitStartDate;
    let lastRelapseDate = streakStartDate;

    const relapsesUpToCalculationEnd = this.habit.relapses
      ? this.habit.relapses.filter((relapse) => {
        const relapseDate = moment(relapse.relapseDate).tz(this.userTimeZone);
        return relapseDate.isBefore(calculationEndDate, 'day');
      })
      : [];

    relapsesUpToCalculationEnd.forEach((relapse) => {
      const relapseMoment = moment(relapse.relapseDate).tz(this.userTimeZone);

      // Calculate the streak from lastRelapseDate to this relapse
      const streakLength = relapseMoment.diff(lastRelapseDate, 'days') - 1;

      if (streakLength > longestStreak) {
        longestStreak = streakLength;
      }

      // Reset lastRelapseDate to this relapse
      lastRelapseDate = relapseMoment;
    });

    // Calculate the streak from the last relapse to the calculation end date
    currentStreak = calculationEndDate.diff(lastRelapseDate, 'days');
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    // Update streaks
    this.streaks.currentStreak = currentStreak;
    this.streaks.longestStreak = longestStreak;
  }

  calculateMonthlyProgress(): void {
    if (!this.habit) return;

    const viewingMonthStart = this.viewingMonth.clone().startOf('month');
    const viewingMonthEnd = this.viewingMonth.clone().endOf('month');
    const habitStartDate = moment.utc(this.habit.habitStartDate);

    const progressStartDate = habitStartDate.isAfter(viewingMonthStart)
      ? habitStartDate
      : viewingMonthStart;

    const progressEndDate = this.viewingMonth.isSame(moment().tz(this.userTimeZone), 'month')
      ? moment().tz(this.userTimeZone).endOf('day')
      : viewingMonthEnd.endOf('day');

    // Filter relapses within the progress period
    const monthlyRelapses = this.habit.relapses
      ? this.habit.relapses.filter((relapse) => {
        const relapseDate = moment.utc(relapse.relapseDate);
        return relapseDate.isBetween(
          progressStartDate.startOf('day'),
          progressEndDate,
          null,
          '[]'
        );
      })
      : [];

    if (this.habit.goalMetric === 'freq') {
      // Frequency-based goal
      this.occurrencesThisMonth = monthlyRelapses.length;
      this.progressValue =
        (this.occurrencesThisMonth / (this.habit.goalValue || 1)) * 100;
      this.goalReached =
        this.occurrencesThisMonth <= (this.habit.goalValue || 1);
    } else if (this.habit.goalMetric === 'cost') {
      // Cost-based goal
      this.totalSpentThisMonth =
        monthlyRelapses.length * (this.habit.costPerOccurrence || 0);
      this.progressValue =
        (this.totalSpentThisMonth / (this.habit.goalValue || 1)) * 100;
      this.goalReached =
        this.totalSpentThisMonth <= (this.habit.goalValue || 1);
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
    let messages: string[] = [];

    if (this.daysSinceLastRelapse === 0) {
      messages = motivationalMessages[0];
    } else if (this.daysSinceLastRelapse === 1) {
      messages = motivationalMessages[1];
    } else if (this.daysSinceLastRelapse >= 1 && this.daysSinceLastRelapse < 7) {
      messages = motivationalMessages['1-6'];
    } else if (this.daysSinceLastRelapse >= 7 && this.daysSinceLastRelapse < 30) {
      messages = motivationalMessages['7-29'];
    } else if (this.daysSinceLastRelapse >= 30 && this.daysSinceLastRelapse < 100) {
      messages = motivationalMessages['30-99'];
    } else {
      messages = motivationalMessages['100+'];
    }

    // Select a random message from the array
    this.motivationalMessage = messages[Math.floor(Math.random() * messages.length)];
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

    // Get current date and time in the user's time zone
    const relapseDate = moment().tz(this.userTimeZone).toISOString();

    this.habitService
      .logRelapse(this.habit.id, this.reasonForRelapse, relapseDate)
      .subscribe(
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

  // Formatting dates for display
  formatDate(dateString: string): string {
    var tempdate = moment.utc(dateString);
    return moment(tempdate).tz(this.userTimeZone).format('MM/DD/YYYY');
  }

  openEditModal(): void {
    if (this.habit) {
      this.editedHabit = { ...this.habit };

      // Format the habitStartDate for the date input
      if (this.editedHabit.habitStartDate) {
        this.editedHabit.habitStartDate = moment(
          this.editedHabit.habitStartDate
        ).format('YYYY-MM-DD');
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
        relapses: [],
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
      relapses: [],
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
      const path =
        this.habit.goalType === 'reduce' ? 'manage-occurrences' : 'manage-relapses';
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
    const formattedCurrency = absValue.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
    return value < 0 ? `(${formattedCurrency})` : formattedCurrency;
  }

  // Navigation Methods
  goToPreviousMonth(): void {
    if (this.habit && this.habit.habitStartDate) {
      const habitStartDate = moment.utc(this.habit.habitStartDate).startOf('month');
      if (this.viewingMonth.clone().subtract(1, 'month').isSameOrAfter(habitStartDate)) {
        this.viewingMonth.subtract(1, 'month');
        this.loadInsightsForMonth();
      }
    }
  }

  goToNextMonth(): void {
    const currentMonth = moment.utc().startOf('month');
    if (this.viewingMonth.isBefore(currentMonth)) {
      this.viewingMonth.add(1, 'month');
      this.loadInsightsForMonth();
    }
  }

  canGoToPreviousMonth(): boolean {
    if (!this.habit || !this.habit.habitStartDate) return false;
    const habitStartDate = moment.utc(this.habit.habitStartDate).startOf('month');
    return this.viewingMonth.clone().subtract(1, 'month').isSameOrAfter(habitStartDate);
  }

  canGoToNextMonth(): boolean {
    const currentMonth = moment.utc().startOf('month');
    return this.viewingMonth.isBefore(currentMonth);
  }

  generateHeatmapData(): void {
    if (!this.habit || !this.habit.relapses) {
      this.heatmapData = [];
      return;
    }

    const viewingMonthStart = this.viewingMonth.clone().startOf('month');
    const viewingMonthEnd = this.viewingMonth.clone().endOf('month');

    // Build an array of weeks, each week is an array of days
    this.heatmapData = [];

    let currentDate = viewingMonthStart.clone();
    const startDayOfWeek = currentDate.day();

    // Adjust currentDate to the previous Sunday (start of the week)
    currentDate.subtract(startDayOfWeek, 'days');

    // Keep looping until we pass the end of the month
    while (currentDate.isBefore(viewingMonthEnd.clone().endOf('week'))) {
      const week: { date: moment.Moment | null; count: number }[] = [];
      for (let i = 0; i < 7; i++) {
        if (currentDate.isBefore(viewingMonthStart) || currentDate.isAfter(viewingMonthEnd)) {
          // Day is outside the viewing month
          week.push({ date: null, count: 0 });
        } else {
          // Initialize count to 0
          week.push({ date: currentDate.clone(), count: 0 });
        }
        currentDate.add(1, 'days');
      }
      this.heatmapData.push(week);
    }

    // Now, for each relapse, increment the count on the corresponding day
    this.habit.relapses.forEach((relapse) => {
      const relapseDate = moment.utc(relapse.relapseDate);
      if (
        relapseDate.isBetween(
          viewingMonthStart.startOf('day'),
          viewingMonthEnd.endOf('day'),
          null,
          '[]'
        )
      ) {
        // Find the corresponding day in heatmapData
        const weekIndex = Math.floor(
          relapseDate.diff(viewingMonthStart.clone().startOf('week'), 'weeks')
        );
        const dayOfWeek = relapseDate.day();
        const week = this.heatmapData[weekIndex];
        if (week) {
          const dayData = week[dayOfWeek];
          if (dayData && dayData.date && dayData.date.isSame(relapseDate, 'day')) {
            dayData.count += 1;
          }
        }
      }
    });

    // Calculate the maximum count
    this.maxHeatmapCount = 0;
    this.heatmapData.forEach((week) => {
      week.forEach((dayData) => {
        if (dayData.count > this.maxHeatmapCount) {
          this.maxHeatmapCount = dayData.count;
        }
      });
    });
  }

  getHeatmapColor(count: number): string {
    if (!count || this.maxHeatmapCount === 0) {
      return '#ebedf0'; // light gray color for no data
    }
    const intensity = count / this.maxHeatmapCount;
    const color = this.interpolateColor('#ebedf0', '#00a287', intensity);
    return color;
  }

  interpolateColor(color1: string, color2: string, factor: number): string {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);

    if (!c1 || !c2) {
      return color1;
    }

    const result = {
      r: Math.round(c1.r + factor * (c2.r - c1.r)),
      g: Math.round(c1.g + factor * (c2.g - c1.g)),
      b: Math.round(c1.b + factor * (c2.b - c1.b)),
    };

    return this.rgbToHex(result.r, result.g, result.b);
  }

  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m: any, r: string, g: string, b: string) {
      return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
      : null;
  }

  rgbToHex(r: number, g: number, b: number): string {
    return '#' + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
  }

  componentToHex(c: number): string {
    const hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
  }

  formatTooltipDate(date: moment.Moment): string {
    return date.clone().tz(this.userTimeZone).format('MMMM Do, YYYY');
  }

}
