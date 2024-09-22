import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'https://localhost:5150/api/auth';  // URL of the .NET backend
  private jwtHelper = new JwtHelperService();

  constructor(private http: HttpClient) { }

  register(username: string, password: string, email: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.baseUrl}/register`, { username, password, email }, { headers });
  }

  login(username: string, password: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.baseUrl}/login`, { username, password }, { headers });
  }

  // Store the JWT token in localStorage
  storeToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Retrieve the JWT token from localStorage
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Extract and return the username from the JWT token
  getUsername(): string | null {
    const token = this.getToken();
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      return decodedToken?.username || null; // Assuming the token has a 'username' field
    }
    return null;
  }

  // Check if the user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();

    // Check if token exists
    if (!token) {
      return false;
    }

    // Check if the token is expired
    const isExpired = this.jwtHelper.isTokenExpired(token);
    if (isExpired) {
      return false;
    }

    return true;
  }

  // Clear token on logout
  logout(): void {
    localStorage.removeItem('token');
  }
}
