import { CommonModule, Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
} from '@angular/core';
import { ItemsTableComponent } from '../../ui/items-table/items-table.component';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { EMPTY, map, switchMap, tap } from 'rxjs';
import { NewItem } from '../../../shared/interfaces/NewItem';
import { ItemDialogComponent } from '../../ui/item-dialog/item-dialog.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { SourcesService } from '../../data-access/sources.service';
import { ItemsService } from '../../data-access/items.service';
import { FiltersComponent } from '../../ui/filters/filters.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/data-access/auth.service';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [
    CommonModule,
    ItemsTableComponent,
    FiltersComponent,
    MatButtonModule,
    MatProgressBarModule,
  ],
  template: `
    @if(itemAdded() === 'loading'){
    <mat-progress-bar mode="indeterminate" />
    } @if(user()?.isAdmin){
    <button i18n class="add-item" mat-raised-button (click)="addItem()">
      Add item
    </button>
    }
    <app-filters
      [sources]="sources()"
      [isGtSm]="isGtSm()"
      (onNameChanged)="onNameChanged($event)"
      (onSourceChanged)="onSourceChanged($event)"
    ></app-filters>
    <app-items-table
      [source]="source"
      [name]="name"
      [dataSource]="items()"
      [isGtSm]="isGtSm()"
      (onAddItem)="addItem()"
    ></app-items-table>
  `,
  styleUrl: './items.component.scss',
})
export class ItemsComponent {
  private _sourcesService = inject(SourcesService);
  private _authService = inject(AuthService);
  private _itemsService = inject(ItemsService);
  private _breakpointObs = inject(BreakpointObserver);
  private dialog = inject(MatDialog);
  private url = location.href;
  private isPolish = this.url.includes('4201');
  user = this._authService.state.user;
  itemAdded = this._itemsService.state.itemAdded;
  items = this._itemsService.state.items;
  sources = this._sourcesService.state.sources;
  isGtSm = toSignal(
    this._breakpointObs
      .observe([Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
      .pipe(map((v) => v.matches)),
    { initialValue: false }
  );
  name: string = '';
  source: string = '';

  addItem() {
    const dialogRef = this.dialog.open(ItemDialogComponent, {
      data: {
        isGtSm: this.isGtSm,
        sources: this.sources,
        isPolish: this.isPolish,
      },
    });
    dialogRef
      .afterClosed()
      .pipe(
        tap((item: NewItem | undefined) =>
          item ? this._itemsService.add$.next(item) : EMPTY
        )
      )
      .subscribe();
  }
  onNameChanged(name: string) {
    this.name = name;
  }
  onSourceChanged(source: string) {
    this.source = source;
  }
}
