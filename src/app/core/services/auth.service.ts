import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/v1/auth';
  private tokenKey = 'maze_master_token';
  private userKey = 'maze_master_user';
  
  private authStatusSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  
  public authStatus$ = this.authStatusSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Check if user is authenticated on app load
  checkAuth(): void {
    const token = localStorage.getItem(this.tokenKey);
    const userJson = localStorage.getItem(this.userKey);
    
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
        this.authStatusSubject.next(true);
      } catch (e) {
        this.logout();
      }
    }
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => this.handleAuthentication(response)),
      map(response => response.user),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => new Error(error.error?.message || 'Login failed'));
      })
    );
  }

  register(username: string, email: string, password: string): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { username, email, password }).pipe(
      tap(response => this.handleAuthentication(response)),
      map(response => response.user),
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => new Error(error.error?.message || 'Registration failed'));
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.authStatusSubject.next(false);
  }

  isAuthenticated(): boolean {
    return this.authStatusSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private handleAuthentication(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
    this.authStatusSubject.next(true);
  }
  
  // For demo/development purposes - simulate login without backend
  simulateLogin(username: string): void {
    const mockUser: User = {
      id: 1,
      username,
      email: `${username}@example.com`,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
    
    localStorage.setItem(this.tokenKey, mockToken);
    localStorage.setItem(this.userKey, JSON.stringify(mockUser));
    this.currentUserSubject.next(mockUser);
    this.authStatusSubject.next(true);
  }
}