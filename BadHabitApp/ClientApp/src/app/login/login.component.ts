import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessages: string[] = [];

  constructor(private authService: AuthService, private router: Router) { }

  login() {
    this.authService.login(this.email, this.password).subscribe({
      next: (response: any) => {
        this.router.navigate(['/']);  // Redirect to home after login
      },
      error: (error: any) => {
        console.error('Login failed:', error);
        this.errorMessages = error?.error?.messages || ['Incorrect Email or Password.'];
      },
      complete: () => {
        console.log('Login request complete.');
      }
    });
  }
}
