import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { NotificationService } from '@services/notification.service';
import { tap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '@services/auth.service';

export const apiNotificationInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const authService = inject(AuthService);
  const shouldNotify = req.method !== 'GET' && authService.isLoggedIn();
  
  return next(req).pipe(
    tap({
      next: (event) => {
        if (shouldNotify && event instanceof HttpResponse) {
          let notificationMessage = '';
          switch (req.method) {
            case 'POST':
              notificationMessage = 'Created successfully';
              break;
            case 'PUT':
            case 'PATCH':
              notificationMessage = 'Updated successfully';
              break;
            case 'DELETE':
              notificationMessage = 'Deleted successfully';
              break;
          }
          if (notificationMessage) {
            notificationService.showSuccess(notificationMessage);
          }
        }
      },
      error: (error: HttpErrorResponse) => {
        if (shouldNotify) {
          let notificationMessage = 'Failed to perform operation. An error occurred.';
                   
          notificationService.showError(notificationMessage);
        }
      }
    })
  );
};