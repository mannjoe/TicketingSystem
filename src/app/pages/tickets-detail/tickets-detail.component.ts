import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@modules/material.module';
import { PageHeaderComponent } from '@components/page-header/page-header.component';
import { EntityDetailsComponent } from '@components/entity-details/entity-details.component';
import { DynamicInputComponent } from '@components/dynamic-input/dynamic-input.component';
import { ReactiveFormsModule, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Observable, Subject, BehaviorSubject, combineLatest, forkJoin, of } from 'rxjs';
import { takeUntil, switchMap, map, catchError, tap } from 'rxjs/operators';

import { EntityNavLink } from '@interfaces/EntityNavLink.interface';
import { getLastRouteSegment } from '@utils/url.util';
import { formatString } from '@utils/string.util';
import { TicketService } from '@services/ticket.service';
import { UserService } from '@services/user.service';
import { CustomerService } from '@services/customer.service';
import { AuthService } from '@services/auth.service';
import { User } from '@interfaces/User.interface';
import { Customer } from '@interfaces/Customer.interface';
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
  private title = inject(Title);

  // Form
  ticketForm!: FormGroup;
  statuses$ = this.ticketService.getAllStatuses();
  
  // State
  ticket: any;
  code = 'Create Ticket';
  isCreateMode = false;
  isEditMode = false;
  activeTab = 'details';
  
  // Navigation
  navLinks: EntityNavLink[] = [{ id: 'details', label: 'Details', icon: 'info' }];

  // Dropdown options
  assigneeOptions = signal<any[]>([]);
  reporterOptions = signal<any[]>([]);
  requestByOptions = signal<any[]>([]);
  assigneeOptions$ = new BehaviorSubject<any[]>([]);
  reporterOptions$ = new BehaviorSubject<any[]>([]);
  requestByOptions$ = new BehaviorSubject<any[]>([]);

  ngOnInit() {
    this.isCreateMode = getLastRouteSegment(this.router) === 'create';
    this.isEditMode = this.isCreateMode;
    
    this.initializeForm();
    this.loadDropdownOptions();
    if (!this.isCreateMode) {
      this.setupTicketListener();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    this.ticketForm = this.fb.group({
      status: ['BACKLOG', Validators.required],
      dueDate: [dueDate, Validators.required],
      assignee: ['', Validators.required],
      reporter: [this.authService.getCurrentUser()?.id, Validators.required],
      requestBy: ['', Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
    });

    if (!this.isCreateMode) this.ticketForm.disable();
  }

  private loadDropdownOptions(): void {
    if (this.isCreateMode) {
      this.userService.getActiveUsers().subscribe(users => {
        this.updateOptions(users, users);
      });
      this.customerService.getActiveCustomers().subscribe(customers => {
        this.requestByOptions.set(customers);
        this.requestByOptions$.next(customers);
      });
    }
  }

  private setupTicketListener(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(({ code }) => {
      this.ticketService.getTicketByCode(code).subscribe({
        next: ticket => this.handleTicketData(ticket),
        error: () => this.router.navigate(['/tickets'])
      });
    });
  }

  private handleTicketData(ticket: any): void {
    this.ticket = ticket;
    this.code = ticket.code;
    this.title.setTitle(ticket.code);
    
    this.ticketService.getDropdownOptions(this.code).subscribe(res => {
      this.updateOptions(res.assigneeOptions, res.reporterOptions);
      this.requestByOptions.set(res.requestByOptions);
      this.requestByOptions$.next(res.requestByOptions);
    });
    
    this.ticketForm.patchValue({
      status: ticket.status,
      dueDate: ticket.dueDate,
      assignee: ticket.assignee?.id,
      reporter: ticket.reporter?.id,
      requestBy: ticket.requestBy?.id,
      title: ticket.title,
      description: ticket.description,
    });
  }

  private updateOptions(assignees: any[], reporters: any[]): void {
    this.assigneeOptions.set(assignees);
    this.reporterOptions.set(reporters);
    this.assigneeOptions$.next(assignees);
    this.reporterOptions$.next(reporters);
  }

  toggleEditMode(): void {
    if (this.isCreateMode) return;
    this.isEditMode = !this.isEditMode;
    this.ticketForm[this.isEditMode ? 'enable' : 'disable']();
    if (!this.isEditMode) this.ticketForm.patchValue(this.ticket);
  }

  onSubmit(): void {
    if (this.ticketForm.invalid) return;
    
    const serviceCall = this.isCreateMode 
      ? this.ticketService.createTicket(this.ticketForm.value)
      : this.ticketService.updateTicket(this.ticket.code, { ...this.ticketForm.value, code: this.ticket.code });

    serviceCall.subscribe({
      next: (res) => this.handleSuccess(res),
      error: (err) => console.error(`Error ${this.isCreateMode ? 'creating' : 'updating'} ticket`, err)
    });
  }

  private handleSuccess(response: any): void {
    if (this.isCreateMode) {
      this.router.navigate(['/tickets', response.code]);
    } else {
      this.isEditMode = false;
      this.ticketForm.disable();
      this.ticketService.getTicketByCode(this.ticket.code).subscribe({
        next: ticket => this.handleTicketData(ticket),
        error: () => this.router.navigate(['/tickets'])
      });
    }
  }

  // Helper methods
  formatStatus = (status: string): string => formatString(status);

  // Form control getters
  get statusFormControl(): FormControl { return this.ticketForm.get('status') as FormControl; }
  get dueDateFormControl(): FormControl { return this.ticketForm.get('dueDate') as FormControl; }
  get assigneeFormControl(): FormControl { return this.ticketForm.get('assignee') as FormControl; }
  get reporterFormControl(): FormControl { return this.ticketForm.get('reporter') as FormControl; }
  get requestByFormControl(): FormControl { return this.ticketForm.get('requestBy') as FormControl; }
  get titleFormControl(): FormControl { return this.ticketForm.get('title') as FormControl; }
  get descriptionFormControl(): FormControl { return this.ticketForm.get('description') as FormControl; }
}