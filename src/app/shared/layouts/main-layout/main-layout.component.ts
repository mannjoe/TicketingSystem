import {
  Component,
  inject,
  OnInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@layouts/header/header.component';
import { SidenavComponent } from '@layouts/sidenav/sidenav.component';
import { AuthService } from '@services/auth.service';
import { Observable, fromEvent, Subject } from 'rxjs';
import { takeUntil, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidenavComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  authService: AuthService = inject(AuthService);
  isLoggedIn$: Observable<boolean> = this.authService.authState$;
  sidenavOpen: boolean = true;

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    fromEvent(window, 'resize')
      .pipe(
        startWith(null),
        takeUntil(this.destroy$),
        map(() => window.innerWidth)
      )
      .subscribe((width) => {
        this.sidenavOpen = width >= 768;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidenav() {
    this.sidenavOpen = !this.sidenavOpen;
  }
}
