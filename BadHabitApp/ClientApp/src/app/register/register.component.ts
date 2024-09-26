import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  password: string = '';
  email: string = '';
  errorMessages: string[] = [];
  successMessage: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  register() {
    this.authService.register(this.email, this.password).subscribe({
      next: (response: any) => {
        // Assuming the response is successful
        this.successMessage = 'Registration successful! Redirecting to login...';
        this.errorMessages = [];
        setTimeout(() => this.router.navigate(['/login']), 2000);  // Redirect after 2 seconds
      },
      error: (error: any) => {
        this.errorMessages = this.processErrorMessages(error.error);
        this.successMessage = '';
      },
      complete: () => {
        console.log('Registration request complete.');
      }
    });
  }

  processErrorMessages(error: any): string[] {
    const messages: string[] = [];

    // Check if the error contains validation errors in the 'errors' field
    if (Array.isArray(error.errors)) {
      // If errors is an array, directly push each item to the messages array
      messages.push(...error.errors);
    } else if (error.errors) {
      // If errors is an object (key-value pair), loop through and push each validation error
      for (const key in error.errors) {
        if (error.errors.hasOwnProperty(key)) {
          // Assuming error.errors[key] is an array of error messages for each key
          messages.push(...error.errors[key]);
        }
      }
    } else if (error.Message) {
      // Handle a general error message field (capital M for Message, adjust based on your API response)
      messages.push(error.Message);
    } else {
      // Default message if no structured error messages are provided
      messages.push(error.title || 'An unknown error occurred.');
    }

    return messages;
  }
}
