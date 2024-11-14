import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  errorMessages: string[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void { }

  onSubmit(): void {
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        this.router.navigate(['/habits']); // Redirect to habits page on successful login
      },
      error: (error) => {
        console.error('Login failed', error);
        this.errorMessages = ['Incorrect Email or Password.'];
      }
    });
  }

  onRegister(): void {
    this.router.navigate(['/register']); // Navigate to registration page
  }
}
