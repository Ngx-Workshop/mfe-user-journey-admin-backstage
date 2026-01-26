import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {
  MatSnackBar,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { SyncResponseDto } from '@tmdjr/backstage-contracts';
import { ServiceCardComponent } from '../components/service-card.component';
import { BackstageFacadeService } from '../services/backstage-facade.service';

@Component({
  selector: 'ngx-backstage-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    ServiceCardComponent,
  ],
  template: `
    <div class="page">
      <header class="page-header">
        <div>
          <p class="eyebrow">Catalog</p>
          <h1>Backstage</h1>
        </div>
        <div class="header-actions">
          <mat-form-field appearance="outline" class="search">
            <mat-label>Search services</mat-label>
            <input
              matInput
              placeholder="Name, description, topic"
              [value]="facade.search()"
              (input)="onQueryChange($any($event.target).value)"
            />
            @if(facade.search()) {
            <button
              mat-icon-button
              matSuffix
              aria-label="Clear"
              (click)="onQueryChange('')"
            >
              <mat-icon>close</mat-icon>
            </button>
            }
          </mat-form-field>

          <mat-slide-toggle
            [checked]="facade.includeDocs()"
            (change)="onIncludeDocs($any($event.checked))"
          >
            Include docs in list
          </mat-slide-toggle>

          <button
            mat-flat-button
            color="primary"
            [disabled]="facade.syncing()"
            (click)="onSyncAll()"
          >
            <mat-icon>sync</mat-icon>
            Sync all
          </button>
        </div>
      </header>

      @if (facade.listState().loading) {
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }

      <section class="results">
        @if (facade.listState().items.length) {
        <div class="grid">
          @for (svc of facade.listState().items; track svc.repoName) {
          <ngx-backstage-service-card
            [service]="svc"
            (view)="onView($event)"
            (refresh)="onRefresh($event)"
          ></ngx-backstage-service-card>
          }
        </div>
        } @else if (!facade.listState().loading) {
        <div
          class="empty"
          *ngIf="facade.listState().unauthorized; else regularEmpty"
        >
          <mat-icon>lock</mat-icon>
          <div class="title">Unauthorized</div>
          <p>
            Check your access or sign in to view backstage services.
          </p>
        </div>
        <ng-template #regularEmpty>
          <div class="empty">
            <mat-icon>search_off</mat-icon>
            <div class="title">No services found</div>
            <p>Adjust your search or try again later.</p>
            <button
              mat-stroked-button
              color="primary"
              (click)="onRefreshList()"
            >
              <mat-icon>refresh</mat-icon>
              Retry
            </button>
          </div>
        </ng-template>
        }
      </section>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 1280px;
        margin: 0 auto;
        padding: 1.5rem;
        display: grid;
        gap: 1rem;
      }
      .page-header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
      }
      .eyebrow {
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.8rem;
      }
      h1 {
        margin: 0;
      }
      .header-actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.5rem;
      }
      .search {
        min-width: min(360px, 100vw - 2rem);
      }
      .results {
        min-height: 200px;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1rem;
      }
      .empty {
        display: grid;
        gap: 0.5rem;
        justify-items: center;
        text-align: center;
        color: var(--mat-sys-on-surface-variant);
        padding: 2rem 1rem;
        border: 1px dashed var(--mat-sys-outline-variant, #ddd);
        border-radius: 12px;
      }
      .empty mat-icon {
        font-size: 40px;
      }
      .title {
        font-weight: 700;
      }
      @media (max-width: 768px) {
        .page {
          padding: 1rem;
        }
        .page-header {
          flex-direction: column;
          align-items: flex-start;
        }
        .header-actions {
          width: 100%;
        }
        .search {
          width: 100%;
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
