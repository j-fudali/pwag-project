import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserCredentials } from '../../../shared/interfaces/UserCredentials';
import { repeatPassword } from '../../../shared/utils/repeatPassword.validator';
import { RepeatPasswordStateMatcher } from '../../../shared/utils/repeatPasswordStateMatcher';
import { BreakpointsService } from '../../../shared/data-access/breakpoints.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UsersService } from '../../data-access/users.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
@Component({
  selector: 'app-add-user-form',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  providers: [UsersService],
  template: `
    <mat-card [style.width]="isGtSm() ? 'auto' : '100%'">
      <mat-card-header>
        <h1 mat-card-title i18n>Create user</h1>
      </mat-card-header>
      <form [formGroup]="addUserForm" (ngSubmit)="addUser()">
        <mat-card-content
          [style]="{ gridTemplateColumns: isGtSm() ? '1fr 1fr' : '1fr' }"
        >
          <mat-form-field>
            <mat-label i18n>Username</mat-label>
            <input type="text" matInput formControlName="username" />
            @if(username.hasError('required') && (username.touched ||
            username.dirty)){
            <mat-error i18n>Field is required</mat-error>
            }
          </mat-form-field>
          <mat-form-field>
            <mat-label i18n>E-mail</mat-label>
            <input type="email" matInput formControlName="email" />
            @if(email.invalid && (email.touched || email.dirty)){
            <mat-error
              >@if(email.hasError('required')){<ng-container i18n
                >Field is required</ng-container
              >}@else{<ng-container i18n>It is not a valid e-mail</ng-container
              >}</mat-error
            >
            }
          </mat-form-field>
          <mat-form-field>
            <mat-label i18n>Password</mat-label>
            <input type="password" matInput formControlName="password" />
            @if(password.invalid && (password.touched || password.dirty)){
            <mat-error [style]="{ display: 'flex', alignItems: 'center' }"
              >@if(password.hasError('required')){<ng-container i18n
                >Field is required</ng-container
              >}@else{<span i18n>Password is invalid</span
              ><mat-icon
                i18n-matTooltip
                matTooltip="Minimum eight characters, at least one letter, one number and one special character"
                >info</mat-icon
              >}</mat-error
            >
            }
          </mat-form-field>
          <mat-form-field>
            <mat-label i18n>Repeat password</mat-label>
            <input
              type="password"
              matInput
              formControlName="rePassword"
              [errorStateMatcher]="errorStateMatcher"
            />
            @if(addUserForm.invalid || (rePassword.dirty ||
            rePassword.touched)){
            <mat-error>
              @if( addUserForm.hasError('notMatch')){<ng-container i18n
                >Passwords not match</ng-container
              >
              } @else{ <ng-container i18n>Field is required</ng-container> }
            </mat-error>
            }
          </mat-form-field>
          <mat-checkbox i18n formControlName="isAdmin"
            >Is Administrator</mat-checkbox
          >
        </mat-card-content>
        <mat-card-actions>
          <button
            type="submit"
            mat-flat-button
            [disabled]="status() === 'loading'"
          >
            @if(status() === 'loading'){<mat-spinner
              [diameter]="30"
            ></mat-spinner>
            }@else{
            <ng-container i18n>Submit</ng-container>}
          </button>
        </mat-card-actions>
      </form>
    </mat-card>
  `,

  styleUrl: './add-user-form.component.scss',
})
export class AddUserFormComponent {
  private _usersService = inject(UsersService);
  private _snackbar = inject(MatSnackBar);
  private _breakpointsService = inject(BreakpointsService);
  error = this._usersService.state.error;
  status = this._usersService.state.status;
  isGtSm = this._breakpointsService.isGtSm;
  errorStateMatcher = new RepeatPasswordStateMatcher();
  addUserForm = new FormGroup(
    {
      username: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.pattern(
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/
          ),
        ],
      }),
      rePassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      isAdmin: new FormControl(false, {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: repeatPassword }
  );
  constructor() {
    effect(() => {
      if (this._usersService.state.status() === 'added') {
        this._snackbar.open($localize`User has been added`, 'X', {
          duration: 3000,
        });
      }
      if (this._usersService.state.status() == 'error') {
        this._snackbar.open(this.error()!, 'X', { duration: 3000 });
      }
    });
  }

  get username() {
    return this.addUserForm.get('username') as FormControl;
  }
  get email() {
    return this.addUserForm.get('email') as FormControl;
  }
  get password() {
    return this.addUserForm.get('password') as FormControl;
  }
  get rePassword() {
    return this.addUserForm.get('rePassword') as FormControl;
  }
  get isAdmin() {
    return this.addUserForm.get('isAdmin') as FormControl;
  }

  public addUser() {
    if (this.addUserForm.valid) {
      const userCredentials: UserCredentials = {
        username: this.username.value,
        isAdmin: this.isAdmin.value,
      };
      this._usersService.addUser$.next({
        email: this.email.value,
        password: this.password.value,
        userCredentials,
      });
    }
  }
}
