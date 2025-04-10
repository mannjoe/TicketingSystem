import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@modules/material.module';
import { AuthService } from '@services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  standalone: true
})
export class LoginComponent implements OnInit {
  private fb: FormBuilder = inject(FormBuilder);
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);

  showForgotPassword: boolean = false;

  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  forgotPasswordForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  loginError: string | null = null;
  forgotPasswordError: string | null = null;
  forgotPasswordSuccess: string | null = null;

  get username() { return this.loginForm.get('username'); }
  get password() { return this.loginForm.get('password'); }
  get email() { return this.forgotPasswordForm.get('email'); }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['']);
    }
  }

  toggleForgotPassword() {
    this.showForgotPassword = !this.showForgotPassword;
    this.loginError = null;
    this.forgotPasswordError = null;
    this.forgotPasswordSuccess = null;
    this.loginForm.reset();
    this.forgotPasswordForm.reset();
  }

  login(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loginError = null;

    const { username, password } = this.loginForm.value;

    this.authService.login(username!, password!)
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.loginError = err.error?.message || 'Login failed. Please check your credentials.';
        },
      });
  }

  sendResetLink(): void {
    if (this.forgotPasswordForm.invalid) return;
  
    this.forgotPasswordError = null;
    this.forgotPasswordSuccess = null;
  
    const { email } = this.forgotPasswordForm.value;
  
    this.authService.sendPasswordResetEmail(email!)
      .subscribe({
        next: (response) => {
          this.forgotPasswordSuccess = response.message;
        },
        error: (err) => {
          this.forgotPasswordError = err.message || 'Failed to send reset link. Please try again.';
        }
      });
  }
}