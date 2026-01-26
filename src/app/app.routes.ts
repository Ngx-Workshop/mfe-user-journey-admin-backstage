import { Route } from '@angular/router';
import { BackstageDetailPage } from './backstage/pages/backstage-detail.page';
import { BackstageListPage } from './backstage/pages/backstage-list.page';

export const Routes: Route[] = [
  { path: '', redirectTo: 'backstage', pathMatch: 'full' },
  {
    path: 'backstage',
    component: BackstageListPage,
  },
  {
    path: 'backstage/:repo',
    component: BackstageDetailPage,
  },
  { path: '**', redirectTo: 'backstage' },
];
