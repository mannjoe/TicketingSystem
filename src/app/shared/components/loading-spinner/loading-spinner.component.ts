import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MaterialModule } from '@modules/material.module';
import { LoadingService } from '@services/loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.scss'
})
export class LoadingSpinnerComponent {
  loadingService: LoadingService = inject(LoadingService);
}
