import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
} from '@angular/core';
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
import { catchError, of, switchMap, throwError } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../shared/data-access/auth.service';
import { UserCredentials } from '../../../shared/interfaces/UserCredentials';
import { repeatPassword } from '../../../shared/utils/repeatPassword.validator';
import { RepeatPasswordStateMatcher } from '../../../shared/utils/repeatPasswordStateMatcher';

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
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <h1 mat-card-title>Sign up</h1>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="addUserForm">
          <mat-form-field>
            <mat-label>First name</mat-label>
            <input type="text" matInput formControlName="firstname" />
          </mat-form-field>
          <mat-form-field>
            <mat-label>Last name</mat-label>
            <input type="text" matInput formControlName="lastname" />
          </mat-form-field>
          <mat-form-field>
            <mat-label>Username</mat-label>
            <input type="text" matInput formControlName="username" />
          </mat-form-field>
          <mat-form-field>
            <mat-label>E-mail</mat-label>
            <input type="email" matInput formControlName="email" />
          </mat-form-field>
          <mat-form-field>
            <mat-label>Password</mat-label>
            <input type="password" matInput formControlName="password" />
          </mat-form-field>
          <mat-form-field>
            <mat-label>Repeat password</mat-label>
            <input
              type="password"
              matInput
              formControlName="rePassword"
              [errorStateMatcher]="errorStateMatcher"
            />
            @if(addUserForm.invalid && (rePassword.dirty ||
            rePassword.touched)){
            <mat-error>
              @if( addUserForm.hasError('notMatch')){ Passwords not match }
              @else{ Field is required }
            </mat-error>
            }
          </mat-form-field>
        </form>
      </mat-card-content>
      <mat-card-actions>
        <button (click)="addUser()" mat-flat-button>Submit</button>
      </mat-card-actions>
    </mat-card>
  `,
  styleUrl: './add-user-form.component.scss',
})
export class AddUserFormComponent {
  private _authService = inject(AuthService);
  private _destroyRef = inject(DestroyRef);
  private _snackbar = inject(MatSnackBar);
  errorStateMatcher = new RepeatPasswordStateMatcher();
  addUserForm = new FormGroup(
    {
      firstname: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      lastname: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
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
        validators: [Validators.required],
      }),
      rePassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: repeatPassword }
  );

  get firstname() {
    return this.addUserForm.get('firstname') as FormControl;
  }
  get lastname() {
    return this.addUserForm.get('lastname') as FormControl;
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

  public addUser() {
    const userCredentials: UserCredentials = {
      firstname: this.firstname.value,
      lastname: this.lastname.value,
      username: this.username.value,
      email: this.email.value,
      role: 'USER',
    };
    of(this._authService.addUser(this.email.value, this.password.value))
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        switchMap(() => {
          return this._authService.createUser(userCredentials);
        }),
        catchError((err) => {
          console.log(err);
          this._snackbar.open('Cannot create user', 'X');
          return throwError(() => err);
        })
      )
      .subscribe((res) => console.log(res));
  }
}
