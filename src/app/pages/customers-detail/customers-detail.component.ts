import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@modules/material.module';
import { PageHeaderComponent } from '@components/page-header/page-header.component';
import { EntityDetailsComponent } from '@components/entity-details/entity-details.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from '@services/customer.service';
import { Title } from '@angular/platform-browser';
import { EntityNavLink } from '@interfaces/EntityNavLink.interface';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicInputComponent } from '@components/dynamic-input/dynamic-input.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-customers-detail',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    PageHeaderComponent,
    EntityDetailsComponent,
    DynamicInputComponent,
    ReactiveFormsModule
  ],
  templateUrl: './customers-detail.component.html',
  styleUrls: ['./customers-detail.component.scss']
})
export class CustomersDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private customerService = inject(CustomerService);
  private title = inject(Title);

  customerForm!: FormGroup;
  customer: any;
  name!: string;
  isEditMode = false;
  activeTab = 'profile';

  navLinks: EntityNavLink[] = [
    { id: 'profile', label: 'Profile', icon: 'business' },
  ];

  typeOptions = [
    { value: 'COMPANY', label: 'Company' },
    { value: 'INDIVIDUAL', label: 'Individual' }
  ];

  statusOptions = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' }
  ];

  ngOnInit() {
    this.initializeForm();
    this.setupRouteListeners();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.customerForm = this.fb.group({
      name: ['', Validators.required],
      identifierNo: ['', Validators.required],
      type: ['', Validators.required],
      email: ['', [Validators.email]],
      phone: [''],
      address: [''],
      active: [false]
    });
  }

  private setupRouteListeners(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.loadCustomerData(params['id']);
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

  private loadCustomerData(id: number): void {
    this.customerService.getCustomerById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (customer) => this.handleCustomerData(customer),
        error: () => this.router.navigate(['/customers'])
      });
  }

  private handleCustomerData(customer: any): void {
    this.customer = customer;
    this.name = customer.name;
    this.title.setTitle(`${customer.name}'s Profile`);
    this.updateFormValues();
  }

  private updateFormValues(): void {
    if (this.customer) {
      this.customerForm.patchValue({
        name: this.customer.name,
        identifierNo: this.customer.identifierNo,
        type: this.customer.type,
        email: this.customer.email,
        phone: this.customer.phone,
        address: this.customer.address,
        active: this.customer.active
      });
      this.customerForm.disable();
    }
  }

  // Form control getters
  get nameFormControl(): FormControl { return this.customerForm.get('name') as FormControl; }
  get identifierNoFormControl(): FormControl { return this.customerForm.get('identifierNo') as FormControl; }
  get typeFormControl(): FormControl { return this.customerForm.get('type') as FormControl; }
  get emailFormControl(): FormControl { return this.customerForm.get('email') as FormControl; }
  get phoneFormControl(): FormControl { return this.customerForm.get('phone') as FormControl; }
  get addressFormControl(): FormControl { return this.customerForm.get('address') as FormControl; }
  get activeFormControl(): FormControl { return this.customerForm.get('active') as FormControl; }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    this.customerForm[this.isEditMode ? 'enable' : 'disable']();
  }

  onSubmit(): void {
    if (this.customerForm.valid && this.isEditMode) {
      const updatedCustomer = { id: this.customer.id, ...this.customerForm.value };
      
      this.customerService.updateCustomer(updatedCustomer).subscribe({
        next: (response) => this.handleUpdateSuccess(response),
        error: (error) => console.error('Error updating customer:', error)
      });
    }
  }

  private handleUpdateSuccess(response: any): void {
    this.customer = response;
    this.updateFormValues();
    this.name = response.name;
    this.isEditMode = false;
  }
}