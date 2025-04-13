import { inject, Injectable, NgZone, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap, BehaviorSubject, throwError } from 'rxjs';
import { environment } from '@environments/environment';
import { joinUrl } from '@utils/url.util';
import { Router } from '@angular/router';

interface User {
  id: number;
  username: string;
  email: string;
  userRole: string;
}

interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
  expiresIn?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy {
  private apiUrl = joinUrl(environment.apiUrl, 'auth');
  private authStateSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public authState$ = this.authStateSubject.asObservable();

  // Timeout constants
  private readonly INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
  private readonly SESSION_DURATION = 60 * 60 * 1000; // 1 hour

  // Timer references
  private inactivityTimer: ReturnType<typeof setTimeout> | null = null;
  private sessionTimer: ReturnType<typeof setTimeout> | null = null;
  private lastActivityTime: number | null = null;

  private http = inject(HttpClient);
  private ngZone = inject(NgZone);
  private router = inject(Router);

  constructor() {
    // Initialize timers if valid token exists
    if (this.hasValidToken()) {
      this.startTimers();
      this.setupActivityListeners();
    }
  }

  ngOnDestroy(): void {
    this.clearTimers();
    this.removeActivityListeners();
  }

  login(username: string, password: string): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap((response) => {
        this.storeAuthData(response);
        this.authStateSubject.next(true);
        this.startTimers();
        this.setupActivityListeners();
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
    this.clearTimers();
    this.removeActivityListeners();
    this.authStateSubject.next(false);
    this.router.navigate(['/login']);

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

  getCurrentUserRole(): string | null {
    const user = this.getCurrentUser();
    return user?.userRole || null;
  }

  isAdmin(): boolean {
    return this.getCurrentUserRole() === 'ADMIN';
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
    const expiresAt = Date.now() + (response.expiresIn || this.SESSION_DURATION);
    
    localStorage.setItem('access_token', response.token);
    localStorage.setItem('token_expires_at', expiresAt.toString());
    
    if (response.refreshToken) {
      localStorage.setItem('refresh_token', response.refreshToken);
    }
    localStorage.setItem('current_user', JSON.stringify(response.user));
  }

  private clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_expires_at');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem('access_token');
    const expiresAt = localStorage.getItem('token_expires_at');
    
    if (!token || !expiresAt) return false;
    
    return Date.now() < Number(expiresAt);
  }

  private startTimers(): void {
    this.clearTimers();
    this.lastActivityTime = Date.now();
    
    this.ngZone.runOutsideAngular(() => {
      // Session timer (1 hour total)
      this.sessionTimer = setTimeout(() => {
        this.ngZone.run(() => this.forceLogout('Your session has expired'));
      }, this.getRemainingSessionTime());
      
      // Inactivity timer (15 minutes)
      this.resetInactivityTimer();
    });
  }

  private getRemainingSessionTime(): number {
    const expiresAt = localStorage.getItem('token_expires_at');
    return expiresAt ? Math.max(0, Number(expiresAt) - Date.now()) : 0;
  }

  private resetInactivityTimer(): void {
    this.clearInactivityTimer();
    
    this.ngZone.runOutsideAngular(() => {
      this.inactivityTimer = setTimeout(() => {
        this.ngZone.run(() => {
          if (this.hasValidToken()) {
            this.forceLogout('You have been logged out due to inactivity');
          }
        });
      }, this.INACTIVITY_TIMEOUT);
    });
  }

  private clearTimers(): void {
    this.clearInactivityTimer();
    this.clearSessionTimer();
  }

  private clearInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  private clearSessionTimer(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  private setupActivityListeners(): void {
    window.addEventListener('mousemove', this.onUserActivity.bind(this));
    window.addEventListener('keypress', this.onUserActivity.bind(this));
    window.addEventListener('scroll', this.onUserActivity.bind(this));
    window.addEventListener('click', this.onUserActivity.bind(this));
    window.addEventListener('touchstart', this.onUserActivity.bind(this));
  }

  private removeActivityListeners(): void {
    window.removeEventListener('mousemove', this.onUserActivity.bind(this));
    window.removeEventListener('keypress', this.onUserActivity.bind(this));
    window.removeEventListener('scroll', this.onUserActivity.bind(this));
    window.removeEventListener('click', this.onUserActivity.bind(this));
    window.removeEventListener('touchstart', this.onUserActivity.bind(this));
  }

  private onUserActivity(): void {
    const now = Date.now();
    if (!this.lastActivityTime || now - this.lastActivityTime > 1000) {
      this.lastActivityTime = now;
      if (this.hasValidToken()) {
        this.resetInactivityTimer();
      }
    }
  }

  forceLogout(reason: string): void {
    console.log(reason);
    this.clearTimers();
    this.removeActivityListeners();
    this.clearAuthData();
    this.authStateSubject.next(false);
    this.router.navigate(['/login'], {
      queryParams: { sessionTimeout: true },
      replaceUrl: true
    });
  }
}