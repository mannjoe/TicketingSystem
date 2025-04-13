import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '@modules/material.module';
import { PageHeaderComponent } from '@components/page-header/page-header.component';
import { SearchContainerComponent } from '@components/search-container/search-container.component';
import { ViewTableComponent } from '@components/view-table/view-table.component';
import { DynamicInputComponent } from '@components/dynamic-input/dynamic-input.component';
import { DialogComponent } from '@components/dialog/dialog.component';

import { UserService } from '@services/user.service';

import { USERS_COLUMN_MAPPINGS } from '@shared/constants';
import { ViewTableColumn } from '@interfaces/ViewTable.interface';

import { environment } from '@environments/environment';
import { joinUrl } from '@utils/url.util';
import { passwordMatchValidator } from '@utils/validators.util';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    PageHeaderComponent,
    DynamicInputComponent,
    ReactiveFormsModule,
    SearchContainerComponent,
    ViewTableComponent
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  // Inject dependencies
  router = inject(Router);
  fb = inject(FormBuilder);
  dialog = inject(MatDialog);
  userService = inject(UserService);

  // ViewChild
  @ViewChild('createUser') createUserTemplate!: TemplateRef<any>;

  // API and observable data
  availableRoles$: Observable<any[]> = this.userService.getAllRoles();
  usersEndpoint: string = joinUrl(environment.apiUrl, 'users');
  tableColumns: ViewTableColumn[] = USERS_COLUMN_MAPPINGS;

  // Users data
  users: any[] = [];
  displayedUsers: any[] = [];

  // Form controls
  usernameFormControl = new FormControl('', [Validators.required]);
  emailFormControl = new FormControl('', [Validators.required, Validators.email]);
  passwordFormControl = new FormControl('', [Validators.required]);
  confirmPasswordFormControl = new FormControl('', [Validators.required]);
  firstNameFormControl = new FormControl('', [Validators.required]);
  lastNameFormControl = new FormControl('', [Validators.required]);
  roleFormControl = new FormControl('', [Validators.required]);

  // Forms
  userForm!: FormGroup;
  filterForm!: FormGroup;

  // Filter options
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
    this.initializeForms();
    this.fetchUsers();

    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
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
    this.userService.getAllUsers().subscribe({
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
      return (
        (!formValue.username || user.username.toLowerCase().includes(formValue.username.toLowerCase())) &&
        (!formValue.fullName || user.fullName.toLowerCase().includes(formValue.fullName.toLowerCase())) &&
        (!formValue.email || user.email?.toLowerCase().includes(formValue.email.toLowerCase())) &&
        (!formValue.roles || user.role === formValue.roles) &&
        (!formValue.statuses || user.active?.toString() === formValue.statuses)
      );
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
          this.fetchUsers();
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
