import {
  Component,
  Input,
  ViewChild,
  AfterViewInit,
  Output,
  EventEmitter,
  OnInit,
  inject,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@modules/material.module';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ApiService } from '@services/api.service';
import { formatString } from '@utils/string.util';

interface ColumnMapping {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  selector: 'app-view-table',
  standalone: true,
  imports: [CommonModule, MaterialModule, MatTableModule, MatSortModule, MatPaginatorModule],
  templateUrl: './view-table.component.html',
  styleUrls: ['./view-table.component.scss'],
})
export class ViewTableComponent implements OnInit, AfterViewInit, OnChanges {
  apiService: ApiService = inject(ApiService);

  @Input() apiUrl: string = '';
  @Input() columnMappings: ColumnMapping[] = [];
  @Input() showTopButtons: boolean = true;
  @Input() data: any[] = [];
  @Output() rowClick = new EventEmitter<any>();

  private _data: any[] = [];
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource!: MatTableDataSource<any>;

  displayedColumns: string[] = [];
  allColumnsSelected = false;
  visibleColumnKeys: string[] = [];

  ngOnInit(): void {
    this.visibleColumnKeys = this.columnMappings
      .filter(col => col.visible)
      .map(col => col.key);
    this.updateDisplayedColumns();
    this.checkAllColumnsSelected();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this._data = changes['data'].currentValue;
      this.initializeDataSource();
    }
  }

  ngAfterViewInit() {
    this.initializeDataSource();
  }

  private initializeDataSource() {
    this.dataSource = new MatTableDataSource(this._data);
    if (this.sort) {
      this.dataSource.sort = this.sort;
      this.dataSource.sortingDataAccessor = (item, property) => {
        if (property.includes('.')) {
          const [parent, child] = property.split('.');
          return item[parent]?.[child] ?? '';
        }
        return item[property] ?? '';
      };
    }
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  private updateDisplayedColumns(): void {
    this.displayedColumns = this.visibleColumnKeys;
  }

  private checkAllColumnsSelected(): void {
    this.allColumnsSelected = this.columnMappings.every(col => col.visible);
  }

  toggleColumn(column: ColumnMapping): void {
    column.visible = !column.visible;

    if (column.visible) {
      if (!this.visibleColumnKeys.includes(column.key)) {
        this.visibleColumnKeys.push(column.key);
      }
    } else {
      this.visibleColumnKeys = this.visibleColumnKeys.filter(key => key !== column.key);
    }

    this.checkAllColumnsSelected();
    this.updateDisplayedColumns();
  }

  toggleAllColumns(): void {
    this.allColumnsSelected = !this.allColumnsSelected;

    if (this.allColumnsSelected) {
      const currentlyVisible = new Set(this.visibleColumnKeys);
      const newVisible = this.columnMappings
        .map(col => col.key)
        .filter(key => !currentlyVisible.has(key));
      this.visibleColumnKeys = [...this.visibleColumnKeys, ...newVisible];
    } else {
      this.visibleColumnKeys = [];
    }

    this.columnMappings.forEach(col => {
      col.visible = this.allColumnsSelected;
    });

    this.updateDisplayedColumns();
  }

  onRowClick(row: any): void {
    this.rowClick.emit(row);
  }

  onExportTable(): void {
    const csvData = this.convertToCSV(this.dataSource.data);
    this.downloadCSV(csvData);
  }

  convertToCSV(data: any[]): string {
    const visibleColumns = this.columnMappings.filter(col => 
      this.visibleColumnKeys.includes(col.key)
    );
    const header = visibleColumns.map(col => col.label).join('\t');
    const rows = data.map(row =>
      visibleColumns.map(col => this.getNestedValue(row, col.key)).join('\t')
    );
    return [header, ...rows].join('\n');
  }

  downloadCSV(csvData: string): void {
    const excelFormattedData = 'sep=\t\n' + csvData;
    const blob = new Blob([excelFormattedData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'table-data.csv';
    link.click();
  }

  getNestedValue(obj: any, path: string): any {
    // First get the raw value using the original nested property access
    const rawValue = path.split('.').reduce((o, p) => (o ? o[p] : ''), obj);
    
    // Return empty string for falsy values (null, undefined, empty string, etc.)
    if (!rawValue) return '';
    
    // Format the value only if it's a string
    return typeof rawValue === 'string' 
      ? formatString(rawValue) 
      : rawValue;
  }
}
