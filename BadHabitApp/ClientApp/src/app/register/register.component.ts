import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { HabitService, DefaultHabit, UserHabit } from '../services/habit.service';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  userId: string | null = null;
/*  firstName: string | null = null;
  lastName: string | null = null;
  dateOfBirth: Date | null = null;
  userName: string | null = null;*/
  email: string | null = null;
  password: string | null = null;
  confirmPassword: string | null = null;
  addictionType: string | null = null;
  customAddiction: string | null = null;
  isCustomAddictionSelected = false;
  dateAddictionBegan: Date | null = null;
  dateOfLastRelapse: Date | null = null;
  habitDescription: string | null = null;
  userMotivation: string | null = null;
  reasonForLastRelapse: string | null = null;
  costPerOccurrence: number | null = 0;
  occurrencesPerMonth: number | null = 0;
  errorMessages: string[] = [];
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isRegistering: boolean = false;  // New flag to track registration state

  constructor(private authService: AuthService, private habitService: HabitService, private router: Router ) { }

  register() {
    this.isRegistering = true;  // Disable fields during registration

    //register user
    this.authService.register(this.email, this.password).pipe(
      catchError(error => {
        // Handle error if needed
        console.error('Registration failed:', error);
        return of(null); // Return null or an appropriate value
      })
    ).subscribe(response => {
      if (response) {
        // Extract the user ID from the response
        this.userId = response.userId; 

        // Create user habit
        const habitData: any = {
          habitId: null,
          userId: this.userId,
          addictionType: this.addictionType,
          habitStartDate: this.dateAddictionBegan,
          lastRelapseDate: this.dateOfLastRelapse,
          habitDescription: this.habitDescription,
          userMotivation: this.userMotivation,
          reasonForLastRelapse: this.reasonForLastRelapse,
          costPerOccurrence: this.costPerOccurrence,
          occurrencesPerMonth: this.occurrencesPerMonth
        };

        //post user habit to database
        this.habitService.createUserHabit(habitData).subscribe(
          (userHabit) => {
            this.successMessage = 'Registration successful! Redirecting to login';
            setTimeout(() => this.router.navigate(['/login']), 2000);  // Redirect after 2 seconds
          },
          (error) => {
            console.error('Error creating habit', error);
            this.errorMessage = 'Failed to create habit.';
          }
        );
      }
    });
  }

  processErrorMessages(error: any): string[] {
    const messages: string[] = [];
    if (Array.isArray(error.errors)) {
      messages.push(...error.errors);
    } else if (error.errors) {
      for (const key in error.errors) {
        if (error.errors.hasOwnProperty(key)) {
          messages.push(...error.errors[key]);
        }
      }
    } else if (error.Message) {
      messages.push(error.Message);
    } else {
      messages.push(error.title || 'An unknown error occurred.');
    }
    return messages;
  }

  checkCustomAddiction() {
    // Check if the selected addiction is 'Custom'
    this.isCustomAddictionSelected = this.addictionType === 'Custom';
  }
}
