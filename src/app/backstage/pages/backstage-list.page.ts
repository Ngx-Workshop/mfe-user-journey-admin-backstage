import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
    MatButtonModule,
    MatSnackBarModule,
    BackstageFiltersComponent,
    BackstageResultsComponent,
    NgxParticleHeader,
    MatIconModule,
  ],
  template: `
    <ngx-particle-header>
      <h1 class="header">Backstage</h1>
    </ngx-particle-header>
    <div class="action-bar">
      <div class="flex-spacer"></div>
      <button
        matButton="filled"
        [disabled]="facade.syncing()"
        (click)="onSyncAll()"
      >
        <mat-icon>sync</mat-icon>
        Sync all
      </button>
    </div>

    <main class="page-content">
      <div class="container">
        <ngx-backstage-filters
          [searchTerm]="facade.search()"
          [includeDocs]="facade.includeDocs()"
          (queryChange)="onQueryChange($event)"
          (includeDocsChange)="onIncludeDocs($event)"
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
          font-size: 1.85rem;
          font-weight: 100;
          margin: 1.7rem 1rem;
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
        .action-bar {
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
    this.router.navigate(['/backstage/details', repo]);
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
