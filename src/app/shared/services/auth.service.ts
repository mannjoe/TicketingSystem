import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap, BehaviorSubject, throwError } from 'rxjs';
import { environment } from '@environments/environment';
import { joinUrl } from '@utils/url.util';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  // Add other user properties as needed
}

interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = joinUrl(environment.apiUrl, 'auth');
  private authStateSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  authState$ = this.authStateSubject.asObservable();

  private http = inject(HttpClient);

  login(username: string, password: string): Observable<User> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/login`,
      { username, password }
    ).pipe(
      tap((response) => {
        this.storeAuthData(response);
        this.authStateSubject.next(true);
      }),
      map(response => response.user),
      catchError(error => {
        this.clearAuthData();
        return throwError(() => error);
      })
    );
  }

  logout(): Observable<void> {
    this.clearAuthData();
    this.authStateSubject.next(false);

    // Optional: Call server-side logout if needed
    return this.http.post<void>(`${this.apiUrl}/logout`, {}).pipe(
      catchError(error => {
        console.error('Logout API error:', error);
        return of(undefined);
      })
    );
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem('current_user');
    return user ? JSON.parse(user) : null;
  }

  getUsername(): string | undefined {
    return this.getCurrentUser()?.username;
  }

  isLoggedIn(): boolean {
    return this.hasValidToken();
  }

  sendPasswordResetEmail(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string, confirmPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, {
      token,
      newPassword,
      confirmPassword
    });
  }

  isValidPasswordResetToken(token: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/validate-reset-token`, { params: { token } });
  }

  private storeAuthData(response: AuthResponse): void {
    localStorage.setItem('access_token', response.token);
    if (response.refreshToken) {
      localStorage.setItem('refresh_token', response.refreshToken);
    }
    localStorage.setItem('current_user', JSON.stringify(response.user));
  }

  private clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem('access_token');
    // Add token expiration check if needed
    return !!token;
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }
}