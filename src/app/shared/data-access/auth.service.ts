import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
import { UserCredentials } from '../interfaces/UserCredentials';
import { toSignal } from '@angular/core/rxjs-interop';
import { from, map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _auth = inject(Auth);
  private _firestore = inject(Firestore);
  private _usersRef = collection(this._firestore, 'users');
  currentUser$ = signal<User | null>(null);
  constructor() {
    this._listenAuthStateChanged();
  }
  private _listenAuthStateChanged() {
    this._auth.onAuthStateChanged((user) => {
      if (user) {
        this.currentUser$.set(user);
      } else {
        this.currentUser$.set(null);
      }
    });
  }
  public getAuthenticated() {
    return this._auth.currentUser;
  }

  public login(email: string, password: string) {
    return from(signInWithEmailAndPassword(this._auth, email, password));
  }

  public signOut() {
    return from(signOut(this._auth));
  }

  public addUser(email: string, password: string) {
    return createUserWithEmailAndPassword(
      this._auth,
      email.trim(),
      password.trim()
    );
  }

  public createUser(credentials: UserCredentials) {
    return addDoc(this._usersRef, credentials);
  }
}
