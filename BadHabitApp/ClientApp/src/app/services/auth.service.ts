import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'https://localhost:5150/api/auth';  // URL of the .NET backend

  constructor(private http: HttpClient) { }

  register(username: string, password: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.baseUrl}/register`, { username, password }, { headers });
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

  // Check if the user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null; // Simple check, can be expanded to check token validity
  }

  // Clear token on logout
  logout(): void {
    localStorage.removeItem('token');
  }
}
