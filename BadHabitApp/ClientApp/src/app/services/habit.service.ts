import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface UserHabit {
  userHabitId: number;
  userId: string;
  additionType: string;
  habitStartDate: string;
  habitDescription?: string;
  userMotivation?: string;
  costPerOccurrence?: number | null;
  occurrencesPerDay?: number | null;
  goalType: string;
  goalMetric?: string;
  goalValue?: number;
  relapses?: Relapse[];
}

export interface Relapse {
  id: number;
  relapseDate: string;
  reason: string;
}

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  private baseUrl = 'https://localhost:7159/api';  // Adjust the URL as needed

  constructor(private http: HttpClient) { }

  // get list of habit ids associated with the user
  getHabitIds(userId: string): Observable<number[]> {
    return this.http.get<number[]>(`${this.baseUrl}/userhabits`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // get UserHabit object for a specific habit id
  getUserHabit(userHabitId: number): Observable<UserHabit> {
    return this.http.get<UserHabit>(`${this.baseUrl}/userhabits/${userHabitId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Log relapse for a specific habit
  logRelapse(habitId: number, reasonForRelapse: string): Observable<void> {
    const relapseData = { reason: reasonForRelapse }; // Payload with reason
    return this.http.post<void>(`${this.baseUrl}/userhabits/${habitId}/logrelapse`, relapseData)
      .pipe(
        catchError(this.handleError)
      );
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
