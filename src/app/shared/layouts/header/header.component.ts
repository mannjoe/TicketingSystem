import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '@environments/environment'
import { MaterialModule } from '@modules/material.module';
import { AuthService } from '@services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  authService: AuthService = inject(AuthService);
  router: Router = inject(Router);
  companyName = environment.companyName;
  @Output() sidenavToggle = new EventEmitter<void>();

  toggleSidenav() {
    this.sidenavToggle.emit();
  }

  onLogOutClicked() {
    this.authService.logout();
    this.router.navigate(['login']);
  }
}
