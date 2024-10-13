import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Habit {
  habitId: number;
  name: string;
  description: string;
  defaultCostPerOccurrence: number | null;
  defaultOccurrencesPerDay: number | null;
  isDefault: boolean;
}

export interface UserHabit {
  userHabitId: number;
  habitId: number;
  habit: Habit;
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
  getDefaultHabits(): Observable<Habit[]> {
    return this.http.get<Habit[]>(`${this.baseUrl}/habits/defaults`);
  }

  // Get user's habits
  getUserHabits(): Observable<UserHabit[]> {
    return this.http.get<UserHabit[]>(`${this.baseUrl}/userhabits`);
  }

  // Create a new custom habit and associate it with the user
  createCustomHabit(habitData: any): Observable<UserHabit> {
    return this.http.post<UserHabit>(`${this.baseUrl}/userhabits`, habitData);
  }

  // Associate a default habit with the user
  associateHabit(habitId: number): Observable<UserHabit> {
    const data = { habitId };
    return this.http.post<UserHabit>(`${this.baseUrl}/userhabits/associate`, data);
  }

  // Delete a user's habit
  deleteUserHabit(userHabitId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/userhabits/${userHabitId}`);
  }
}
