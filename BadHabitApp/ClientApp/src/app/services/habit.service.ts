import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HabitService {

  private baseUrl = 'http://localhost:4200/';

  constructor(private http: HttpClient) { }

  addHabit(habit: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, { habit });
  }

  listHabits(): Observable<any> {
    return this.http.get(`${this.baseUrl}/list`);
  }

  removeHabit(habit: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/remove`, { params: { habit } });
  }
}
