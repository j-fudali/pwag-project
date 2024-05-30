import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  Output,
  computed,
  effect,
  input,
  output,
} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { User } from '@angular/fire/auth';
import { MatIconModule } from '@angular/material/icon';
import { UserCredentials } from '../../interfaces/UserCredentials';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <mat-toolbar color="primary">
      @if(showMore()){
      <button mat-icon-button (click)="toggleSidenav()">
        <mat-icon>menu</mat-icon>
      </button>
      }
      <span>Inventory @if(isGtSm()){managment}</span>
      <span class="spacer"></span>
      @if(currentUser()){
      <button (click)="signOut()" color="accent" mat-flat-button>
        Log out
      </button>
      }
    </mat-toolbar>
  `,
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  currentUser = input.required<UserCredentials | null | undefined>();
  isGtSm = input.required<boolean>();
  onSignOut = output<void>();
  onToggleSidenav = output<void>();
  showMore = computed(() => !this.isGtSm() && this.currentUser());
  signOut() {
    this.onSignOut.emit();
  }
  toggleSidenav() {
    this.onToggleSidenav.emit();
  }
}
