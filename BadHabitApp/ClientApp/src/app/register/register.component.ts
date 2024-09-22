import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username: string = '';
  password: string = '';
  email: string = '';
  errorMessages: string[] = [];
  successMessage: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  register() {
    this.authService.register(this.username, this.password, this.email).subscribe(
      (response: any) => {
        if (response.isSuccess) {
          this.successMessage = response.messages[0];
          this.errorMessages = [];
          setTimeout(() => this.router.navigate(['/']), 2000);  // Redirect after 2 seconds
        } else {
          this.errorMessages = response.messages;
          this.successMessage = '';
        }
      },
      error => {
        this.errorMessages = error.error.messages || ['Unknown error occurred'];
        this.successMessage = '';
      }
    );
  }
}
