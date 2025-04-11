import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MaterialModule } from '@modules/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, of, BehaviorSubject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators'
import { AngularEditorModule } from '@kolkov/angular-editor';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-dynamic-input',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    AngularEditorModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './dynamic-input.component.html',
  styleUrl: './dynamic-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicInputComponent),
      multi: true,
    },
  ],
})
export class DynamicInputComponent implements ControlValueAccessor, OnInit {
  @Input() isEditable: boolean = true;
  @Input() label: string = '';
  @Input() type: 'text' | 'number' | 'dropdown' | 'date' | 'textarea' | 'password' | 'radio' | 'editor' = 'text';
  @Input() dateType: 'single' | 'start' | 'end' = 'single';
  @Input() options$: Observable<any[]> = of([]);
  @Input() isReadonly: boolean = false;
  @Input() optionDisplayFields: string[] = [];
  @Input() optionValueField: string = 'id';
  @Input() displayPipe?: (value: any) => string;
  @Input() control: FormControl = new FormControl();
  @Input() startDateControl?: FormControl; // For end date validation
  @Input() endDateControl?: FormControl;   // For start date validation
  @Input() radioOptions: { value: any; label: string }[] = [];

  filterText: string = '';
  private filterTextSource$ = new BehaviorSubject<string>('');
  filteredOptionsSource$: Observable<any[]> = of([]);

  currentValue: any = '';
  onChange: (value: any) => void = () => { };
  onTouched: () => void = () => { };
  isPasswordHidden = true;
  totalOptionsLength = 0;

  ngOnInit() {
    this.filteredOptionsSource$ = combineLatest([
      this.options$,
      this.filterTextSource$.pipe(debounceTime(200), distinctUntilChanged())
    ]).pipe(
      map(([options, filterText]) => {

        this.totalOptionsLength = options.length;
        
        const filteredOptions = options.filter(option => {
          if (typeof option !== 'object' || option === null) {
            return this.displayPipe
              ? this.displayPipe(option).toLowerCase().includes(filterText.toLowerCase())
              : option?.toString().toLowerCase().includes(filterText.toLowerCase());
          }

          if (this.optionDisplayFields?.length > 0) {
            return this.optionDisplayFields.some(field =>
              option[field]?.toString().toLowerCase().includes(filterText.toLowerCase())
            );
          }

          return this.displayPipe
            ? this.displayPipe(option).toLowerCase().includes(filterText.toLowerCase())
            : option?.toString().toLowerCase().includes(filterText.toLowerCase());
        });

        return filteredOptions;
      })
    );
  }

  onFilterChange(text: string): void {
    this.filterTextSource$.next(text);
  }

  writeValue(value: any): void {
    this.currentValue = value;
    if (this.control) {
      this.control.setValue(value, { emitEvent: false });
    }
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onValueChange(newValue: any): void {
    this.currentValue = newValue;
    this.onChange(this.currentValue);
    this.onTouched();
  }

  formatOption(option: any): string {
    // If displayPipe is provided, use it regardless of option type
    if (this.displayPipe) {
      return this.displayPipe(option);
    }

    // For primitive values (string, number, etc.)
    if (typeof option !== 'object' || option === null) {
      return option?.toString() || '';
    }

    // For objects with display fields
    if (this.optionDisplayFields?.length > 0) {
      return this.optionDisplayFields
        .map(field => option[field] || '')
        .join(' - ');
    }

    // Fallback for objects without display fields
    return option?.toString() || '';
  }

  getOptionValue(option: any): any {
    // For primitive values, use the value directly
    if (typeof option !== 'object' || option === null) {
      return option;
    }

    // For objects, use the specified value field or the whole object
    return this.optionValueField ? option[this.optionValueField] : option;
  }
}
