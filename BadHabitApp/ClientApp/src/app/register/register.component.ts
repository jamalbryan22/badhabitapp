import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  userId: string | null = null;
  email: string | null = null;
  password: string | null = null;
  confirmPassword: string | null = null;
  addictionType: string | null = null;
  customAddiction: string | null = null;
  isCustomAddictionSelected = false;
  dateAddictionBegan: Date | null = null;
  habitDescription: string | null = null;
  userMotivation: string | null = null;
  costPerOccurrence: number | null = 0;
  occurrencesPerMonth: number | null = 0;
  goalType: string | null = null;
  goalMetric: string | null = null;
  goalValue: number | null = null;
  errorMessages: string[] = [];
  successMessage: string | null = null;
  isRegistering: boolean = false;

  timeZones: { id: string, displayName: string }[] = [];
  timeZoneId: string | null = null;

  constructor(private authService: AuthService, private router: Router, private cdRef: ChangeDetectorRef) { }

  ngOnInit() {
    // Initialize the timeZones array
    this.timeZones = [
      { id: 'UTC', displayName: 'UTC' },
      { id: 'America/New_York', displayName: 'Eastern Time' },
      { id: 'America/Chicago', displayName: 'Central Time' },
      { id: 'America/Denver', displayName: 'Mountain Time' },
      { id: 'America/Los_Angeles', displayName: 'Pacific Time' },
      { id: 'America/Anchorage', displayName: 'Alaska Time' },
      { id: 'Pacific/Honolulu', displayName: 'Hawaii Time' }
    ];
  }

  register() {
    this.errorMessages = []; // Clear previous errors

    // Check if passwords match
    if (this.password !== this.confirmPassword) {
      this.errorMessages.push('Passwords do not match.');
      this.isRegistering = false; // Ensure fields remain enabled

      // Scroll to the top when an error occurs
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return; // Exit the method early to prevent further execution
    }

    this.isRegistering = true; // Disable fields during registration

    // Prepare data to send
    const registrationData = {
      email: this.email,
      password: this.password,
      timeZoneId: this.timeZoneId,
      addictionType: this.addictionType === 'Custom' ? this.customAddiction : this.addictionType,
      habitStartDate: this.dateAddictionBegan,
      habitDescription: this.habitDescription,
      userMotivation: this.userMotivation,
      costPerOccurrence: this.costPerOccurrence,
      occurrencesPerMonth: this.occurrencesPerMonth,
      goalType: this.goalType,
      goalMetric: this.goalType === 'reduce' ? this.goalMetric : null,
      goalValue: this.goalType === 'reduce' ? this.goalValue : null
    };

    this.authService.register(registrationData).pipe(
      catchError(error => {
        this.errorMessages = this.processErrorMessages(error);

        // Scroll to the top when an error occurs
        if (this.errorMessages.length > 0) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        this.cdRef.detectChanges(); // Ensure the template updates with the new messages
        this.isRegistering = false; // Re-enable fields if registration fails
        return of(null);
      })
    ).subscribe(response => {
      if (response) {
        this.successMessage = 'Registration successful! Redirecting to login';
        this.errorMessages = [];
        setTimeout(() => this.router.navigate(['/login']), 2000);  // Redirect after 2 seconds
      }
    });
  }

  processErrorMessages(error: any): string[] {
    if (error instanceof HttpErrorResponse) {
      if (Array.isArray(error.error.errors)) {
        return error.error.errors;
      } else if (error.error && typeof error.error === 'object' && error.error.errors) {
        return ([] as string[]).concat(...Object.values(error.error.errors) as string[][]);
      } else if (error.error && error.error.Message) {
        // Handle the case where error.error contains a Message property
        return [error.error.Message];
      } else if (typeof error.error === 'string') {
        return [error.error];
      } else if (error.message) {
        return [error.message];
      }
    }
    return ['An unknown error occurred.'];
  }

  checkCustomAddiction() {
    // Check if the selected addiction is 'Custom'
    this.isCustomAddictionSelected = this.addictionType === 'Custom';
  }

  onGoalTypeChange() {
    // Reset GoalMetric and GoalValue if GoalType is set to "quit"
    if (this.goalType !== 'reduce') {
      this.goalMetric = null;
      this.goalValue = null;
    }
  }

  // Method to restrict input to two decimal places
  formatCurrencyInput(event: any, field: 'costPerOccurrence' | 'goalValue') {
    const value = event.target.value;

    // Use regex to ensure only up to two decimal places
    const formattedValue = parseFloat(value).toFixed(2);
    if (field === 'costPerOccurrence') {
      this.costPerOccurrence = parseFloat(formattedValue);
    } else if (field === 'goalValue' && this.goalMetric === 'cost') {
      this.goalValue = parseFloat(formattedValue);
    }
  }

  enforceWholeNumber(event: any) {
    const value = event.target.value;

    // Ensure the value is a whole number
    const wholeNumber = Math.floor(Number(value));
    if (Number(value) !== wholeNumber) {
      event.target.value = wholeNumber; // Update the displayed value to the whole number
      this.goalValue = wholeNumber; // Ensure the bound model is updated
    } else {
      this.goalValue = wholeNumber;
    }
  }
}
