import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  register() {
    this.authService.register(this.username, this.password).subscribe(
      (response: any) => {
        this.successMessage = response.message;
        this.errorMessage = '';

        setTimeout(() => this.router.navigate(['/']), 2000);  // Redirect after 2 seconds
      },
      (error) => {
        this.errorMessage = error.error.message;
        this.successMessage = '';
      }
    );
  }
}
