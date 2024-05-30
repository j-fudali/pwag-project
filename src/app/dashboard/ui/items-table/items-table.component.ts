import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  input,
  output,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { Item } from '../../../shared/interfaces/Item';
import { MatSelectModule } from '@angular/material/select';
import { Source } from '../../../shared/interfaces/Source';
import { docData } from '@angular/fire/firestore';
import { map } from 'rxjs';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

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
    MatIconModule,
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
  template: `
    <table
      mat-table
      multiTemplateDataRows
      [dataSource]="mappedItems()"
      class="mat-elevation-z8"
    >
      @for (column of displayedColumns(); track column) {
      <ng-container matColumnDef="{{ column }}">
        <th mat-header-cell *matHeaderCellDef>{{ column }}</th>
        <td mat-cell *matCellDef="let element">
          {{ column == 'source' ? element[column].name : element[column] }}
        </td>
      </ng-container>
      }

      <ng-container matColumnDef="expandedDetail">
        <td
          mat-cell
          *matCellDef="let element"
          [attr.colspan]="displayedColumns().length"
        >
          <div
            class="example-element-detail"
            [@detailExpand]="
              element == expandedElement ? 'expanded' : 'collapsed'
            "
          >
            <div class="element-info">
              @for(column of displayedColumnsExpanded(); track column){
              <div>
                <h4>{{ column }}</h4>
                <span>{{
                  column == 'source' ? element[column].name : element[column]
                }}</span>
              </div>
              }
            </div>
          </div>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns()"></tr>
      <tr
        mat-row
        *matRowDef="let element; columns: displayedColumns()"
        class="example-element-row"
        [class.example-expanded-row]="expandedElement === element"
        (click)="expandedElement = expandedElement === element ? null : element"
      ></tr>
      <tr
        mat-row
        *matRowDef="let row; columns: ['expandedDetail']"
        class="example-detail-row"
      ></tr>
    </table>
    <button
      class="add-item"
      color="primary"
      mat-raised-button
      (click)="addItem()"
    >
      Add item
    </button>
  `,
  styleUrl: './items-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsTableComponent {
  columns = [
    'name',
    'model',
    'cost',
    'amount',
    'total',
    'source',
    'condition',
    'modified',
    'modifiedBy',
    'info',
  ];
  displayedColumns = computed(() =>
    this.isGtSm() ? this.columns.slice(0, -3) : this.columns.slice(0, -6)
  );
  displayedColumnsExpanded = computed(() =>
    this.isGtSm() ? this.columns.slice(-3) : this.columns.slice(-6)
  );
  isGtSm = input.required<boolean>();
  dataSource = input.required<Item[]>();
  name = input.required<string>();
  source = input.required<string>();
  onAddItem = output<void>();

  expandedElement: Item | null = null;

  filteredItems = computed(() =>
    this.dataSource().filter(({ name }) =>
      name ? name.toLowerCase().startsWith(this.name().toLowerCase()) : null
    )
  );
  filteredBySource = computed(() =>
    this.filteredItems().filter((i) =>
      this.source() ? this.source() == i.source.id : i
    )
  );
  mappedItems = computed(() =>
    this.filteredBySource().map((i) => ({
      ...i,
      total: i.amount * i.cost,
    }))
  );
  addItem() {
    this.onAddItem.emit();
  }
}
