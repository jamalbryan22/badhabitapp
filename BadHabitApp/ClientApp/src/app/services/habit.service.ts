import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface DefaultHabit {
  habitId: number;
  name: string;
  description: string;
  defaultCostPerOccurrence: number | null;
  defaultOccurrencesPerDay: number | null;
}

export interface UserHabit {
  userHabitId: number;
  userId: string;
  habitId?: number; // Nullable for custom habits
  habit?: DefaultHabit; // May be undefined for custom habits
  name?: string;
  description?: string;
  costPerOccurrence: number | null;
  occurrencesPerDay: number | null;
  isActive: boolean;
  startDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  private baseUrl = 'https://localhost:7159/api';  // Adjust the URL as needed

  constructor(private http: HttpClient) { }

  // Get default habits
  getDefaultHabits(): Observable<DefaultHabit[]> {
    return this.http.get<DefaultHabit[]>(`${this.baseUrl}/defaulthabits`);
  }

  // Get user's habits
  getUserHabits(): Observable<UserHabit[]> {
    return this.http.get<UserHabit[]>(`${this.baseUrl}/userhabits`);
  }

  // Create a new user habit (either custom or default)
  createUserHabit(habitData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/UserHabits`, habitData)
      .pipe(
        catchError(this.handleError) // catch and handle errors here
      );
  }

  // Error handling function
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      // Backend error
      errorMessage = `Server error: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage); // Return an observable with a user-facing error message
  }

  // Delete a user's habit
  deleteUserHabit(userHabitId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/userhabits/${userHabitId}`);
  }
}
