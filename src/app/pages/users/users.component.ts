import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MaterialModule } from '@modules/material.module';
import { PageHeaderComponent } from '@components/page-header/page-header.component';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '@services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '@components/dialog/dialog.component';
import { CommonModule } from '@angular/common';
import { DynamicInputComponent } from '@components/dynamic-input/dynamic-input.component';
import { Observable } from 'rxjs';
import { joinUrl } from '@utils/url.util';
import { environment } from '@environments/environment';
import { passwordMatchValidator } from '@utils/validators.util';
import { SearchContainerComponent } from '@components/search-container/search-container.component';
import { ViewTableComponent } from '@components/view-table/view-table.component';
import { ViewTableColumn } from '@interfaces/ViewTable.interface';
import { USERS_COLUMN_MAPPINGS } from '@shared/constants';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, MaterialModule, PageHeaderComponent, DynamicInputComponent, ReactiveFormsModule, SearchContainerComponent, ViewTableComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  router: Router = inject(Router);
  fb: FormBuilder = inject(FormBuilder);
  dialog: MatDialog = inject(MatDialog);
  apiService: ApiService = inject(ApiService);

  availableRoles$: Observable<string[]> = this.apiService.get(joinUrl(environment.apiUrl, 'users/roles'));
  usersEndpoint: string = joinUrl(environment.apiUrl, 'users');
  tableColumns: ViewTableColumn[] = USERS_COLUMN_MAPPINGS;
  
  // Data
  users: any[] = [];
  displayedUsers: any[] = [];
  
  // Forms
  userForm!: FormGroup;
  filterForm!: FormGroup;

  // Form Controls
  usernameFormControl!: FormControl;
  emailFormControl!: FormControl;
  passwordFormControl!: FormControl;
  confirmPasswordFormControl!: FormControl;
  firstNameFormControl!: FormControl;
  lastNameFormControl!: FormControl;
  roleFormControl!: FormControl;

  @ViewChild('createUser') createUserTemplate!: TemplateRef<any>;

  statusOptions = [
    { value: '', label: 'All' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
  ];

  roleOptions = [
    { value: '', label: 'All' },
    { value: 'ADMIN', label: 'ADMIN' },
    { value: 'SUPPORT', label: 'SUPPORT' },
  ];

  ngOnInit(): void {
    this.initializeFormControls();
    this.initializeForms();
    this.fetchUsers();
    
    // Subscribe to form value changes
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  private initializeFormControls(): void {
    this.usernameFormControl = new FormControl('', [Validators.required]);
    this.emailFormControl = new FormControl('', [Validators.required, Validators.email]);
    this.passwordFormControl = new FormControl('', [Validators.required]);
    this.confirmPasswordFormControl = new FormControl('', [Validators.required]);
    this.firstNameFormControl = new FormControl('', [Validators.required]);
    this.lastNameFormControl = new FormControl('', [Validators.required]);
    this.roleFormControl = new FormControl('', [Validators.required]);
  }

  private initializeForms(): void {
    this.userForm = this.fb.group({
      username: this.usernameFormControl,
      email: this.emailFormControl,
      password: this.passwordFormControl,
      confirmPassword: this.confirmPasswordFormControl,
      firstName: this.firstNameFormControl,
      lastName: this.lastNameFormControl,
      role: this.roleFormControl
    }, {
      validators: passwordMatchValidator('password', 'confirmPassword')
    });

    this.filterForm = this.fb.group({
      username: [''],
      fullName: [''],
      email: [''],
      roles: ['', { nonNullable: true }],
      statuses: ['', { nonNullable: true }],
    });
  }

  private fetchUsers(): void {
    this.apiService.get<any[]>(this.usersEndpoint).subscribe({
      next: (response) => {
        this.users = response;
        this.displayedUsers = [...this.users];
        this.applyFilters();
      },
      error: (error) => {
        console.error('Failed to fetch users:', error);
      }
    });
  }

  private applyFilters(): void {
    const formValue = this.filterForm.value;
    this.displayedUsers = this.users.filter(user => {
      // Username filter
      if (formValue.username && !user.username.toLowerCase().includes(formValue.username.toLowerCase())) {
        return false;
      }

      // Name filter - search in the full name field
      if (formValue.fullName && !user.fullName.toLowerCase().includes(formValue.fullName.toLowerCase())) {
        return false;
      }

      // Email filter - with null check
      if (formValue.email) {
        const userEmail = user.email?.toLowerCase() || '';
        if (!userEmail.includes(formValue.email.toLowerCase())) {
          return false;
        }
      }

      // Role filter
      if (formValue.roles && user.role !== formValue.roles) {
        return false;
      }

      // Status filter - handle boolean values
      if (formValue.statuses) {
        const userStatus = user.active?.toString() || 'false';
        if (userStatus !== formValue.statuses) {
          return false;
        }
      }

      return true;
    });
  }

  onCreateUser(): void {
    if (this.createUserTemplate) {
      const dialogRef = this.dialog.open(DialogComponent, {
        data: {
          title: 'Create User',
          contentTemplate: this.createUserTemplate,
          formGroup: this.userForm,
          apiUrl: this.usersEndpoint
        },
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.fetchUsers(); // Refresh the user list after creating a new user
        }
      });
    }
  }

  onRowClick(row: any): void {
    this.router.navigate(['/users', row.username]);
  }

  clearAllFilters(): void {
    this.filterForm.reset({
      username: '',
      fullName: '',
      email: '',
      roles: '',
      statuses: ''
    });
  }
}