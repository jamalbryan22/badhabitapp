import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Relapse {
  id: number;
  userHabitId: number;
  relapseDate: string;
  reason: string;
}

export interface UserHabit {
  id: number;
  userId: string;
  addictionType: string;
  habitStartDate: string;
  habitDescription?: string;
  userMotivation?: string;
  costPerOccurrence?: number;
  occurrencesPerMonth?: number;
  goalType: string;
  goalMetric?: string;
  goalValue?: number;
  relapses?: Relapse[];
}

@Injectable({
  providedIn: 'root',
})
export class HabitService {
  private baseUrl = 'https://localhost:7159/api'; // Adjust the URL as needed

  constructor(private http: HttpClient) { }

  // get list of habit ids associated with the user
  getUserHabitIds(userId: string): Observable<number[]> {
    return this.http
      .get<number[]>(`${this.baseUrl}/userhabits`)
      .pipe(catchError(this.handleError));
  }

  getUserHabit(id: number): Observable<UserHabit> {
    return this.http
      .get<UserHabit>(`${this.baseUrl}/userhabits/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Log relapse for a specific habit
  logRelapse(habitId: number, reasonForRelapse: string, relapseDate?: string): Observable<void> {
    const relapseData: any = {
      reason: reasonForRelapse
    };
    if (relapseDate) {
      relapseData.relapseDate = relapseDate;
    }
    return this.http
      .post<void>(`${this.baseUrl}/userhabits/${habitId}/logrelapse`, relapseData)
      .pipe(catchError(this.handleError));
  }

  updateUserHabit(id: number, updatedHabit: UserHabit): Observable<UserHabit> {
    return this.http
      .put<UserHabit>(`${this.baseUrl}/userhabits/${id}`, updatedHabit)
      .pipe(catchError(this.handleError));
  }

  // Create a new user habit
  createUserHabit(habitData: any): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/UserHabits`, habitData)
      .pipe(catchError(this.handleError));
  }

  // Delete a user's habit
  deleteUserHabit(userHabitId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/userhabits/${userHabitId}`)
      .pipe(catchError(this.handleError));
  }

  // Get all relapses for a specific habit
  getRelapses(habitId: number): Observable<Relapse[]> {
    return this.http
      .get<Relapse[]>(`${this.baseUrl}/userhabits/${habitId}/relapses`)
      .pipe(catchError(this.handleError));
  }

  // Delete a specific relapse
  deleteRelapse(habitId: number, relapseId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/userhabits/${habitId}/relapses/${relapseId}`)
      .pipe(catchError(this.handleError));
  }

  // Delete all relapses for a specific habit
  deleteAllRelapses(habitId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/userhabits/${habitId}/relapses`)
      .pipe(catchError(this.handleError));
  }

  // Update a specific relapse
  updateRelapse(habitId: number, relapseId: number, updatedRelapse: Relapse): Observable<Relapse> {
    const relapseData: any = {
      reason: updatedRelapse.reason,
      relapseDate: updatedRelapse.relapseDate
    };
    return this.http
      .put<Relapse>(`${this.baseUrl}/userhabits/${habitId}/relapses/${relapseId}`, relapseData)
      .pipe(catchError(this.handleError));
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
}
