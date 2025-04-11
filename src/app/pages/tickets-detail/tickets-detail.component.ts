import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@modules/material.module';
import { PageHeaderComponent } from '@components/page-header/page-header.component';
import { EntityDetailsComponent } from '@components/entity-details/entity-details.component';
import { ActivatedRoute, Router } from '@angular/router';
import { EntityNavLink } from '@interfaces/EntityNavLink.interface';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicInputComponent } from '@components/dynamic-input/dynamic-input.component';
import { Subject, takeUntil } from 'rxjs';
import { getLastRouteSegment } from '@utils/url.util';
import { formatString } from '@utils/string.util';
import { TicketService } from '@services/ticket.service';
import { UserService } from '@services/user.service';
import { CustomerService } from '@services/customer.service';
import { AuthService } from '@services/auth.service';

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
  private ticketService = inject(TicketService);
  private userService = inject(UserService);
  private customerService = inject(CustomerService);
  private authService = inject(AuthService);

  ticketForm!: FormGroup;
  ticket: any;
  code: string = 'Create Ticket';
  isCreateMode: boolean = false;
  isEditMode: boolean = false;
  activeTab: string = 'details';
  statuses$ = this.ticketService.getAllStatuses();
  activeUsers$ = this.userService.getActiveUsers();
  customers$ = this.customerService.getAllCustomers();

  navLinks: EntityNavLink[] = [
    { id: 'details', label: 'Details', icon: 'info' },
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
    this.isCreateMode = getLastRouteSegment(this.router) === 'create';
    this.initializeForm();
    this.setupRouteListeners();
    console.log('Is dueDate control disabled?', this.dueDateFormControl.disabled);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 7);
    
    this.ticketForm = this.fb.group({
      status: ['BACKLOG', Validators.required],
      dueDate: [dueDate, Validators.required],
      assignee: ['', Validators.required],
      reporter: [this.authService.getCurrentUser()?.id, Validators.required],
      requestBy: ['', Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  private setupRouteListeners(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      //this.loadTicketData(params['id']);
    });

    this.route.queryParams.subscribe(queryParams => {
      this.activeTab = queryParams['tab'] || 'details';
      if (!queryParams['tab']) {
        this.updateQueryParams();
      }
    });
  }

  private updateQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: 'details' },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  formatStatus(status: string): string {
    return formatString(status);
  }

  // Form control getters
  get statusFormControl(): FormControl { return this.ticketForm.get('status') as FormControl; }
  get dueDateFormControl(): FormControl { return this.ticketForm.get('dueDate') as FormControl; }
  get assigneeFormControl(): FormControl { return this.ticketForm.get('assignee') as FormControl; }
  get reporterFormControl(): FormControl { return this.ticketForm.get('reporter') as FormControl; }
  get requestByFormControl(): FormControl { return this.ticketForm.get('requestBy') as FormControl; }
  get titleFormControl(): FormControl { return this.ticketForm.get('title') as FormControl; }
  get descriptionFormControl(): FormControl { return this.ticketForm.get('description') as FormControl; }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    this.ticketForm[this.isEditMode ? 'enable' : 'disable']();
  }

  onSubmit(): void {
    if (this.isCreateMode) {
      this.ticketService.createTicket(this.ticketForm.value).subscribe({
        next: (response: any) => this.handleUpdateSuccess(response),
        error: (error: any) => console.error('Error creating ticket', error)
      });
    } else if (this.isEditMode) {
      this.ticketService.updateTicket(this.ticket.id, this.ticketForm.value).subscribe({
        next: (response: any) => this.handleUpdateSuccess(response),
        error: (error: any) => console.error('Error updating ticket', error)
      });
    }
  }

  private handleUpdateSuccess(response: any): void {
    this.isEditMode = false;
    this.router.navigate(['/tickets']);
  }

  private loadTicketData(id: string | number): void {
    if (id === 'create') {
      return;
    }

    this.ticketService.getTicketById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (ticket: any) => this.handleTicketData(ticket),
        error: () => this.router.navigate(['/tickets'])
      });
  }

  private handleTicketData(ticket: any): void {
    this.ticket = ticket;
    this.code = `Ticket ${ticket.id}`;
    this.updateFormValues();
  }

  private updateFormValues(): void {
    if (this.ticket) {
      this.ticketForm.patchValue({
        status: this.ticket.status,
        dueDate: this.ticket.dueDate,
        assignee: this.ticket.assignee,
        reporter: this.ticket.reporter,
        requestBy: this.ticket.requestBy,
        title: this.ticket.title,
        description: this.ticket.description,
      });
      this.ticketForm.disable();
    }
  }
}
