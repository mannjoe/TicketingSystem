import { Component, inject } from '@angular/core';
import { MaterialModule } from '@modules/material.module';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [MaterialModule, RouterModule, CommonModule],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent {
}
