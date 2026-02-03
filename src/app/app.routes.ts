import { Route } from '@angular/router';
import { BackstageDetailPage } from './backstage/pages/backstage-detail.page';
import { BackstageListPage } from './backstage/pages/backstage-list.page';

export const Routes: Route[] = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  {
    path: 'list',
    component: BackstageListPage,
  },
  {
    path: 'details/:repo',
    component: BackstageDetailPage,
  },
  { path: '**', redirectTo: 'list' },
];
