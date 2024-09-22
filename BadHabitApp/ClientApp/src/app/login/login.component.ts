import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  login() {
    console.log('Login attempt:', this.username);
    this.authService.login(this.username, this.password).subscribe(
      (response: any) => {
        console.log('Login successful:', response);
        this.authService.storeToken(response.token);  // Store JWT token
        this.router.navigate(['/']);  // Redirect to home after login
      },
      error => {
        console.error('Login failed:', error);
        this.errorMessage = 'Invalid username or password';
      }
    );
  }
}
