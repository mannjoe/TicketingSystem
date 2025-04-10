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
import { joinUrl } from '@utils/url.util';
import { environment } from '@environments/environment';
import { SearchContainerComponent } from '@components/search-container/search-container.component';
import { ViewTableComponent } from '@components/view-table/view-table.component';
import { ViewTableColumn } from '@interfaces/ViewTable.interface';
import { CUSTOMERS_COLUMN_MAPPINGS } from '@shared/constants';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, MaterialModule, PageHeaderComponent, DynamicInputComponent, ReactiveFormsModule, SearchContainerComponent, ViewTableComponent],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss'
})
export class CustomersComponent implements OnInit {
  // Injected services and dependencies
  router: Router = inject(Router);
  fb: FormBuilder = inject(FormBuilder);
  dialog: MatDialog = inject(MatDialog);
  apiService: ApiService = inject(ApiService);

  // Endpoints and data
  customersEndpoint: string = joinUrl(environment.apiUrl, 'customers');
  availableTypes$: Observable<string[]> = this.apiService.get(joinUrl(environment.apiUrl, 'customers/types'));
  tableColumns: ViewTableColumn[] = CUSTOMERS_COLUMN_MAPPINGS;
  
  customers: any[] = [];
  displayedCustomers: any[] = [];

  // Options for filters
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

  // Form controls
  nameFormControl!: FormControl;
  typeFormControl!: FormControl;
  identifierNoFormControl!: FormControl;

  // Forms
  customerForm!: FormGroup;
  filterForm!: FormGroup;

  // Template for creating a customer
  @ViewChild('createCustomer') createCustomerTemplate!: TemplateRef<any>;

  ngOnInit(): void {
    this.initializeFormControls();
    this.initializeForms();
    this.fetchCustomers();
    
    // Subscribe to form value changes
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  // Initialize form controls
  private initializeFormControls(): void {
    this.nameFormControl = new FormControl('', [Validators.required]);
    this.typeFormControl = new FormControl('', [Validators.required]);
    this.identifierNoFormControl = new FormControl('', [Validators.required]);
  }

  // Initialize forms
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

  // Fetch customers from the API
  private fetchCustomers(): void {
    this.apiService.get<any[]>(this.customersEndpoint).subscribe({
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

  // Apply filters based on the form values
  private applyFilters(): void {
    const formValue = this.filterForm.value;
    this.displayedCustomers = this.customers.filter(customer => {
      if (formValue.name && !customer.name.toLowerCase().includes(formValue.name.toLowerCase())) {
        return false;
      }

      if (formValue.identifierNo && !customer.identifierNo.toLowerCase().includes(formValue.identifierNo.toLowerCase())) {
        return false;
      }

      if (formValue.email && !customer.email.toLowerCase().includes(formValue.email.toLowerCase())) {
        return false;
      }

      if (formValue.phone && !customer.phone.toLowerCase().includes(formValue.phone.toLowerCase())) {
        return false;
      }

      if (formValue.types && customer.type !== formValue.types) {
        return false;
      }

      if (formValue.statuses) {
        const customerStatus = customer.active?.toString() || 'false';
        if (customerStatus !== formValue.statuses) {
          return false;
        }
      }

      return true;
    });
  }

  // Open the dialog for creating a new customer
  onCreateCustomer(): void {
    if (this.createCustomerTemplate) {
      const dialogRef = this.dialog.open(DialogComponent, {
        data: {
          title: 'Create Customer',
          contentTemplate: this.createCustomerTemplate,
          formGroup: this.customerForm,
          apiUrl: this.customersEndpoint
        },
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.fetchCustomers(); // Refresh the customer list after creating a new customer
        }
      });
    }
  }

  // Navigate to a specific customer details page
  onRowClick(row: any): void {
    this.router.navigate(['/customers', row.id]);
  }

  // Clear all filters
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
