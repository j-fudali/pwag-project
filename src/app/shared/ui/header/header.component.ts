import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  Output,
  effect,
  input,
  output,
} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { User } from '@angular/fire/auth';
import { MatIconModule } from '@angular/material/icon';
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
      @if(showToggleButton()){
      <button mat-icon-button (click)="toggleSidenav()">
        <mat-icon>menu</mat-icon>
      </button>
      }
      <span>Inventory managment</span>
      <span class="spacer"></span>
      @if (currentUser()) {
      <span class="username">{{ currentUser()!.email }}</span>
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
  currentUser = input.required<User | null>();
  showToggleButton = input.required<boolean>();
  onSignOut = output<void>();
  onToggleSidenav = output<void>();
  signOut() {
    this.onSignOut.emit();
  }
  toggleSidenav() {
    this.onToggleSidenav.emit();
  }
}
