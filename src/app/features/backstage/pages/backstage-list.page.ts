import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxParticleHeader } from '@tmdjr/ngx-shared-headers';
import { BackstageFiltersComponent } from '../components/backstage-filters.component';
import { BackstageResultsComponent } from '../components/backstage-results.component';
import { BackstageListViewModel } from './backstage-list.view-model';

@Component({
  selector: 'ngx-backstage-list-page',
  providers: [BackstageListViewModel],
  imports: [
    MatButtonModule,
    MatSnackBarModule,
    BackstageFiltersComponent,
    BackstageResultsComponent,
    NgxParticleHeader,
    MatIconModule,
  ],
  template: `
    <ngx-particle-header>
      <h1 class="backstage-list__header">Backstage</h1>
    </ngx-particle-header>
    <div class="backstage-list__action-bar">
      <div class="backstage-list__flex-spacer"></div>
      <button
        matButton="filled"
        [disabled]="vm.syncState().loading"
        (click)="vm.syncAll()"
      >
        <mat-icon>sync</mat-icon>
        Sync all
      </button>
    </div>

    <main class="backstage-list__page-content">
      <div class="backstage-list__container">
        <ngx-backstage-filters
          [searchTerm]="vm.search()"
          [includeDocs]="vm.includeDocs()"
          (queryChange)="vm.setQuery($event)"
          (includeDocsChange)="vm.setIncludeDocs($event)"
        ></ngx-backstage-filters>
        <ngx-backstage-results
          [state]="vm.listState()"
          (view)="vm.view($event)"
          (refresh)="vm.refresh($event)"
          (refreshList)="vm.refreshList()"
        ></ngx-backstage-results>
      </div>
    </main>
  `,
  styles: [
    `
      :host {
        .backstage-list__header {
          font-size: 1.85rem;
          font-weight: 100;
          margin: 1.7rem 1rem;
        }
        .backstage-list__page-content {
          display: flex;
          justify-content: center;
        }
        .backstage-list__container {
          padding: 1rem;
          flex: 0 1 clamp(480px, 70vw, 1400px);
          max-width: 100%;
        }
        .backstage-list__flex-spacer {
          flex: 1;
        }
        .backstage-list__action-bar {
          position: sticky;
          top: 56px;
          height: 56px;
          z-index: 5;
          display: flex;
          flex-direction: row;
          width: 100%;
          background: var(--mat-sys-primary);
          align-items: center;
          a,
          button {
            color: var(--mat-sys-on-primary);
            background: var(--mat-sys-primary);
            margin: 0 12px;
          }
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackstageListPage {
  readonly vm = inject(BackstageListViewModel);
}
