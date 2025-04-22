import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8000/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string) {
    return this.http.post(`${this.baseUrl}/token/`, { username, password });
  }

  saveToken(token: string) {
    localStorage.setItem('access', token);
  }

  getToken() {
    return localStorage.getItem('access');
  }

  logout() {
    localStorage.removeItem('access');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
