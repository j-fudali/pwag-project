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
import { AuthService } from '../../../shared/data-access/auth.service';
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
        <span
          ><b i18n>Condition</b>:
          {{ content()?.condition!.toString() | appMapConditions }}</span
        >
        <span><b i18n>Amount</b>: {{ content()?.amount }}</span>

        <span><b i18n>Cost</b>: {{ content()?.cost }} zł</span>
        <span><b i18n>Total</b>: {{ content()?.total }} zł</span>
        <span
          ><b i18n>Source</b>:
          {{
            isPolish ? content()?.source?.name_pl : content()?.source?.name
          }}</span
        >
        <span><b i18n>Information</b>: {{ content()?.info }}</span>
        <span><b i18n>Modified</b>: {{ content()?.modified }}</span>
        <span><b i18n>Modified By</b>: {{ content()?.modifiedBy }}</span>
      </div>
      <mat-list>
        @for(invoice of item()?.invoices; track $index){
        <mat-list-item>
          <mat-icon matListItemIcon>note</mat-icon>
          <a target="_blank" [href]="invoice" download matListItemTitle
            ><span>{{ invoice | appExtractFilename : true }}</span></a
          >
        </mat-list-item>
        }
      </mat-list>
    </mat-card-content>
    <mat-card-footer>
      <mat-card-actions>
        @if(user()?.isAdmin){
        <button
          i18n
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
          i18n
          mat-flat-button
          [disabled]="
            editLoading() === 'loading' || deleteLoading() === 'loading'
          "
          class="error-button"
          (click)="delete()"
        >
          Delete
        </button>
        }
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
  private _authService = inject(AuthService);
  private _itemsService = inject(ItemsService);
  private dialog = inject(MatDialog);
  private _breakpointsService = inject(BreakpointsService);
  private _sourcesService = inject(SourcesService);
  private extractFilenamePipe = inject(ExtractFilenamePipe);
  private url = location.href;
  isPolish = this.url.includes('4201');
  user = this._authService.state.user;
  isGtSm = this._breakpointsService.isGtSm;
  id = input.required<string>();
  item = this._itemsService.state.selectedItem;
  editLoading = this._itemsService.state.itemEdited;
  deleteLoading = this._itemsService.state.itemDeleted;
  content = computed(() => {
    if (this.item()) {
      const { name, model, invoices, source, cost, amount, ...rest } =
        this.item()!;
      const total = cost * amount;
      return { total, cost, source, amount, ...rest };
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
        isPolish: this.isPolish,
      },
    });
    ref.afterClosed().subscribe((data) => {
      if (data) {
        const { item, invoicesToRemove, initialInvoices } = data;
        if (item && invoicesToRemove) {
          this._itemsService.edit$.next({
            ...item,
            invoicesToRemove,
            initialInvoices,
            id: this.id(),
          });
        }
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
