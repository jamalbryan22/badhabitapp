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
  isRegistering: boolean = false;  // New flag to track registration state

  constructor(private authService: AuthService, private router: Router) { }

  register() {
    this.isRegistering = true;  // Disable fields during registration
    this.authService.register(this.email, this.password).subscribe({
      next: (response: any) => {
        this.successMessage = 'Registration successful! Redirecting to login...';
        this.errorMessages = [];
        setTimeout(() => this.router.navigate(['/login']), 2000);  // Redirect after 2 seconds
      },
      error: (error: any) => {
        this.errorMessages = this.processErrorMessages(error.error);
        this.successMessage = '';
        this.isRegistering = false;  // Re-enable fields on error
      },
      complete: () => {
        console.log('Registration request complete.');
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
}
