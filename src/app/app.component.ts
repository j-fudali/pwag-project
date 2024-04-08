import { Component, DestroyRef, OnInit, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/ui/header/header.component';
import { AuthService } from './shared/data-access/auth.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
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
  private _destroyRef = inject(DestroyRef);
  private _breakpointObs = inject(BreakpointObserver);
  private _sidnavService = inject(SidenavService);
  private _router = inject(Router);
  currentUser = this._authService.currentUser$;
  private isGtSm = toSignal(
    this._breakpointObs
      .observe([Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
      .pipe(map((v) => v.matches))
  );
  showToggleButton = computed(() => !this.isGtSm());

  signOut() {
    this._authService
      .signOut()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this._router.navigate(['/login']));
  }
  toggleSidenav() {
    this._sidnavService.toggle();
  }
}
