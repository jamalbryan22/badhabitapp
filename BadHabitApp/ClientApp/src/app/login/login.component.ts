import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessages: string[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void { }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;
      this.authService.login(loginData.email, loginData.password).subscribe({
        next: (response: any) => {
          console.log('Login successful', response);
          this.router.navigate(['/home']);
        },
        error: (error: any) => {
          console.error('Login failed', error);
          this.errorMessages = ['Incorrect Email or Password.'];
        }
      });
    }
  }

  onForgotPassword(): void {
    const email = this.loginForm.get('email')?.value;
    if (!email) {
      alert('Please enter your email address to proceed.');
      return;
    }
    this.authService.forgotPassword(email).subscribe({
      next: (response: any) => {
        const resetLink = response.resetLink; // Make sure the response contains the reset link
        if (resetLink) {
          window.open(resetLink, '_blank'); // Opens the link in a new tab
        } else {
          alert('If the email exists, a password reset link has been generated.');
        }
      },
      error: (error: any) => {
        console.error('Forgot password failed', error);
      }
    });
  }

  onResetPassword(): void {
    const email = this.loginForm.get('email')?.value;
    if (!email) {
      alert('Please enter your email address to proceed.');
      return;
    }
    this.router.navigate(['/reset-password'], { queryParams: { email } });
  }
}
