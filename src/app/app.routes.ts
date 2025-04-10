import { Routes } from '@angular/router';
import { LoginComponent } from '@pages/login/login.component';
import { DashboardComponent } from '@pages/dashboard/dashboard.component';
import { UsersComponent } from '@pages/users/users.component';
import { UsersDetailComponent } from '@pages/users-detail/users-detail.component';
import { CustomersComponent } from '@pages/customers/customers.component';
import { CustomersDetailComponent } from '@pages/customers-detail/customers-detail.component';
import { TicketsComponent } from '@pages/tickets/tickets.component';
import { TicketsDetailComponent } from '@pages/tickets-detail/tickets-detail.component';
import { authGuard } from '@guards/auth.guard';
import { ResetPasswordComponent } from '@pages/reset-password/reset-password.component';
import { NotFoundComponent } from '@pages/not-found/not-found.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'Login'
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    title: 'Reset Password'
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        title: 'Dashboard'
      },
      {
        path: 'users',
        children: [
          {
            path: '',
            component: UsersComponent,
            title: 'Users'
          },
          {
            path: ':username',
            component: UsersDetailComponent,
          }
        ]
      },
      {
        path: 'customers',
        children: [
          {
            path: '',
            component: CustomersComponent,
            title: 'Customers'
          },
          {
            path: ':id',
            component: CustomersDetailComponent,
            title: 'Customer Details'
          }
        ]
      },
      {
        path: 'tickets',
        children: [
          {
            path: '',
            component: TicketsComponent,
            title: 'Tickets'
          },
          {
            path: 'create',
            component: TicketsDetailComponent,
            title: 'Create Ticket'
          }
        ]
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      }
    ]
  },
  {
    path: '**',
    component: NotFoundComponent,
    title: 'Page Not Found'
  }
];