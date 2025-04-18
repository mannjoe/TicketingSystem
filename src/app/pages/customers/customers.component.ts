import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { MaterialModule } from '@modules/material.module';
import { PageHeaderComponent } from '@components/page-header/page-header.component';
import { DynamicInputComponent } from '@components/dynamic-input/dynamic-input.component';
import { DialogComponent } from '@components/dialog/dialog.component';
import { SearchContainerComponent } from '@components/search-container/search-container.component';
import { ViewTableComponent } from '@components/view-table/view-table.component';

import { CustomerService } from '@services/customer.service';
import { CUSTOMERS_COLUMN_MAPPINGS } from '@shared/constants';
import { joinUrl } from '@utils/url.util';
import { environment } from '@environments/environment';
import { ViewTableColumn } from '@interfaces/ViewTable.interface';

import { Observable } from 'rxjs';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-customers',
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
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss'
})
export class CustomersComponent implements OnInit {
  router = inject(Router);
  fb = inject(FormBuilder);
  dialog = inject(MatDialog);
  authService = inject(AuthService);
  customerService = inject(CustomerService);

  customersEndpoint: string = joinUrl(environment.apiUrl, 'customers');
  availableTypes$: Observable<any[]> = this.customerService.getAllTypes();
  tableColumns: ViewTableColumn[] = CUSTOMERS_COLUMN_MAPPINGS;

  customers: any[] = [];
  displayedCustomers: any[] = [];

  typeOptions = [
    { value: '', label: 'All' },
    { value: 'COMPANY', label: 'COMPANY' },
    { value: 'INDIVIDUAL', label: 'INDIVIDUAL' },
  ];

  statusOptions = [
    { value: '', label: 'All' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
  ];

  nameFormControl!: FormControl;
  typeFormControl!: FormControl;
  identifierNoFormControl!: FormControl;

  customerForm!: FormGroup;
  filterForm!: FormGroup;

  @ViewChild('createCustomer') createCustomerTemplate!: TemplateRef<any>;

  ngOnInit(): void {
    this.initializeFormControls();
    this.initializeForms();
    this.fetchCustomers();

    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  private initializeFormControls(): void {
    this.nameFormControl = new FormControl('', [Validators.required]);
    this.typeFormControl = new FormControl('', [Validators.required]);
    this.identifierNoFormControl = new FormControl('', [Validators.required]);
  }

  private initializeForms(): void {
    this.customerForm = this.fb.group({
      name: this.nameFormControl,
      type: this.typeFormControl,
      identifierNo: this.identifierNoFormControl
    });

    this.filterForm = this.fb.group({
      name: [''],
      identifierNo: [''],
      email: [''],
      phone: [''],
      types: ['', { nonNullable: true }],
      statuses: ['', { nonNullable: true }]
    });
  }

  private fetchCustomers(): void {
    this.customerService.getAllCustomers().subscribe({
      next: (response) => {
        this.customers = response;
        this.displayedCustomers = [...this.customers];
        this.applyFilters();
      },
      error: (error) => {
        console.error('Failed to fetch customers:', error);
      }
    });
  }

  private applyFilters(): void {
    const formValue = this.filterForm.value;

    this.displayedCustomers = this.customers.filter(customer => {
      if (formValue.name && !customer.name.toLowerCase().includes(formValue.name.toLowerCase())) return false;
      if (formValue.identifierNo && !customer.identifierNo.toLowerCase().includes(formValue.identifierNo.toLowerCase())) return false;
      if (formValue.email && !customer.email.toLowerCase().includes(formValue.email.toLowerCase())) return false;
      if (formValue.phone && !customer.phone.toLowerCase().includes(formValue.phone.toLowerCase())) return false;
      if (formValue.types && customer.type !== formValue.types) return false;

      if (formValue.statuses) {
        const customerStatus = customer.active?.toString() || 'false';
        if (customerStatus !== formValue.statuses) return false;
      }

      return true;
    });
  }

  onCreateCustomer(): void {
    if (!this.createCustomerTemplate) return;

    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title: 'Create Customer',
        contentTemplate: this.createCustomerTemplate,
        formGroup: this.customerForm,
        apiUrl: this.customersEndpoint
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.fetchCustomers();
    });
  }

  onRowClick(row: any): void {
    this.router.navigate(['/customers', row.id]);
  }

  clearAllFilters(): void {
    this.filterForm.reset({
      name: '',
      email: '',
      phone: '',
      types: '',
      statuses: ''
    });
  }
}
