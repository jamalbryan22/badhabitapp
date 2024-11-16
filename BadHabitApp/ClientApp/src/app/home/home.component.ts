import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit { // Implement OnInit
  isLoggedIn: boolean = false; // Property to track authentication status
  username: string | null = null; // Property to store the username (email)

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated(); // Check if user is authenticated
    if (this.isLoggedIn) {
      this.username = this.authService.getUsername(); // Get the username (email)
    }
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/habits']); // Navigate to the dashboard/habits page
  }
}
