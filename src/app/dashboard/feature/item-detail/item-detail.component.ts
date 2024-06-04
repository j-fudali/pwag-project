import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ItemsService } from '../../data-access/items.service';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { ExtractFilenamePipe } from '../../utils/extract-filename.pipe';
import { MatDialog } from '@angular/material/dialog';
import { ItemDialogComponent } from '../../ui/item-dialog/item-dialog.component';
import { BreakpointsService } from '../../../shared/data-access/breakpoints.service';
import { SourcesService } from '../../data-access/sources.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MapConditionsPipe } from '../../utils/map-conditions.pipe';
@Component({
  selector: 'app-item-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatProgressBarModule,
    MatButtonModule,
    ExtractFilenamePipe,
    MapConditionsPipe,
  ],
  providers: [ExtractFilenamePipe],
  template: ` <mat-card>
    <mat-card-header>
      <mat-card-title>{{ item()?.name }}</mat-card-title>
      <mat-card-subtitle>{{ item()?.model }}</mat-card-subtitle>
    </mat-card-header>
    <mat-card-content>
      <div>
        @for (item of content() | keyvalue; track item.key) {
        <span class="item-attribute">
          <b>{{ item.key | titlecase }}</b
          >:
          {{
            item.key == 'condition'
              ? (item.value.toString() | appMapConditions)
              : item.value
          }}
        </span>
        }
      </div>
      <mat-list>
        @for(invoice of item()?.invoices; track $index){
        <mat-list-item>
          <mat-icon matListItemIcon>note</mat-icon>
          <a [href]="invoice" download matListItemTitle>{{
            invoice | appExtractFilename : true
          }}</a>
        </mat-list-item>
        }
      </mat-list>
    </mat-card-content>
    <mat-card-footer>
      <mat-card-actions>
        <button
          mat-stroked-button
          [disabled]="
            editLoading() === 'loading' || deleteLoading() === 'loading'
          "
          class="tertiary-button"
          (click)="edit()"
        >
          Edit
        </button>
        <button
          mat-flat-button
          [disabled]="
            editLoading() === 'loading' || deleteLoading() === 'loading'
          "
          class="error-button"
          (click)="delete()"
        >
          Delete
        </button>
      </mat-card-actions>
      @if(!item() || editLoading() == 'loading' || deleteLoading() ===
      'loading'){
      <mat-progress-bar [mode]="'indeterminate'"></mat-progress-bar>
      }
    </mat-card-footer>
  </mat-card>`,
  styleUrl: './item-detail.component.scss',
})
export class ItemDetailComponent implements OnInit, OnDestroy {
  private _itemsService = inject(ItemsService);
  private dialog = inject(MatDialog);
  private _breakpointsService = inject(BreakpointsService);
  private _sourcesService = inject(SourcesService);
  private extractFilenamePipe = inject(ExtractFilenamePipe);
  isGtSm = this._breakpointsService.isGtSm;
  id = input.required<string>();
  item = this._itemsService.state.selectedItem;
  editLoading = this._itemsService.state.itemEdited;
  deleteLoading = this._itemsService.state.itemDeleted;
  content = computed(() => {
    if (this.item()) {
      const { name, model, invoices, source, ...rest } = this.item()!;
      return rest;
    }
    return null;
  });
  ngOnInit(): void {
    this._itemsService.getItemById$.next(this.id());
  }
  ngOnDestroy(): void {
    this._itemsService.getItemById$.next(null);
  }
  edit() {
    const ref = this.dialog.open(ItemDialogComponent, {
      data: {
        isGtSm: this.isGtSm,
        sources: this._sourcesService.state.sources,
        initialData: this.item,
      },
    });
    ref
      .afterClosed()
      .subscribe(({ item, invoicesToRemove, initialInvoices }) => {
        if (item && invoicesToRemove) {
          this._itemsService.edit$.next({
            ...item,
            invoicesToRemove,
            initialInvoices,
            id: this.id(),
          });
        }
      });
  }
  delete() {
    this._itemsService.delete$.next({
      ...this.item()!,
      invoices: this.item()!.invoices?.map((invoice) =>
        this.extractFilenamePipe.transform(invoice)
      ),
      id: this.id(),
    });
  }
}