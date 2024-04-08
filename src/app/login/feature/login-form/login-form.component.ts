import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
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
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <h1 mat-card-title>Log-in</h1>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="loginForm">
          <mat-form-field>
            <mat-label>E-mail</mat-label>
            <input type="email" matInput formControlName="email" />
          </mat-form-field>
          <mat-form-field>
            <mat-label>Password</mat-label>
            <input type="password" matInput formControlName="password" />
          </mat-form-field>
        </form>
      </mat-card-content>
      <mat-card-actions>
        <button
          mat-flat-button
          (click)="login()"
          [disabled]="loginForm.invalid"
        >
          Submit
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styleUrl: './login-form.component.scss',
})
export class LoginFormComponent {
  private _authService = inject(AuthService);
  private _destroyRef = inject(DestroyRef);
  private _router = inject(Router);
  loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
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
  public login() {
    this._authService
      .login(this.email.value, this.password.value)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this._router.navigate(['/dashboard']));
  }
}
