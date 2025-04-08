import { Component, inject, OnInit, OnDestroy } from '@angular/core';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-users-detail',
  standalone: true,
  imports: [CommonModule, MaterialModule, PageHeaderComponent, EntityDetailsComponent, DynamicInputComponent, ReactiveFormsModule],
  templateUrl: './users-detail.component.html',
  styleUrls: ['./users-detail.component.scss']
})
export class UsersDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private title = inject(Title);
  private snackBar = inject(MatSnackBar);

  navLinks: EntityNavLink[] = [
    { id: 'profile', label: 'Profile', icon: 'person_outline' },
  ];

  userForm!: FormGroup;
  isEditMode: boolean = false;
  user: any;
  fullName!: string;
  activeTab: string = 'profile';

  // Role options for radio buttons
  roleOptions = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'SUPPORT', label: 'Support' }
  ];

  statusOptions = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' }
  ];

  ngOnInit() {
    this.initializeForm();
    this.setupQueryParams();

    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const username = params['username'];
        this.loadUserData(username);
      });

    this.route.queryParams.subscribe((queryParams) => {
      if (queryParams['tab']) {
        this.activeTab = queryParams['tab'];
      } else {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { tab: 'profile' },
          queryParamsHandling: 'merge',
        });
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupQueryParams() {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(queryParams => {
        this.activeTab = queryParams['tab'] || 'profile';
      });
  }

  private loadUserData(username: string) {
    this.userService.getUserByUsername(username)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.user = user;
          this.fullName = this.user.fullName;
          this.title.setTitle(`${this.user.username}'s Profile`);
          this.updateFormValues();
        },
        error: (error) => {
          console.error('Failed to load user', error);
          this.snackBar.open('Failed to load user data', 'Close', { duration: 5000 });
          this.router.navigate(['/users']);
        }
      });
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      active: [false]
    });
  }

  get firstNameFormControl(): FormControl {
    return this.userForm.get('firstName') as FormControl;
  }

  get lastNameFormControl(): FormControl {
    return this.userForm.get('lastName') as FormControl;
  }

  get emailFormControl(): FormControl {
    return this.userForm.get('email') as FormControl;
  }

  get roleFormControl(): FormControl {
    return this.userForm.get('role') as FormControl;
  }

  get activeFormControl(): FormControl {
    return this.userForm.get('active') as FormControl;
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

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    this.userForm[this.isEditMode ? 'enable' : 'disable']();
  }

  onSubmit() {
    if (this.userForm.valid && this.isEditMode) {
      const updatedUser = {
        username: this.user.username,
        ...this.userForm.value
      }
      console.log(updatedUser);

      this.userService.updateUser(updatedUser).subscribe({
        next: (response) => {
          this.user = response;
          this.updateFormValues();
          this.isEditMode = false;
          this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.snackBar.open('Error updating user', 'Close', { duration: 3000 });
        }
      });
    }
  }
}