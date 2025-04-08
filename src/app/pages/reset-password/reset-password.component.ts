import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '@services/auth.service';
import { take } from 'rxjs';
import { MaterialModule } from '@modules/material.module';
import { passwordMatchValidator } from '@utils/validators.util';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MaterialModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  token = '';
  isValidToken = false;
  resetError = '';
  resetSuccess = false;

  resetForm = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required]],
    confirmPassword: ['', [Validators.required]]
  }, {
    validators: passwordMatchValidator('newPassword', 'confirmPassword')
  });

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.router.navigate(['/not-found']);
      return;
    }

    this.authService.isValidPasswordResetToken(this.token)
      .pipe(take(1))
      .subscribe({
        next: (isValid) => {
          this.isValidToken = isValid;
          if (!isValid) {
            this.router.navigate(['/not-found']);
          }
        },
        error: () => {
          this.router.navigate(['/not-found']);
        }
      });
  }

  resetPassword() {
    if (this.resetForm.invalid || !this.isValidToken) return;

    const { newPassword, confirmPassword } = this.resetForm.getRawValue();
    this.authService.resetPassword(this.token, newPassword, confirmPassword)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.resetSuccess = true;
          setTimeout(() => this.router.navigate(['/login']), 3000);
        },
        error: (err) => {
          this.resetError = err.error?.message || 'Password reset failed';
        }
      });
  }
}