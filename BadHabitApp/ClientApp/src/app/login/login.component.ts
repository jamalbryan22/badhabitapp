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
  errorMessages: string[] = [];

  constructor(private authService: AuthService, private router: Router) { }

  login() {
    this.authService.login(this.username, this.password).subscribe(
      (response: any) => {
        if (response.isSuccess) {
          this.authService.storeToken(response.data.token);  // Store JWT token
          this.router.navigate(['/']);  // Redirect to home after login
        } else {
          this.errorMessages = response.messages;
        }
      },
      error => {
        console.error('Login failed:', error);
        this.errorMessages = error.error.messages || ['Unknown error occurred'];
      }
    );
  }
}
