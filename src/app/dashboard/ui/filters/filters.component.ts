import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { Source } from '../../../shared/interfaces/Source';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  template: `<div
    class="filters"
    [ngClass]="isGtSm() ? 'filters-gt-sm' : 'filters-lt-md'"
  >
    <mat-form-field
      class="name"
      appearance="outline"
      [subscriptSizing]="'dynamic'"
    >
      <mat-label>Search</mat-label>
      <input
        [formControl]="name"
        type="text"
        matInput
        (input)="search($event)"
      />
      <button mat-icon-button matSuffix>
        <mat-icon>search</mat-icon>
      </button>
    </mat-form-field>
    <mat-form-field
      class="source"
      appearance="outline"
      [subscriptSizing]="'dynamic'"
    >
      <mat-label>Source</mat-label>
      <mat-select
        [formControl]="source"
        (selectionChange)="onSourceSelect($event)"
      >
        @for (source of sources(); track $index) {
        <mat-option [value]="source.id">{{ source.name }}</mat-option>
        }
      </mat-select>
    </mat-form-field>
    <button mat-icon-button (click)="reset()">
      <mat-icon>cancel</mat-icon>
    </button>
  </div>`,
  styleUrl: './filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltersComponent {
  name = new FormControl('');
  source = new FormControl('');
  isGtSm = input.required<boolean>();
  sources = input.required<Source[] | null>();
  onSourceChanged = output<string>();
  onNameChanged = output<string>();
  search(e: Event) {
    this.onNameChanged.emit((e.target as HTMLInputElement).value);
  }
  onSourceSelect(e: MatSelectChange) {
    this.onSourceChanged.emit(e.value as string);
  }
  reset() {
    this.name.setValue('');
    this.source.setValue('');
    this.onNameChanged.emit('');
    this.onSourceChanged.emit('');
  }
}
