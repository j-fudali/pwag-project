import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SidenavService {
  private readonly _sidenavOpened = signal(false);
  readonly sidenavOpened = this._sidenavOpened.asReadonly();

  toggle() {
    this._sidenavOpened.update((isOpened) => !isOpened);
  }
}
