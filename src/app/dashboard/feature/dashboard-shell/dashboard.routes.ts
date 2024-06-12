import { Route } from '@angular/router';
import { ItemsComponent } from '../items/items.component';
import { AddUserFormComponent } from '../add-user-form/add-user-form.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { ItemDetailComponent } from '../item-detail/item-detail.component';
import { SourcesComponent } from '../sources/sources.component';

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
      },
      {
        path: 'sources',
        component: SourcesComponent,
      },
      {
        path: '',
        redirectTo: 'items',
        pathMatch: 'prefix',
      },
    ],
  },
] as Route[];
