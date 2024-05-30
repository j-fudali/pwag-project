import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { SidenavService } from '../../../shared/data-access/sidenav.service';
import { RouterModule } from '@angular/router';
import { BreakpointsService } from '../../../shared/data-access/breakpoints.service';
import { ItemsService } from '../../data-access/items.service';
import { SourcesService } from '../../data-access/sources.service';
import { UsersService } from '../../data-access/users.service';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSidenavModule, MatListModule],
  providers: [ItemsService, SourcesService, UsersService],
  template: `
    <mat-sidenav-container>
      <mat-sidenav
        #sidenav
        [style.width]="!isGtSm() ? '35%' : '20%'"
        [opened]="sidenavOpened() || isGtSm()"
        [mode]="mode()"
      >
        <mat-nav-list>
          @for (nav of navigations; track nav) {
          <a
            (click)="_sidenavService.toggle()"
            mat-list-item
            [routerLink]="nav.routerLink"
            >{{ nav.label }}</a
          >
          }
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content>
        <router-outlet></router-outlet>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private _breakpointsService = inject(BreakpointsService);
  _sidenavService = inject(SidenavService);
  isGtSm = this._breakpointsService.isGtSm;
  mode = computed(() => (this.isGtSm() ? 'side' : 'over'));
  sidenavOpened = this._sidenavService.sidenavOpened;
  navigations = [
    {
      label: 'Dashboard',
      routerLink: '/',
    },
    {
      label: 'Users',
      routerLink: 'users',
    },
  ];
}
