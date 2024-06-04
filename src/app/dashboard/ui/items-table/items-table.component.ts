import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
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
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { RouterModule } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MapConditionsPipe } from '../../utils/map-conditions.pipe';

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
    RouterModule,
    MapConditionsPipe,
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
    @if(mappedItems().length > 0){
    <table mat-table multiTemplateDataRows [dataSource]="mappedItems()">
      @for (column of displayedColumns(); track column) {
      <ng-container matColumnDef="{{ column }}">
        <th mat-header-cell *matHeaderCellDef>{{ column }}</th>
        <td mat-cell *matCellDef="let element">
          {{
            column == 'source'
              ? element[column].name
              : column == 'condition'
              ? (element[column] | appMapConditions)
              : element[column]
          }}
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
              <div>
                @for(column of displayedColumnsExpanded(); track column){
                <div>
                  <span>{{ column }}: </span>
                  <span>
                    {{
                      column == 'source'
                        ? element[column].name
                        : column == 'condition'
                        ? (element[column] | appMapConditions)
                        : element[column]
                    }}</span
                  >
                </div>
                }
              </div>
              <a mat-stroked-button [routerLink]="[element['id']]">Details</a>
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
    } @else {
    <h3>No items found</h3>
    }
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
    this.isGtSm() ? this.columns.slice(0, -4) : this.columns.slice(0, -6)
  );
  displayedColumnsExpanded = computed(() =>
    this.isGtSm() ? this.columns.slice(-4) : this.columns.slice(-6)
  );
  isGtSm = input.required<boolean>();
  dataSource = input.required<Item[]>();
  name = input.required<string>();
  source = input.required<string>();

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
}
