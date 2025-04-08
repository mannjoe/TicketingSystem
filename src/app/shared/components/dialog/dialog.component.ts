import { CommonModule } from '@angular/common';
import { Component, inject, Inject, TemplateRef } from '@angular/core';
import { MaterialModule } from '@modules/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup } from '@angular/forms';
import { ApiService } from '@services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
})
export class DialogComponent {
  apiService = inject(ApiService);
  snackBar = inject(MatSnackBar);

  title: string;
  contentTemplate: TemplateRef<any> | null;
  formGroup: FormGroup;
  apiUrl: string;

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.title = data.title || 'Dialog';
    this.contentTemplate = data.contentTemplate || null;
    this.formGroup = data.formGroup || new FormGroup({});
    this.apiUrl = data.apiUrl || '';
    this.dialogRef.disableClose = true;
  }

  onCreate(): void {
    if (this.formGroup.valid) {
      const payload = this.formGroup.value;

      this.apiService.post(this.apiUrl, payload).subscribe({
        next: (response) => {
          this.resetForm();
          this.dialogRef.close(response);

          this.snackBar.open('Operation successful', 'Close', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['success-snackbar'],
          });
        },
        error: (error) => {
          console.error('API Error:', error);

          // Show error Snackbar
          this.snackBar.open('Operation failed', 'Close', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['error-snackbar'],
          });
        },
      });
    }
  }

  onClose(): void {
    const hasValue = Object.values(this.formGroup.value).some((value) => !!value);

    if (hasValue) {
      const confirmClose = confirm(
        'You have unsaved changes. Are you sure you want to close?'
      );
      if (confirmClose) {
        this.resetForm();
        this.dialogRef.close();
      }
    } else {
      this.resetForm();
      this.dialogRef.close();
    }
  }

  private resetForm(): void {
    this.formGroup.reset();
    this.formGroup.markAsPristine();
    this.formGroup.markAsUntouched();
  }
}
