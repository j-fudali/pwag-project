import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  Signal,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Item } from '../../../shared/interfaces/Item';
import { ExtractFilenamePipe } from '../../utils/extract-filename.pipe';
import { Source } from '../../../shared/interfaces/Source';

@Component({
  selector: 'app-item-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatIconModule,
    MatListModule,
    ExtractFilenamePipe,
  ],
  providers: [ExtractFilenamePipe],
  template: `
    <h2 mat-dialog-title>{{ data.initialData ? 'Edit item' : 'Add item' }}</h2>
    <mat-dialog-content>
      <form
        [formGroup]="newItemForm"
        [style.gridTemplateColumns]="data.isGtSm() ? '1fr 1fr' : '1fr'"
      >
        <mat-form-field>
          <mat-label i18n>Name</mat-label>
          <input type="text" matInput formControlName="name" />
        </mat-form-field>
        <mat-form-field>
          <mat-label i18n>Model</mat-label>
          <input type="text" matInput formControlName="model" />
        </mat-form-field>
        <mat-form-field>
          <mat-label>Cost</mat-label>
          <input
            type="number"
            matInput
            step="0.01"
            min="0.01"
            formControlName="cost"
          />
        </mat-form-field>
        <mat-form-field>
          <mat-label i18n>Amount</mat-label>
          <input
            type="number"
            matInput
            step="1"
            min="1"
            formControlName="amount"
          />
        </mat-form-field>
        <mat-form-field>
          <mat-label i18n>Source</mat-label>
          <mat-select formControlName="source">
            @for (source of data.sources(); track $index) {
            <mat-option [value]="source.id">{{
              data.isPolish ? source.name_pl : source.name
            }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field>
          <mat-label i18n>Condition</mat-label>
          <mat-select formControlName="condition">
            <mat-option i18n value="ok">OK</mat-option>
            <mat-option i18n value="borrowed">Borrowed</mat-option>
            <mat-option i18n value="broken">Broken</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field>
          <mat-label i18n>Information</mat-label>
          <textarea type="text" matInput formControlName="info"></textarea>
        </mat-form-field>
      </form>
      <div class="invoices">
        <span i18n>Invoices</span>
        <div
          class="images-upload"
          [style.justifyContent]="invoices.length > 0 ? 'flex-start' : 'center'"
        >
          @if(data.initialData){ @if(initialInvoices && initialInvoices.length >
          0){
          <mat-list>
            @for(invoice of initialInvoices; track invoice){
            <mat-list-item>
              <mat-icon matListItemIcon>note</mat-icon>
              <div matListItemTitle>
                {{ invoice | appExtractFilename : true }}
              </div>
              <button
                (click)="removeInvoiceFromItem(invoice)"
                matListItemMeta
                mat-icon-button
              >
                <mat-icon>remove</mat-icon>
              </button>
            </mat-list-item>
            }
          </mat-list>
          } } @if(invoices.length > 0){
          <mat-list>
            @for(invoice of invoices; track $index){
            <mat-list-item>
              <mat-icon matListItemIcon>note</mat-icon>
              <div matListItemTitle>{{ invoice.name }}</div>
              <button (click)="remove(invoice)" matListItemMeta mat-icon-button>
                <mat-icon>remove</mat-icon>
              </button>
            </mat-list-item>
            }
          </mat-list>
          }
          <button
            mat-stroked-button
            class="upload-btn"
            (click)="uploadFiles.click()"
          >
            <mat-icon>upload</mat-icon><ng-container i18n>Upload</ng-container>
          </button>
          <input
            type="file"
            multiple
            #uploadFiles
            (change)="onInvoicesChange($event)"
          />
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button i18n mat-flat-button (click)="close()">Close</button>
      <button
        mat-raised-button
        [disabled]="newItemForm.invalid"
        [mat-dialog-close]="
          data.initialData
            ? { item: newItemForm.value, invoicesToRemove, initialInvoices }
            : newItemForm.value
        "
        color="primary"
      >
        @if(data.initialData){
        <ng-container i18n>Edit</ng-container>
        } @else{
        <ng-container i18n>Add</ng-container>
        }
      </button>
    </mat-dialog-actions>
  `,
  styleUrl: './item-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemDialogComponent {
  private fb = inject(FormBuilder);
  private extractFilenamePipe = inject(ExtractFilenamePipe);
  dialogRef = inject(MatDialogRef<ItemDialogComponent>);
  data: {
    isGtSm: Signal<boolean | undefined>;
    sources: Signal<Source[]>;
    isPolish: boolean;
    initialData?: Signal<Item>;
  } = inject(MAT_DIALOG_DATA);
  newItemForm = this.fb.group({
    name: ['', Validators.required],
    model: ['', Validators.required],
    cost: [0.01, [Validators.required, Validators.min(0.01)]],
    amount: [1, [Validators.required, Validators.min(1)]],
    source: ['', Validators.required],
    condition: ['ok', Validators.required],
    info: ['', Validators.required],
    invoices: [[] as File[]],
  });
  initialInvoices = this.data.initialData
    ? this.data.initialData().invoices || []
    : [];
  invoicesToRemove: string[] = [];
  get invoices() {
    const files = this.newItemForm.get('invoices')?.value as FileList | null;
    return files ? Array.from(files) : [];
  }
  constructor() {
    if (this.data.initialData) {
      this.newItemForm.patchValue({
        ...this.data.initialData(),
        source: this.data.initialData().source.id,
        invoices: [],
      });
    }
  }
  close() {
    this.dialogRef.close();
  }
  onInvoicesChange(e: Event) {
    const files = (e.target as HTMLInputElement).files as FileList | null;
    const currentFiles = this.newItemForm.get('invoices')?.value as File[];
    const actualNewFiles = files
      ? [
          ...currentFiles,
          ...Array.from(files).filter((f) => !currentFiles.includes(f)),
        ]
      : [];
    this.newItemForm.patchValue({
      invoices: actualNewFiles,
    });
  }
  remove(file: File) {
    this.newItemForm.patchValue({
      invoices: this.invoices.filter((i) => i != file),
    });
  }
  removeInvoiceFromItem(path: string) {
    console.log(path);
    this.invoicesToRemove = [
      ...this.invoicesToRemove,
      this.extractFilenamePipe.transform(path, false),
    ];
    this.initialInvoices = this.initialInvoices?.filter((i) => i != path);
  }
}
