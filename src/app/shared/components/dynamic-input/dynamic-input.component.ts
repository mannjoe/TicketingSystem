import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MaterialModule } from '@modules/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, of, BehaviorSubject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

@Component({
  selector: 'app-dynamic-input',
  standalone: true,
  imports: [
    CommonModule, 
    MaterialModule, 
    FormsModule, 
    ReactiveFormsModule
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
  @Input() type: 'text' | 'number' | 'dropdown' | 'date' | 'textarea' | 'password' | 'radio' = 'text';
  @Input() options$: Observable<any[]> = of([]);
  @Input() isReadonly: boolean = false;
  @Input() optionDisplayFields: string[] = [];
  @Input() control: FormControl = new FormControl();
  @Input() radioOptions: { value: any; label: string }[] = [];

  filterText: string = '';
  private filterTextSource$ = new BehaviorSubject<string>('');
  filteredOptionsSource$: Observable<any[]> = of([]);

  currentValue: any = '';
  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};
  isPasswordHidden = true;

  ngOnInit() {
    this.filteredOptionsSource$ = combineLatest([
      this.options$,
      this.filterTextSource$.pipe(debounceTime(200), distinctUntilChanged()),
    ]).pipe(
      map(([options, filterText]) => {
        return options.filter((option) => {
          if (this.optionDisplayFields && this.optionDisplayFields.length > 0) {
            return this.optionDisplayFields.some((field) =>
              option[field]
                ?.toString()
                .toLowerCase()
                .includes(filterText.toLowerCase())
            );
          } else {
            return option
              .toString()
              .toLowerCase()
              .includes(filterText.toLowerCase());
          }
        });
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
    return this.optionDisplayFields.map((field) => option[field] || '').join(' - ');
  }
}
