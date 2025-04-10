import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MaterialModule } from '@modules/material.module';
import { PageHeaderComponent } from '@components/page-header/page-header.component';
import { ActivatedRoute, Router } from '@angular/router';
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
  selector: 'app-tickets',
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
  templateUrl: './tickets.component.html',
  styleUrl: './tickets.component.scss'
})
export class TicketsComponent implements OnInit {
  // Inject dependencies
  router = inject(Router);
  route = inject(ActivatedRoute);
  fb = inject(FormBuilder);
  dialog = inject(MatDialog);
  apiService = inject(ApiService);

  // Observable data
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
  usernameFormControl = new FormControl('', [Validators.required]);
  emailFormControl = new FormControl('', [Validators.required, Validators.email]);
  passwordFormControl = new FormControl('', [Validators.required]);
  confirmPasswordFormControl = new FormControl('', [Validators.required]);
  firstNameFormControl = new FormControl('', [Validators.required]);
  lastNameFormControl = new FormControl('', [Validators.required]);
  roleFormControl = new FormControl('', [Validators.required]);

  @ViewChild('createUser') createUserTemplate!: TemplateRef<any>;

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

    // Subscribe to form value changes
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
      return (
        (!formValue.username || user.username.toLowerCase().includes(formValue.username.toLowerCase())) &&
        (!formValue.fullName || user.fullName.toLowerCase().includes(formValue.fullName.toLowerCase())) &&
        (!formValue.email || user.email?.toLowerCase().includes(formValue.email.toLowerCase())) &&
        (!formValue.roles || user.role === formValue.roles) &&
        (!formValue.statuses || user.active?.toString() === formValue.statuses)
      );
    });
  }

  onAddTicket(): void {
    this.router.navigate(['create'], { relativeTo: this.route });
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
