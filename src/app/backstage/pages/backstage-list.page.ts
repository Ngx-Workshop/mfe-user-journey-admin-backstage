import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SyncResponseDto } from '@tmdjr/backstage-contracts';
import { NgxParticleHeader } from '@tmdjr/ngx-shared-headers';
import { BackstageFiltersComponent } from '../components/backstage-filters.component';
import { BackstageResultsComponent } from '../components/backstage-results.component';
import { BackstageFacadeService } from '../services/backstage-facade.service';

@Component({
  selector: 'ngx-backstage-list-page',
  imports: [
    MatSnackBarModule,
    BackstageFiltersComponent,
    BackstageResultsComponent,
    NgxParticleHeader,
  ],
  template: `
    <ngx-particle-header class="header">
      <p class="eyebrow">Catalog</p>
      <h1>Backstage</h1>
    </ngx-particle-header>
    <main class="page-content">
      <div class="container">
        <ngx-backstage-filters
          [searchTerm]="facade.search()"
          [includeDocs]="facade.includeDocs()"
          [syncing]="facade.syncing()"
          (queryChange)="onQueryChange($event)"
          (includeDocsChange)="onIncludeDocs($event)"
          (syncAll)="onSyncAll()"
        ></ngx-backstage-filters>
        <ngx-backstage-results
          [state]="facade.listState()"
          (view)="onView($event)"
          (refresh)="onRefresh($event)"
          (refreshList)="onRefreshList()"
        ></ngx-backstage-results>
      </div>
    </main>
  `,
  styles: [
    `
      :host {
        .header {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          h1 {
            font-size: 1.85rem;
            font-weight: 100;
            margin: 1.7rem 1rem;
          }
          .eyebrow {
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-size: 0.8rem;
          }
        }

        .page-content {
          display: flex;
          justify-content: center;
        }
        .container {
          padding: 1rem;
          flex: 0 1 clamp(480px, 70vw, 1400px);
          max-width: 100%;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackstageListPage {
  protected readonly facade = inject(BackstageFacadeService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  onQueryChange(q: string) {
    this.facade.setQuery(q ?? '');
  }

  onIncludeDocs(value: boolean) {
    this.facade.setIncludeDocs(value);
    this.facade.refreshList();
  }

  onView(repo: string) {
    console.log('Navigating to repo:', repo);
    this.router.navigate(['/backstage/backstage', repo]);
  }

  onRefresh(repo: string) {
    this.snackBar.open('Refreshing service...', undefined, {
      duration: 1500,
    });
    this.facade.refreshService(repo);
  }

  onRefreshList() {
    this.facade.refreshList();
  }

  onSyncAll() {
    this.snackBar.open('Sync started', undefined, { duration: 1500 });
    this.facade.syncAll({}).subscribe({
      next: (res: SyncResponseDto) => {
        this.snackBar.open(
          `Sync finished: ${res.succeeded}/${res.total} succeeded`,
          'Dismiss',
          { duration: 3500 }
        );
      },
      error: () => {
        this.snackBar.open('Sync failed', 'Dismiss', {
          duration: 3000,
        });
      },
    });
  }
}
