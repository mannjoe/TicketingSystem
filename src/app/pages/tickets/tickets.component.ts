import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { MaterialModule } from '@modules/material.module';
import { PageHeaderComponent } from '@components/page-header/page-header.component';
import { DynamicInputComponent } from '@components/dynamic-input/dynamic-input.component';
import { SearchContainerComponent } from '@components/search-container/search-container.component';
import { ViewTableComponent } from '@components/view-table/view-table.component';

import { ApiService } from '@services/api.service';
import { TicketService } from '@services/ticket.service';

import { ViewTableColumn } from '@interfaces/ViewTable.interface';
import { TICKETS_COLUMN_MAPPINGS } from '@shared/constants';
import { joinUrl } from '@utils/url.util';
import { environment } from '@environments/environment';

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
  // Injected services
  router = inject(Router);
  route = inject(ActivatedRoute);
  fb = inject(FormBuilder);
  dialog = inject(MatDialog);
  apiService = inject(ApiService);
  ticketService = inject(TicketService);

  // Observables and constants
  availableRoles$: Observable<string[]> = this.apiService.get(joinUrl(environment.apiUrl, 'users/roles'));
  usersEndpoint = joinUrl(environment.apiUrl, 'users');
  tableColumns: ViewTableColumn[] = TICKETS_COLUMN_MAPPINGS;

  // Data
  tickets: any[] = [];
  displayedTickets: any[] = [];

  // Form
  filterForm!: FormGroup;

  // Status filter options
  statusOptions = [
    { value: 'BACKLOG', label: 'Backlog' },
    { value: 'TO_DO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'DONE', label: 'Done' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.fetchTickets();
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  private initializeForm(): void {
    this.filterForm = this.fb.group({
      code: [''],
      title: [''],
      assignee: [''],
      reporter: [''],
      statuses: [['BACKLOG', 'TO_DO', 'IN_PROGRESS']],
      requestBy: [''],
      createdFrom: [''],
      createdTo: ['']
    });
  }

  private fetchTickets(): void {
    this.ticketService.getAllTickets().subscribe({
      next: (response) => {
        this.tickets = response;
        this.displayedTickets = [...response];
        this.applyFilters();
      },
      error: (error) => {
        console.error('Failed to fetch users:', error);
      }
    });
  }

  private applyFilters(): void {
    const { code, title, assignee, reporter, statuses, requestBy, createdFrom, createdTo } = this.filterForm.value;

    this.displayedTickets = this.tickets.filter(ticket => {
      const createdDate = new Date(ticket.createdAtDate);

      return (
        (!code || ticket.code.toLowerCase().includes(code.toLowerCase())) &&
        (!title || ticket.title.toLowerCase().includes(title.toLowerCase())) &&
        (!assignee || ticket.assignee?.username.toLowerCase().includes(assignee.toLowerCase())) &&
        (!reporter || ticket.reporter?.username.toLowerCase().includes(reporter.toLowerCase())) &&
        (statuses.length === 0 || statuses.includes(ticket.status)) && // Updated status filter
        (!requestBy || ticket.requestBy?.name.toLowerCase().includes(requestBy.toLowerCase())) &&
        (!createdFrom || createdDate >= new Date(createdFrom)) &&
        (!createdTo || createdDate <= new Date(createdTo))
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
      code: '',
      title: '',
      assignee: '',
      reporter: '',
      statuses: ['BACKLOG', 'TO_DO', 'IN_PROGRESS'],
      requestBy: '',
      createdFrom: '',
      createdTo: ''
    });
  }

  getStatusLabel(value: string): string {
    const status = this.statusOptions.find(s => s.value === value);
    return status ? status.label : value;
  }

  removeStatus(event: MouseEvent, status: string): void {
    event.stopPropagation();
    const currentStatuses = this.filterForm.get('statuses')?.value || [];
    this.filterForm.patchValue({
      statuses: currentStatuses.filter((s: string) => s !== status)
    });
  }
}
