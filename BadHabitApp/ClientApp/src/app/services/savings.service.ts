import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SavingsService {

  private baseUrl = 'http://localhost:4200/';

  constructor(private http: HttpClient) { }

  calculateSavings(costPerDay: number, daysWithoutHabit: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/calculate`, { params: { costPerDay, daysWithoutHabit } });
  }
}
