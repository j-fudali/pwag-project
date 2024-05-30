import { Component, effect, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/ui/header/header.component';
import { AuthService } from './shared/data-access/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { SidenavService } from './shared/data-access/sidenav.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private _authService = inject(AuthService);
  private _breakpointObs = inject(BreakpointObserver);
  private _sidnavService = inject(SidenavService);
  currentUser = this._authService.state.user;
  isGtSm = toSignal(
    this._breakpointObs
      .observe([Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
      .pipe(map((v) => v.matches)),
    { initialValue: false }
  );

  signOut() {
    this._authService.logout$.next();
  }
  toggleSidenav() {
    this._sidnavService.toggle();
  }
}
