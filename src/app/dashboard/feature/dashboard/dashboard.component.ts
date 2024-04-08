import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ItemsTableComponent } from '../../ui/items-table/items-table.component';
import { Item } from '../../../shared/interfaces/Item';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { SidenavService } from '../../../shared/data-access/sidenav.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ItemsTableComponent, MatSidenavModule, MatListModule],
  template: `
    <mat-sidenav-container>
      <mat-sidenav
        [style.width]="!isGtSm() ? '40%' : '20%'"
        [opened]="sidenavOpened() || isGtSm()"
        [mode]="mode()"
      >
        <mat-nav-list>
          <a mat-list-item>Dashboard</a>
          <a mat-list-item>Users</a>
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content>
        <app-items-table
          [dataSource]="dataSource"
          [displayedColumns]="displayedColumns()"
        ></app-items-table>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private _sidenavService = inject(SidenavService);
  private _breakpointObs = inject(BreakpointObserver);
  isGtSm = toSignal(
    this._breakpointObs
      .observe([Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
      .pipe(map((v) => v.matches))
  );
  mode = computed(() => (this.isGtSm() ? 'side' : 'over'));
  sidenavOpened = this._sidenavService.sidenavOpened;
  displayedColumns = computed(() =>
    this.isGtSm() ? this.columns : this.columns.slice(0, 5)
  );
  columns = [
    'name',
    'model',
    'cost',
    'amount',
    'total',
    'source',
    'condition',
    'info',
    'modified',
  ];
  dataSource: Item[] = [
    {
      name: 'Nazwa',
      model: 'Model',
      cost: 10.99,
      amount: 2,
      total: 21.98,
      source: 'Source',
      condition: 'OK',
      info: 'Info',
      modified: 'Jakub 20.01.2024r.',
    },
  ];
}
