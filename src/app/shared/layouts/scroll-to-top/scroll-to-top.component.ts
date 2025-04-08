import { Component, AfterViewInit, OnDestroy, Input, NgZone, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MaterialModule } from '@modules/material.module';

@Component({
  selector: 'app-scroll-to-top',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './scroll-to-top.component.html',
  styleUrls: ['./scroll-to-top.component.scss'],
})
export class ScrollToTopComponent implements AfterViewInit, OnDestroy {
  @Input() containerSelector?: string;
  showScrollToTop = false;
  private container: HTMLElement | null = null;
  private ngZone: NgZone = inject(NgZone);
  private router: Router = inject(Router);

  ngAfterViewInit(): void {
    if (this.containerSelector) {
      this.container = document.querySelector(this.containerSelector);
    }

    this.ngZone.runOutsideAngular(() => {
      if (this.container) {
        this.container.addEventListener('scroll', this.onScroll.bind(this));
      } else {
        window.addEventListener('scroll', this.onScroll.bind(this));
      }
    });

    this.onScroll();
  }

  ngOnDestroy(): void {
    if (this.container) {
      this.container.removeEventListener('scroll', this.onScroll.bind(this));
    } else {
      window.removeEventListener('scroll', this.onScroll.bind(this));
    }
  }

  private onScroll(): void {
    this.ngZone.run(() => {
      const isAtTop = this.container ? this.container.scrollTop === 0 : window.scrollY === 0;
      this.showScrollToTop = this.container ? this.container.scrollTop > 300 : window.scrollY > 300;
    });
  }

  scrollToTop(): void {
    if (this.container) {
      this.container.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}