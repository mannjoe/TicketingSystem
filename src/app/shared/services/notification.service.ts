import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  snackBar: MatSnackBar = inject(MatSnackBar);
  
  private defaultConfig: MatSnackBarConfig = {
    duration: 3000,
    verticalPosition: 'top',
    horizontalPosition: 'center'
  };

  showSuccess(message: string, config?: Partial<MatSnackBarConfig>): void {
    this.snackBar.open(message, 'Close', {
      ...this.defaultConfig,
      ...config,
      panelClass: ['success-snackbar']
    });
  }

  showError(message: string, config?: Partial<MatSnackBarConfig>): void {
    this.snackBar.open(message, 'Close', {
      ...this.defaultConfig,
      ...config,
      panelClass: ['error-snackbar']
    });
  }
}