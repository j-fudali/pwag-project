import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatListModule, MatSelectionList } from '@angular/material/list';
import { SourcesService } from '../../data-access/sources.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-sources',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title i18n>Sources</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div>
          <mat-form-field appearance="outline">
            <mat-label i18n>New source</mat-label>
            <input type="text" matInput [(ngModel)]="newSource" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label i18n>New source (Polish)</mat-label>
            <input type="text" matInput [(ngModel)]="newSourcePl" />
            <button
              [disabled]="newSource === '' || newSourcePl === ''"
              matSuffix
              mat-icon-button
              i18n
              (click)="add()"
            >
              <mat-icon>add</mat-icon>
            </button>
          </mat-form-field>
        </div>
        @if(sources().length > 0){
        <mat-selection-list #selectionList>
          @for (source of sources(); track sources) {
          <mat-list-option [value]="source.id">{{
            isPolish ? source.name_pl : source.name
          }}</mat-list-option>
          }
        </mat-selection-list>
        }@else {
        <h3 i18n>No sources yet!</h3>
        }
      </mat-card-content>
      <mat-card-footer>
        <mat-card-actions>
          <button mat-icon-button (click)="deleteSelected()">
            <mat-icon>delete</mat-icon>
          </button>
        </mat-card-actions>
      </mat-card-footer>
    </mat-card>
  `,
  styleUrl: './sources.component.scss',
})
export class SourcesComponent {
  selectionList = viewChild.required<MatSelectionList>('selectionList');
  private _sourcesService = inject(SourcesService);
  private snackbar = inject(MatSnackBar);
  private url = location.href;
  isPolish = this.url.includes('4201');
  sources = this._sourcesService.state.sources;
  newSource = '';
  newSourcePl = '';
  constructor() {
    effect(() => {
      if (this._sourcesService.state.onAdd() === 'success') {
        this.snackbar.open($localize`Source added`, 'X', { duration: 3000 });
      }
      if (this._sourcesService.state.onAdd() === 'error') {
        this.snackbar.open($localize`Source not added`, 'X', {
          duration: 3000,
        });
      }
      if (this._sourcesService.state.onDeleteMany() === 'success') {
        this.snackbar.open($localize`Sources deleted`, 'X', { duration: 3000 });
      }
      if (this._sourcesService.state.onDeleteMany() === 'error') {
        this.snackbar.open($localize`Sources not deleted`, 'X', {
          duration: 3000,
        });
      }
    });
  }
  add() {
    if (this.newSource.length > 0 && this.newSourcePl.length > 0) {
      this._sourcesService.add$.next({
        newSource: this.newSource,
        newSourcePl: this.newSourcePl,
      });
      this.newSource = '';
      this.newSourcePl = '';
    }
  }
  deleteSelected() {
    this._sourcesService.deleteMany$.next(
      this.selectionList().selectedOptions.selected.map(
        (option) => option.value as string
      )
    );
  }
}
