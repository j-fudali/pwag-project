import { CommonModule } from '@angular/common';
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
import { AddItemDialogComponent } from '../../ui/add-item-dialog/add-item-dialog.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { SourcesService } from '../../data-access/sources.service';
import { ItemsService } from '../../data-access/items.service';
import { FiltersComponent } from '../../ui/filters/filters.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [CommonModule, ItemsTableComponent, FiltersComponent],
  template: `
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
  private _itemsService = inject(ItemsService);
  private _breakpointObs = inject(BreakpointObserver);
  private snackbar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
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
  constructor() {
    effect(() => {
      if (this.itemAdded()) {
        this.snackbar.open('Item has been addded', 'X', { duration: 3000 });
      }
      if (this._sourcesService.state.status() == 'error') {
        this.snackbar.open(this._sourcesService.state.error()!, 'X', {
          duration: 3000,
        });
      }
      if (this._itemsService.state.status() == 'error') {
        this.snackbar.open(this._itemsService.state.error()!, 'X', {
          duration: 3000,
        });
      }
    });
  }
  addItem() {
    const dialogRef = this.dialog.open(AddItemDialogComponent, {
      data: { isGtSm: this.isGtSm, sources: this.sources },
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
