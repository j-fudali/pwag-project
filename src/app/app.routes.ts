import { Routes } from '@angular/router';
import { LoginFormComponent } from './login/feature/login-form/login-form.component';
import {
  AuthGuard,
  redirectLoggedInTo,
  redirectUnauthorizedTo,
} from '@angular/fire/auth-guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['/login']);
const redirectAuthorizedToDashboard = () => redirectLoggedInTo(['/dashboard']);
export const routes: Routes = [
  {
    path: 'login',
    component: LoginFormComponent,
    canActivate: [AuthGuard],
    data: {
      authGuardPipe: redirectAuthorizedToDashboard,
    },
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/feature/dashboard/dashboard.component').then(
        (c) => c.DashboardComponent
      ),
    canActivate: [AuthGuard],
    data: {
      authGuardPipe: redirectUnauthorizedToLogin,
    },
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
];
