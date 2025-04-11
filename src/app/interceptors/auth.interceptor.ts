import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@services/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const token = localStorage.getItem('access_token');
  const expiresAt = localStorage.getItem('token_expires_at');
  
  // Check if token is expired
  if (token && expiresAt && Date.now() >= Number(expiresAt)) {
    authService.forceLogout('Your session has expired');
    return next(req); // Continue request without token (will fail)
  }
  
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};