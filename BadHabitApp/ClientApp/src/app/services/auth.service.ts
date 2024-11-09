// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'https://localhost:7159'; // URL of the .NET backend

  constructor(private http: HttpClient, private jwtHelper: JwtHelperService) { }

  register(registrationData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' }); // Ensure headers are set
    return this.http.post(`${this.baseUrl}/Account/register`, registrationData, { headers });
  }

  login(email: string, password: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http
      .post(`${this.baseUrl}/Account/login`, { email, password }, { headers })
      .pipe(
        tap((response: any) => {
          if (response.token) {
            this.storeToken(response.token); // Store JWT token
          }
        })
      );
  }

  // Forgot password method
  forgotPassword(email: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.baseUrl}/Account/forgot-password`, { email }, { headers });
  }

  // Reset password method
  resetPassword(data: { email: string; token: string; newPassword: string }): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.baseUrl}/Account/reset-password`, data, { headers });
  }

  // Send the token with each authenticated request
  getProfile(): Observable<any> {
    const token = this.getToken(); // Get the stored JWT token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`, // Attach the token as Bearer
    });

    return this.http.get(`${this.baseUrl}/profile`, { headers });
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
      return (
        decodedToken?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || null
      ); // Extract from 'name' claim
    }
    return null;
  }

  getUserID(): string | null {
    const token = this.getToken();
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      return (
        decodedToken?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || null
      ); // Extract from 'name' claim
    }
    return null;
  }

  // Check if the user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    return token != null && !this.jwtHelper.isTokenExpired(token);
  }

  // Clear token on logout
  logout(): void {
    localStorage.removeItem('token');
  }
}
