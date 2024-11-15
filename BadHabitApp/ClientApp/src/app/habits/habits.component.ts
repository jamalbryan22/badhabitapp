import { Component, OnInit } from '@angular/core';
import { HabitService, UserHabit, Relapse } from '../services/habit.service';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-habits',
  templateUrl: './habits.component.html',
  styleUrls: ['./habits.component.css']
})
export class HabitsComponent implements OnInit {
  userHabits: UserHabit[] = [];
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
  habit: any;
  daysSinceLastRelapse: number = 0;
  moneySaved: number = 0;
  currentDate: Date = new Date();
  reasonForRelapse: string = '';
  showRelapseModal: boolean = false;
  recentRelapses: Relapse[] = [];

  constructor(private habitService: HabitService, private authService: AuthService, private http: HttpClient) { }

  ngOnInit(): void {
    this.loadHabits();
  }

  loadHabits(): void {
    const userId = this.authService.getUserID();
    if (!userId) {
      this.errorMessage = 'User not logged in.';
      return;
    }

    // Fetch habit IDs for the user
    this.habitService.getHabitIds(userId).subscribe(
      (habitIds) => {
        if (habitIds.length === 0) {
          this.errorMessage = 'No habits found for the user.';
          this.userHabits = [];
          return;
        }

        // Fetch each habit object
        const habitRequests = habitIds.map((id) => this.habitService.getUserHabit(id).toPromise());
        Promise.all(habitRequests)
          .then((habits) => {
            // Filter out any undefined values and assign to userHabits
            this.userHabits = habits.filter((habit): habit is UserHabit => habit !== undefined);

            // Parse the reason field in relapses
            this.userHabits.forEach((habit) => {
              if (habit.relapses) {
                habit.relapses.forEach((relapse) => {
                  try {
                    const parsedReason = JSON.parse(relapse.reason);
                    relapse.reason = parsedReason.reason || relapse.reason;
                  } catch (error) {
                    console.error('Error parsing relapse reason:', error);
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.error('Error loading habits:', error);
            this.errorMessage = 'Failed to load user habits.';
          });
      },
      (error) => {
        console.error('Error fetching habit IDs:', error);
        this.errorMessage = 'Failed to fetch habit IDs.';
      }
    );
  }


  calculateInsights(): void {
    if (this.recentRelapses.length > 0) {
      // Get the most recent relapse date
      const lastRelapseDate = new Date(this.recentRelapses[0].relapseDate);

      // Calculate the difference in days between today and the last relapse date
      const timeDiff = this.currentDate.getTime() - lastRelapseDate.getTime();
      this.daysSinceLastRelapse = Math.floor(timeDiff / (1000 * 3600 * 24));

      // Ensure daysSinceLastRelapse is not negative
      if (this.daysSinceLastRelapse < 0) {
        this.daysSinceLastRelapse = 0;
      }

      // Calculate money saved based on the days since the last relapse
      this.moneySaved = this.daysSinceLastRelapse * (this.habit.costPerOccurrence || 0);
    } else {
      // If there are no relapses, assume it has been since the habit start date
      const habitStartDate = new Date(this.habit.habitStartDate);
      const timeDiff = this.currentDate.getTime() - habitStartDate.getTime();
      this.daysSinceLastRelapse = Math.floor(timeDiff / (1000 * 3600 * 24));
      this.moneySaved = this.daysSinceLastRelapse * (this.habit.costPerOccurrence || 0);
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
        this.loadHabits(); // Reload habit data to update insights
      },
      (error) => {
        console.error('Error logging relapse', error);
        this.errorMessage = 'Failed to log relapse.';
      }
    );
  }

  // Triggered when the user modifies the habit's name or description
  onHabitModified(): void {
    this.isModified = true;
  }

  resetForm(): void {
    this.newHabit = {
      habitId: null,
      name: '',
      description: '',
      costPerOccurrence: null,
      occurrencesPerDay: null
    };
    this.isModified = false;  // Reset the modification flag
    this.errorMessage = '';   // Reset error message
    this.successMessage = ''; // Reset success message
  }

  // TO-DO IMPLEMENT METHOD
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
