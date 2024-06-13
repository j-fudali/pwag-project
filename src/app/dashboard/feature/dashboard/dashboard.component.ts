import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { BreakpointsService } from '../../../shared/data-access/breakpoints.service';
import { ItemsService } from '../../data-access/items.service';
import { SourcesService } from '../../data-access/sources.service';
import { MatDividerModule } from '@angular/material/divider';
import { HeaderComponent } from '../../../shared/ui/header/header.component';
import { AuthService } from '../../../shared/data-access/auth.service';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatDividerModule,
    HeaderComponent,
  ],
  providers: [ItemsService, SourcesService],
  template: `
    <mat-sidenav-container>
      <mat-sidenav
        #sidenav
        fixedInViewport
        [style.width]="isGtSm() ? '20%' : '50%'"
        [(opened)]="sidenavOpened"
        [mode]="mode()"
      >
        <mat-nav-list>
          @for (nav of navigations(); track nav) {
          <a
            (click)="!isGtSm() ? sidenav.close() : null"
            mat-list-item
            [routerLink]="nav.routerLink"
            >{{ nav.label }}</a
          >
          }
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content
        [style]="
          isGtSm() ? { borderLeft: '1px solid rgb(193, 193, 193)' } : null
        "
      >
        <app-header
          (onSignOut)="signOut()"
          (onToggleSidenav)="toggleSidenav()"
          [currentUser]="currentUser()"
          [isGtSm]="isGtSm()"
        ></app-header>
        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private _breakpointsService = inject(BreakpointsService);
  private _authService = inject(AuthService);
  isGtSm = this._breakpointsService.isGtSm;
  mode = computed(() => (this.isGtSm() ? 'side' : 'over'));
  sidenavOpened = false;
  navigations = computed(() => {
    if (this._authService.state.user()?.isAdmin) {
      return [
        {
          label: $localize`Dashboard`,
          routerLink: '/',
        },
        {
          label: $localize`Users`,
          routerLink: 'users',
        },
        {
          label: $localize`Sources`,
          routerLink: 'sources',
        },
      ];
    }
    return [
      {
        label: $localize`Dashboard`,
        routerLink: '/',
      },
    ];
  });
  currentUser = this._authService.state.user;
  constructor() {
    effect(() => {
      if (this.isGtSm()) {
        this.sidenavOpened = true;
      } else {
        this.sidenavOpened = false;
      }
    });
  }
  signOut() {
    this._authService.logout$.next();
  }
  toggleSidenav() {
    this.sidenavOpened = !this.sidenavOpened;
  }
}
