import { Component, inject, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@modules/material.module';
import { PageHeaderComponent } from '@components/page-header/page-header.component';
import { EntityDetailsComponent } from '@components/entity-details/entity-details.component';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '@services/user.service';
import { Title } from '@angular/platform-browser';
import { EntityNavLink } from '@interfaces/EntityNavLink.interface';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicInputComponent } from '@components/dynamic-input/dynamic-input.component';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '@services/auth.service';
import { passwordMatchValidator } from '@utils/validators.util';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '@components/dialog/dialog.component';
import { joinUrl } from '@utils/url.util';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-users-detail',
  standalone: true,
  imports: [CommonModule, MaterialModule, PageHeaderComponent, EntityDetailsComponent, DynamicInputComponent, ReactiveFormsModule],
  templateUrl: './users-detail.component.html',
  styleUrls: ['./users-detail.component.scss']
})
export class UsersDetailComponent implements OnInit, OnDestroy {
  @ViewChild('changePassword') changePasswordTemplate!: TemplateRef<any>;

  private destroy$ = new Subject<void>();
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private title = inject(Title);
  private authService = inject(AuthService);
  dialog: MatDialog = inject(MatDialog);

  userForm!: FormGroup;
  changePasswordForm!: FormGroup;
  user: any;
  firstName!: string;
  lastName!: string;
  isEditMode = false;
  activeTab = 'profile';
  username = this.authService.getUsername() ?? '';
  changePasswordEndpoint = joinUrl(environment.apiUrl, `auth/change-password/${this.username}`);

  navLinks: EntityNavLink[] = [
    { id: 'profile', label: 'Profile', icon: 'person_outline' },
  ];

  roleOptions = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'SUPPORT', label: 'Support' }
  ];

  statusOptions = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' }
  ];

  ngOnInit() {
    this.initializeForms();
    this.setupRouteListeners();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      active: [false]
    });

    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required]],
      confirmNewPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator('newPassword', 'confirmNewPassword') });
  }

  private setupRouteListeners(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.loadUserData(params['username']);
    });

    this.route.queryParams.subscribe(queryParams => {
      this.activeTab = queryParams['tab'] || 'profile';
      if (!queryParams['tab']) {
        this.updateQueryParams();
      }
    });
  }

  private updateQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: 'profile' },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  private loadUserData(username: string): void {
    this.userService.getUserByUsername(username)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => this.handleUserData(user),
        error: () => this.router.navigate(['/users'])
      });
  }

  private handleUserData(user: any): void {
    this.user = user;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.title.setTitle(`${user.username}'s Profile`);
    this.updateFormValues();
  }

  private updateFormValues(): void {
    if (this.user) {
      this.userForm.patchValue({
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        role: this.user.role,
        active: this.user.active
      });
      this.userForm.disable();
    }
  }

  // Form control getters
  get firstNameFormControl(): FormControl { return this.userForm.get('firstName') as FormControl; }
  get lastNameFormControl(): FormControl { return this.userForm.get('lastName') as FormControl; }
  get emailFormControl(): FormControl { return this.userForm.get('email') as FormControl; }
  get roleFormControl(): FormControl { return this.userForm.get('role') as FormControl; }
  get activeFormControl(): FormControl { return this.userForm.get('active') as FormControl; }
  get currentPasswordFormControl(): FormControl { return this.changePasswordForm.get('currentPassword') as FormControl; }
  get newPasswordFormControl(): FormControl { return this.changePasswordForm.get('newPassword') as FormControl; }
  get confirmNewPasswordFormControl(): FormControl { return this.changePasswordForm.get('confirmNewPassword') as FormControl; }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    this.userForm[this.isEditMode ? 'enable' : 'disable']();
  }

  showChangePassword(): boolean {
    const currentUsername = this.authService.getUsername();
    const urlSegments = this.router.url.split('?')[0].split('/');
    const usernameSegment = urlSegments[urlSegments.length - 1];
    return !!currentUsername && usernameSegment.toLowerCase() === currentUsername.toLowerCase();
  }

  onChangePassword(): void {
    if (this.changePasswordTemplate) {
      this.dialog.open(DialogComponent, {
        data: {
          title: 'Change Password',
          contentTemplate: this.changePasswordTemplate,
          formGroup: this.changePasswordForm,
          apiUrl: this.changePasswordEndpoint,
          method: 'PUT'
        },
      });
    }
  }

  onSubmit(): void {
    if (this.userForm.valid && this.isEditMode) {
      const updatedUser = { username: this.user.username, ...this.userForm.value };
      
      this.userService.updateUser(updatedUser).subscribe({
        next: (response) => this.handleUpdateSuccess(response),
        error: (error) => console.error('Error updating user:', error)
      });
    }
  }

  private handleUpdateSuccess(response: any): void {
    this.user = response;
    this.updateFormValues();
    this.firstName = response.firstName;
    this.lastName = response.lastName;
    this.isEditMode = false;
  }
}