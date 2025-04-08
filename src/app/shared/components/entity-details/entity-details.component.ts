import {
  Component,
  Input,
  inject,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@modules/material.module';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { EntityNavLink } from '@interfaces/EntityNavLink.interface';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-entity-details',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterModule],
  templateUrl: './entity-details.component.html',
  styleUrl: './entity-details.component.scss',
})
export class EntityDetailsComponent implements OnInit, OnDestroy {
  @Input() title: string = '';
  @Input() navLinks: EntityNavLink[] = [];
  @Input() activeLink: string = '';
  @Output() activeLinkChange = new EventEmitter<string>();

  router: Router = inject(Router);
  route: ActivatedRoute = inject(ActivatedRoute);

  isNavCollapsed: boolean = false;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (
        params['tab'] &&
        this.navLinks.some((link) => link.id === params['tab'])
      ) {
        this.activeLink = params['tab'];
        this.activeLinkChange.emit(this.activeLink);
      }
    });

    fromEvent(window, 'resize')
      .pipe(
        startWith(null),
        takeUntil(this.destroy$),
        map(() => window.innerWidth)
      )
      .subscribe((width) => {
        this.isNavCollapsed = width < 1080;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onNavClick(linkId: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: linkId },
      queryParamsHandling: 'merge',
    });
    this.activeLink = linkId;
  }

  toggleNav() {
    this.isNavCollapsed = !this.isNavCollapsed;
  }
}
