import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MaterialModule } from '@modules/material.module';
import { PageHeaderComponent } from '@components/page-header/page-header.component';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '@services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { DynamicInputComponent } from '@components/dynamic-input/dynamic-input.component';
import { Observable } from 'rxjs';
import { joinUrl } from '@utils/url.util';
import { environment } from '@environments/environment';
import { passwordMatchValidator } from '@utils/validators.util';
import { SearchContainerComponent } from '@components/search-container/search-container.component';
import { ViewTableComponent } from '@components/view-table/view-table.component';
import { ViewTableColumn } from '@interfaces/ViewTable.interface';
import { TICKETS_COLUMN_MAPPINGS, USERS_COLUMN_MAPPINGS } from '@shared/constants';
import { TicketService } from '@services/ticket.service';

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
  ticketService = inject(TicketService);

  // Observable data
  availableRoles$: Observable<string[]> = this.apiService.get(joinUrl(environment.apiUrl, 'users/roles'));
  usersEndpoint: string = joinUrl(environment.apiUrl, 'users');
  tableColumns: ViewTableColumn[] = TICKETS_COLUMN_MAPPINGS;

  // Data
  tickets: any[] = [];
  displayedTickets: any[] = [];

  // Form
  filterForm!: FormGroup;

  // Filter options
  statusOptions = [
    { value: '', label: 'All' },
    { value: 'BACKLOG', label: 'Backlog' },
    { value: 'TO_DO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'DONE', label: 'Done' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.fetchTickets();

    // Subscribe to form value changes
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  private initializeForm(): void {
    this.filterForm = this.fb.group({
      code: [''],
      title: [''],
      assignee: [''],
      reporter: [''],
      status: [''],
      customer: [''],
      createdFrom: [''],
      createdTo: [''],
    });
  }

  private fetchTickets(): void {
    this.ticketService.getAllTickets().subscribe({
      next: (response) => {
        this.tickets = response;
        console.log(this.tickets);
        this.displayedTickets = [...this.tickets];
        this.applyFilters();
      },
      error: (error) => {
        console.error('Failed to fetch users:', error);
      }
    });
  }

  private applyFilters(): void {
    const formValue = this.filterForm.value;
    this.displayedTickets = this.tickets.filter(ticket => {
      return (
        (!formValue.username || ticket.username.toLowerCase().includes(formValue.username.toLowerCase())) &&
        (!formValue.fullName || ticket.fullName.toLowerCase().includes(formValue.fullName.toLowerCase())) &&
        (!formValue.email || ticket.email?.toLowerCase().includes(formValue.email.toLowerCase())) &&
        (!formValue.roles || ticket.role === formValue.roles) &&
        (!formValue.statuses || ticket.active?.toString() === formValue.statuses)
      );
    });
  }

  onAddTicket(): void {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  onRowClick(row: any): void {
    this.router.navigate(['/tickets', row.code]);
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
