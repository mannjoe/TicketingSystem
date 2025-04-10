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
  selector: 'app-tickets-detail',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    PageHeaderComponent,
    EntityDetailsComponent,
    DynamicInputComponent,
    ReactiveFormsModule
  ],
  templateUrl: './tickets-detail.component.html',
  styleUrls: ['./tickets-detail.component.scss']
})
export class TicketsDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private customerService = inject(CustomerService);
  private title = inject(Title);

  ticketForm!: FormGroup;
  ticket: any;
  code: string = 'Create Ticket';
  isEditMode = false;
  activeTab = 'profile';

  navLinks: EntityNavLink[] = [
    { id: 'description', label: 'Description', icon: 'description' },
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
    this.ticketForm = this.fb.group({
      status: ['', Validators.required],
      dueDate: ['', Validators.required],
      assignee: ['', Validators.required],
      reporter: ['', Validators.required],
      requestBy: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  private setupRouteListeners(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.loadTicketData(params['id']);
    });

    this.route.queryParams.subscribe(queryParams => {
      this.activeTab = queryParams['tab'] || 'description';
      if (!queryParams['tab']) {
        this.updateQueryParams();
      }
    });
  }

  private updateQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: 'description' },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  private loadTicketData(id: number): void {
    // this.customerService.getCustomerById(id)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (customer) => this.handleCustomerData(customer),
    //     error: () => this.router.navigate(['/customers'])
    //   });
  }

  private handleCustomerData(customer: any): void {
    // this.ticket = ticket;
    // this.name = customer.name;
    // this.title.setTitle(`${customer.name}'s Profile`);
    // this.updateFormValues();
  }

  private updateFormValues(): void {
    if (this.ticket) {
      this.ticketForm.patchValue({
        status: this.ticket.name,
        dueDate: this.ticket.identifierNo,
        assignee: this.ticket.type,
        reporter: this.ticket.email,
        requestBy: this.ticket.phone,
        description: this.ticket.address,
      });
      this.ticketForm.disable();
    }
  }

  // Form control getters
  get statusFormControl(): FormControl { return this.ticketForm.get('status') as FormControl; }
  get dueDateFormControl(): FormControl { return this.ticketForm.get('dueDate') as FormControl; }
  get assigneeFormControl(): FormControl { return this.ticketForm.get('assignee') as FormControl; }
  get reporterFormControl(): FormControl { return this.ticketForm.get('reporter') as FormControl; }
  get requestByFormControl(): FormControl { return this.ticketForm.get('requestBy') as FormControl; }
  get descriptionFormControl(): FormControl { return this.ticketForm.get('description') as FormControl; }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    this.ticketForm[this.isEditMode ? 'enable' : 'disable']();
  }

  onSubmit(): void {
    // if (this.ticketForm.valid && this.isEditMode) {
    //   const updatedCustomer = { id: this.customer.id, ...this.customerForm.value };
      
    //   this.customerService.updateCustomer(updatedCustomer).subscribe({
    //     next: (response) => this.handleUpdateSuccess(response),
    //     error: (error) => console.error('Error updating customer:', error)
    //   });
    // }
  }

  private handleUpdateSuccess(response: any): void {
    // this.customer = response;
    // this.updateFormValues();
    // this.name = response.name;
    // this.isEditMode = false;
  }
}