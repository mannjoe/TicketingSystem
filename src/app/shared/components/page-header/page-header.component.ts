import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from '@modules/material.module';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterModule],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss'
})
export class PageHeaderComponent implements OnInit {
  @Input() fragments: { id: string; value: string }[] = [];
  @Input() showBackButton: boolean = false;
  @Input() showTitle: boolean = false;
  pageTitle: string | undefined = '';
  route: ActivatedRoute = inject(ActivatedRoute);
  router: Router = inject(Router);
  activeFragment: string | null = null;

  ngOnInit(): void {
    this.route.title.subscribe(title => {
      this.pageTitle = title;
    });

    this.route.fragment.subscribe((fragment: string | null) => {
      this.activeFragment = fragment;
      if (fragment) this.jumpToSection(fragment);
    });
  }

  onBackClick() {
    const urlWithoutParams = this.router.url.split('?')[0];
    const parentUrl = urlWithoutParams.substring(0, urlWithoutParams.lastIndexOf('/'));
    
    this.route.queryParams.pipe(take(1)).subscribe(params => {
      if (params['tab']) {
        this.router.navigate([parentUrl], {
          queryParams: {},
          replaceUrl: true
        });
      } else {
        this.router.navigate([parentUrl]);
      }
    });
  }

  isFragmentActive(fragmentId: string): boolean {
    return this.activeFragment === fragmentId;
  }

  jumpToSection(section: string | null): void {
    if (section) document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
  }
}
