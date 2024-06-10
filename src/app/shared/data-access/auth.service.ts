import { Injectable, Signal, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Auth,
  User,
  authState,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  user,
} from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import {
  EMPTY,
  Subject,
  catchError,
  filter,
  from,
  map,
  merge,
  of,
  share,
  shareReplay,
  switchMap,
  take,
  tap,
  throwError,
} from 'rxjs';
import { UserCredentials } from '../interfaces/UserCredentials';
import { FirebaseError } from '@angular/fire/app';

export interface AuthState {
  user: Signal<UserCredentials | null>;
  status: Signal<'logged-in' | 'logged-out' | 'loading' | 'error' | null>;
  error: Signal<string | null>;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _auth = inject(Auth);
  private router = inject(Router);
  private _firestore = inject(Firestore);

  login$ = new Subject<{ email: string; password: string }>();
  logout$ = new Subject<void>();
  private error$ = new Subject<FirebaseError>();
  private onLogout$ = this.logout$.pipe(
    switchMap(() => signOut(this._auth)),
    tap(() => this.router.navigate(['/']))
  );
  private onLogin$ = this.login$.pipe(
    switchMap(({ email, password }) =>
      from(signInWithEmailAndPassword(this._auth, email, password)).pipe(
        catchError((err: FirebaseError) => {
          this.error$.next(err);
          return of(null);
        })
      )
    ),
    map((userCredential) => (userCredential ? userCredential.user : null)),
    tap(() => this.router.navigate(['/dashboard']))
  );
  private currentUser$ = user(this._auth);
  private user$ = merge(this.currentUser$, this.onLogin$).pipe(
    switchMap((user) =>
      user ? getDoc(doc(this._firestore, `/users/${user?.uid}`)) : of(null)
    ),
    map((doc) => (doc ? (doc.data() as UserCredentials) : null)),
    shareReplay(1)
  );

  private status$ = merge(
    this.user$.pipe(
      filter((user) => user !== null),
      map(() => 'logged-in' as const)
    ),
    merge(this.login$, this.logout$).pipe(map(() => 'loading' as const)),
    this.error$.pipe(map(() => 'error' as const)),
    this.onLogout$.pipe(map(() => 'logged-out' as const))
  );
  private user = toSignal(this.user$, { initialValue: null });
  private status = toSignal(this.status$, { initialValue: null });
  private error = toSignal(this.error$.pipe(map((err) => err.code)), {
    initialValue: null,
  });
  state: AuthState = {
    user: this.user,
    status: this.status,
    error: this.error,
  };
}
