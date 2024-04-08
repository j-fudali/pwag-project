import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { Item } from '../../../shared/interfaces/Item';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-items-table',
  standalone: true,
  imports: [
    CommonModule,
    MatDividerModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatSelectModule,
  ],
  template: `
    <div class="filters">
      <mat-form-field appearance="outline" [subscriptSizing]="'dynamic'">
        <mat-label>Search</mat-label>
        <input type="text" matInput (input)="search($event)" />
        <button mat-icon-button matSuffix>
          <mat-icon>search</mat-icon>
        </button>
      </mat-form-field>
      <mat-form-field appearance="outline" [subscriptSizing]="'dynamic'">
        <mat-label>Category</mat-label>
        <mat-select>
          <mat-option>1</mat-option>
          <mat-option>2</mat-option>
          <mat-option>3</mat-option>
        </mat-select>
      </mat-form-field>
    </div>
    <table mat-table [dataSource]="filteredItems()" class="mat-elevation-z8">
      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef>Name</th>
        <td mat-cell *matCellDef="let element">{{ element.name }}</td>
      </ng-container>
      <ng-container matColumnDef="model">
        <th mat-header-cell *matHeaderCellDef>Model</th>
        <td mat-cell *matCellDef="let element">{{ element.model }}</td>
      </ng-container>
      <ng-container matColumnDef="cost">
        <th mat-header-cell *matHeaderCellDef>Cost</th>
        <td mat-cell *matCellDef="let element">{{ element.cost }}</td>
      </ng-container>
      <ng-container matColumnDef="amount">
        <th mat-header-cell *matHeaderCellDef>Amount</th>
        <td mat-cell *matCellDef="let element">{{ element.amount }}</td>
      </ng-container>
      <ng-container matColumnDef="total">
        <th mat-header-cell *matHeaderCellDef>Total</th>
        <td mat-cell *matCellDef="let element">{{ element.total }}</td>
      </ng-container>
      <ng-container matColumnDef="source">
        <th mat-header-cell *matHeaderCellDef>Source</th>
        <td mat-cell *matCellDef="let element">{{ element.source }}</td>
      </ng-container>
      <ng-container matColumnDef="condition">
        <th mat-header-cell *matHeaderCellDef>Condition</th>
        <td mat-cell *matCellDef="let element">{{ element.condition }}</td>
      </ng-container>
      <ng-container matColumnDef="info">
        <th mat-header-cell *matHeaderCellDef>Info</th>
        <td mat-cell *matCellDef="let element">{{ element.info }}</td>
      </ng-container>
      <ng-container matColumnDef="modified">
        <th mat-header-cell *matHeaderCellDef>Modified</th>
        <td mat-cell *matCellDef="let element">{{ element.modified }}</td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns()"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns()"></tr>
    </table>
  `,
  styleUrl: './items-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsTableComponent {
  displayedColumns = input.required<string[]>();
  dataSource = input.required<Item[]>();
  query = signal('');
  filteredItems = computed(() =>
    this.dataSource().filter(({ name }) => name.startsWith(this.query()))
  );

  search(e: Event) {
    this.query.set((e.target as HTMLInputElement).value);
  }
}
