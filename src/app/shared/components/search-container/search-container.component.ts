import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@modules/material.module';

@Component({
  selector: 'app-search-container',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './search-container.component.html',
  styleUrl: './search-container.component.scss',
})
export class SearchContainerComponent implements OnInit {
  @Input() searchForm: boolean = false;
  @Output() event = new EventEmitter<void>();
  @Input() sectionHeader: string | undefined;
  @Input() subSectionHeader!: string | undefined;
  @Input() subSectionLinkText!: string | undefined;

  ngOnInit(): void {
    this.subSectionHeader = this.searchForm ? 'Search Fields' : this.subSectionHeader;
    this.subSectionLinkText = this.searchForm ? 'Clear All' : this.subSectionLinkText;
  }

  onLinkClick(): void {
    this.event.emit();
  }
}
