import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserTimeZone {
  timeZoneId: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = 'https://localhost:7159/Account'; // Adjust the base URL as needed

  constructor(private http: HttpClient) { }

  getUserTimeZone(): Observable<UserTimeZone> {
    return this.http.get<UserTimeZone>(`${this.baseUrl}/timezone`);
  }
}
