import { Injectable, Signal, inject } from '@angular/core';
import { getApp, FirebaseError } from '@angular/fire/app';
import { User, getAuth } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import {
  Subject,
  switchMap,
  from,
  map,
  catchError,
  merge,
  shareReplay,
  of,
  filter,
  tap,
} from 'rxjs';
import { UserCredentials } from '../../shared/interfaces/UserCredentials';
import { toSignal } from '@angular/core/rxjs-interop';
import { createUserWithEmailAndPassword } from '@firebase/auth';

export interface UsersState {
  newUser: Signal<User | null>;
  status: Signal<'added' | 'loading' | 'error' | null>;
  error: Signal<string | null>;
}

@Injectable()
export class UsersService {
  private _firestore = inject(Firestore);
  addUser$ = new Subject<{
    email: string;
    password: string;
    userCredentials: UserCredentials;
  }>();
  private error$ = new Subject<FirebaseError>();
  private authApp = getApp('authApp');
  private auth = getAuth(this.authApp);
  private onAddUser$ = this.addUser$.pipe(
    switchMap(({ email, password, userCredentials }) => {
      return from(
        createUserWithEmailAndPassword(this.auth, email, password)
      ).pipe(
        map((user) => ({ user, email, userCredentials })),
        catchError((err) => {
          this.error$.next(err);
          return of(null);
        })
      );
    }),
    filter((result) => result !== null),
    switchMap((result) => {
      if (!result) return of(null);
      const { user, email, userCredentials } = result;
      return from(
        setDoc(doc(this._firestore, `/users/${user.user.uid}`), {
          email,
          ...userCredentials,
        })
      ).pipe(
        map(() => user.user),
        catchError((err) => {
          this.error$.next(err);
          return of(null);
        })
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  private status$ = merge(
    this.addUser$.pipe(map(() => 'loading' as const)),
    this.onAddUser$.pipe(
      filter((user) => user !== null),
      map(() => 'added' as const)
    ),
    this.error$.pipe(map(() => 'error' as const))
  );
  private newUser = toSignal(this.onAddUser$, { initialValue: null });
  private status = toSignal(this.status$, { initialValue: null });
  private error = toSignal(
    this.error$.pipe(
      map((err) => {
        switch (err.code) {
          case 'auth/invalid-credential':
            return 'Invalid credentials';
          case 'auth/email-already-in-use':
            return 'E-mail already in use';
          case 'permission-denied':
            return 'You cannot add user';
          default:
            return 'Unknown error';
        }
      })
    ),
    {
      initialValue: null,
    }
  );
  state: UsersState = {
    newUser: this.newUser,
    status: this.status,
    error: this.error,
  };
}
