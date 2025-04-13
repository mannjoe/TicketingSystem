import { Component, OnInit, ViewChild, AfterViewInit, inject } from '@angular/core';
import { TicketService } from '@services/ticket.service';
import { ViewTableComponent } from '@components/view-table/view-table.component';
import { Router } from '@angular/router';

interface Ticket {
  code: string;
  status: string;
  dueDate: string;
  createdAtDate: string;
  title: string;
  requestBy: {
    name: string;
  };
  assignee: {
    fullName: string;
  };
  aging?: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ViewTableComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  router = inject(Router);
  ticketService = inject(TicketService);
  @ViewChild(ViewTableComponent) tableComponent!: ViewTableComponent;

  tickets: Ticket[] = [];

  // Aging metrics
  totalTickets = 0;
  lessThan7Days = 0;
  lessThan14Days = 0;
  fourteenOrMoreDays = 0;

  // Table configuration
  columnMappings = [
    { key: 'code', label: 'Ticket Code', visible: true },
    { key: 'title', label: 'Title', visible: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'requestBy.name', label: 'Requested By', visible: true },
    { key: 'assignee.fullName', label: 'Assignee', visible: true },
    { key: 'createdAtDate', label: 'Created Date', visible: true },
    { key: 'dueDate', label: 'Due Date', visible: true },
    { key: 'aging', label: 'Aging (Days)', visible: true }
  ];

  ngOnInit(): void {
    this.loadTickets();
  }

  ngAfterViewInit(): void {
    // Set initial sort after view initializes
    setTimeout(() => {
      if (this.tableComponent?.sort) {
        this.tableComponent.sort.active = 'aging';
        this.tableComponent.sort.direction = 'desc';
        this.tableComponent.dataSource.sort = this.tableComponent.sort;
      }
    });
  }

  loadTickets(): void {
    this.ticketService.getAllTickets().subscribe({
      next: (tickets: Ticket[]) => { // Explicitly type the tickets parameter
        const now = new Date();
        this.tickets = tickets.filter(ticket =>
          ticket.status !== 'DONE' && ticket.status !== 'CANCELLED')
          .map((ticket: Ticket) => { // Explicitly type the ticket parameter
            const createdAt = new Date(ticket.createdAtDate);
            const ageInDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
            return {
              ...ticket,
              aging: ageInDays
            };
          });
        this.calculateAgingMetrics();
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  calculateAgingMetrics(): void {
    this.totalTickets = this.tickets.length;
    this.lessThan7Days = this.tickets.filter(t => t.aging! < 7).length;
    this.lessThan14Days = this.tickets.filter(t => t.aging! >= 7 && t.aging! < 14).length;
    this.fourteenOrMoreDays = this.tickets.filter(t => t.aging! >= 14).length;
  }

  getPercentage(count: number): number {
    return this.totalTickets > 0 ? Math.round((count / this.totalTickets) * 100) : 0;
  }

  getAgingStyle(aging: number): any {
    if (aging < 7) return { color: '#4caf50', fontWeight: 'bold' }; // Green
    if (aging < 14) return { color: '#ff9800', fontWeight: 'bold' }; // Amber
    return { color: '#f44336', fontWeight: 'bold' }; // Red
  }

  onRowClick(row: any): void {
    this.router.navigate(['/tickets', row.code]);
  }
}