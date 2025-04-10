import { CommonModule } from '@angular/common';
import { Component, inject, Inject, TemplateRef } from '@angular/core';
import { MaterialModule } from '@modules/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup } from '@angular/forms';
import { ApiService } from '@services/api.service';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
})
export class DialogComponent {
  apiService = inject(ApiService);

  title: string;
  contentTemplate: TemplateRef<any> | null;
  formGroup: FormGroup;
  apiUrl: string;
  method: 'POST' | 'PUT';  // Determines whether to use POST or PUT for the request
  buttonText: string;

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.title = data.title || 'Dialog';
    this.contentTemplate = data.contentTemplate || null;
    this.formGroup = data.formGroup || new FormGroup({});
    this.apiUrl = data.apiUrl || '';
    this.method = data.method || 'POST';  // Default to POST if no method provided
    this.buttonText = this.method === 'POST' ? 'Create' : 'Update';  // Adjust button text
    this.dialogRef.disableClose = true;
  }

  onSubmit(): void {
    if (this.formGroup.valid) {
      const payload = this.formGroup.value;

      if (this.method === 'POST') {
        // Perform POST (Create) request
        this.apiService.post(this.apiUrl, payload).subscribe({
          next: (response) => {
            this.resetForm();
            this.dialogRef.close(response);
          },
          error: (error) => {
            console.error('API Error:', error);
          },
        });
      } else if (this.method === 'PUT') {
        // Perform PUT (Update) request
        this.apiService.put(this.apiUrl, payload).subscribe({
          next: (response) => {
            this.resetForm();
            this.dialogRef.close(response);
          },
          error: (error) => {
            console.error('API Error:', error);
          },
        });
      }
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
