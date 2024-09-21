import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  login() {
    this.authService.login(this.username, this.password).subscribe(
      (response: any) => {
        this.authService.storeToken(response.token);  // Store JWT token
        this.router.navigate(['/']);  // Redirect to home after login
      },
      error => {
        this.errorMessage = 'Invalid username or password';
      }
    );
  }
}
