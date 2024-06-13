import { CanActivateFn, Route, Router } from '@angular/router';
import { ItemsComponent } from '../items/items.component';
import { AddUserFormComponent } from '../add-user-form/add-user-form.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { ItemDetailComponent } from '../item-detail/item-detail.component';
import { SourcesComponent } from '../sources/sources.component';
import { inject } from '@angular/core';
import { AuthService } from '../../../shared/data-access/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';

const isAdmin: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return toObservable(authService.state.user).pipe(
    map((user) => {
      if (user && user.isAdmin) {
        return true;
      }
      return router.parseUrl('/dashboard/items');
    })
  );
};

export default [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: 'items',
        component: ItemsComponent,
      },
      {
        path: 'items/:id',
        component: ItemDetailComponent,
      },
      {
        path: 'users',
        component: AddUserFormComponent,
        canActivate: [isAdmin],
      },
      {
        path: 'sources',
        component: SourcesComponent,
        canActivate: [isAdmin],
      },
      {
        path: '',
        redirectTo: 'items',
        pathMatch: 'prefix',
      },
    ],
  },
] as Route[];
