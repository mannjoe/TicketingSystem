import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainLayoutComponent } from '@layouts/main-layout/main-layout.component';
import { SidenavComponent } from '@layouts/sidenav/sidenav.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MainLayoutComponent, SidenavComponent, LoadingSpinnerComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'Catalyst';
}
