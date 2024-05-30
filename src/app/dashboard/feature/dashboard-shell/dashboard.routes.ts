import { Route } from '@angular/router';
import { ItemsComponent } from '../items/items.component';
import { AddUserFormComponent } from '../add-user-form/add-user-form.component';
import { DashboardComponent } from '../dashboard/dashboard.component';

export default [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: '',
        component: ItemsComponent,
      },
      {
        path: 'users',
        component: AddUserFormComponent,
      },
    ],
  },
] as Route[];
