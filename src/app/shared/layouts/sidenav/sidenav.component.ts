import { Component, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { MaterialModule } from '@modules/material.module';
import { navItems } from '@layouts/_nav';
import { ScrollToTopComponent } from '@layouts/scroll-to-top/scroll-to-top.component';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterLink,
    RouterLinkActive,
    MaterialModule,
    ScrollToTopComponent,
  ],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
})
export class SidenavComponent {
  navItems = navItems;
  @Input() sidenavOpen: boolean = true;

  @ViewChild('drawer') drawer!: MatDrawer;

  toggleSidenav() {
    this.sidenavOpen = !this.sidenavOpen;
  }
}
