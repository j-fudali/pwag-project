import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
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
import { Source } from '../../../shared/interfaces/Source';

@Component({
  selector: 'app-add-item-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>Add item</h2>
    <mat-dialog-content>
      <form
        [formGroup]="newItemForm"
        [style.gridTemplateColumns]="data.isGtSm() ? '1fr 1fr' : '1fr'"
      >
        <mat-form-field>
          <mat-label>Name</mat-label>
          <input type="text" matInput formControlName="name" />
        </mat-form-field>
        <mat-form-field>
          <mat-label>Model</mat-label>
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
          <mat-label>Amount</mat-label>
          <input
            type="number"
            matInput
            step="1"
            min="1"
            formControlName="amount"
          />
        </mat-form-field>
        <mat-form-field>
          <mat-label>Source</mat-label>
          <mat-select formControlName="source">
            @for (source of data.sources(); track $index) {
            <mat-option [value]="source.id">{{ source.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Condition</mat-label>
          <input type="text" matInput formControlName="condition" />
        </mat-form-field>
        <mat-form-field>
          <mat-label>Information</mat-label>
          <textarea type="text" matInput formControlName="info"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-flat-button (click)="close()">Close</button>
      <button
        mat-raised-button
        [disabled]="newItemForm.invalid"
        [mat-dialog-close]="newItemForm.value"
        color="primary"
      >
        Add
      </button>
    </mat-dialog-actions>
  `,
  styleUrl: './add-item-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddItemDialogComponent {
  private fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<AddItemDialogComponent>);
  data: {
    isGtSm: Signal<boolean | undefined>;
    sources: Signal<Source[]>;
  } = inject(MAT_DIALOG_DATA);
  newItemForm = this.fb.group({
    name: ['', Validators.required],
    model: ['', Validators.required],
    cost: [0.01, [Validators.required, Validators.min(0.01)]],
    amount: [1, [Validators.required, Validators.min(1)]],
    source: ['', Validators.required],
    condition: ['', Validators.required],
    info: ['', Validators.required],
  });
  close() {
    this.dialogRef.close();
  }
}
