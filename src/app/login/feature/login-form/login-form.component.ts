import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../shared/data-access/auth.service';
import { of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    RouterModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <h1 mat-card-title i18n>Log-in</h1>
      </mat-card-header>
      <form [formGroup]="loginForm">
        <mat-card-content>
          <mat-form-field>
            <mat-label i18n>E-mail</mat-label>
            <input type="email" matInput formControlName="email" />
            @if(email.invalid && (email.touched || email.dirty)){
            <mat-error>
              @if(email.hasError('email')){
              <ng-container i18n>Invalid e-mail</ng-container>
              } @else{
              <ng-container i18n>Field is required </ng-container>}
            </mat-error>
            }
          </mat-form-field>
          <mat-form-field>
            <mat-label i18n>Password</mat-label>
            <input type="password" matInput formControlName="password" />
            @if(password.invalid && (password.touched || password.dirty)){
            <mat-error i18n>Field is required</mat-error>
            }
          </mat-form-field>
        </mat-card-content>
        <mat-card-actions>
          <button
            mat-flat-button
            (click)="login()"
            [disabled]="loginForm.invalid"
          >
            @if(status() === 'loading'){
            <mat-spinner [diameter]="30"></mat-spinner>
            }@else {<ng-container i18n>Submit</ng-container> }
          </button>
        </mat-card-actions>
      </form>
    </mat-card>
  `,
  styleUrl: './login-form.component.scss',
})
export class LoginFormComponent {
  private _authService = inject(AuthService);
  private snackbar = inject(MatSnackBar);
  status = this._authService.state.status;
  error = this._authService.state.error;
  loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
  });
  get email() {
    return this.loginForm.get('email') as FormControl<string>;
  }
  get password() {
    return this.loginForm.get('password') as FormControl<string>;
  }

  constructor() {
    effect(() => {
      if (this.status() == 'error') {
        if (this.error() == 'auth/invalid-credential') {
          this.snackbar.open($localize`Invalid credentials`, 'X', {
            duration: 3000,
          });
        }
      }
    });
  }
  public login() {
    this._authService.login$.next({
      email: this.email.value,
      password: this.password.value,
    });
  }
}
