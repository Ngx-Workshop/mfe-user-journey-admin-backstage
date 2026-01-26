import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  MatSnackBar,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import {
  MatTabsModule,
  type MatTabChangeEvent,
} from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { DocViewerComponent } from '../components/doc-viewer.component';
import { MarkdownViewerComponent } from '../components/markdown-viewer.component';
import {
  BackstageFacadeService,
  type DocKind,
} from '../services/backstage-facade.service';

@Component({
  selector: 'ngx-backstage-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTooltipModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MarkdownViewerComponent,
    DocViewerComponent,
  ],
  template: `
    <div class="page">
      <button mat-button color="primary" (click)="goBack()">
        <mat-icon>arrow_back</mat-icon>
        Back to backstage
      </button>

      @if (facade.detailState().loading) {
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      } @if (facade.detailState().error &&
      !facade.detailState().loading) {
      <div
        class="empty"
        [class.error]="facade.detailState().unauthorized"
      >
        <mat-icon>{{
          facade.detailState().unauthorized ? 'lock' : 'error'
        }}</mat-icon>
        <div class="title">{{ facade.detailState().error }}</div>
        <p>Try refreshing or check your permissions.</p>
        <button
          mat-stroked-button
          color="primary"
          (click)="reload(true)"
        >
          <mat-icon>refresh</mat-icon>
          Retry
        </button>
      </div>
      } @if (facade.detailState().service) {
      <header class="hero">
        <div class="hero-text">
          <div class="eyebrow">Backstage Service</div>
          <div class="title-row">
            <h1>{{ facade.detailState().service?.repoName }}</h1>
            <span
              class="status"
              [ngClass]="facade.detailState().service?.syncStatus"
              [matTooltip]="
                statusTooltip(
                  facade.detailState().service?.syncStatus
                )
              "
            >
              <mat-icon class="status-icon" inline>{{
                statusIcon(facade.detailState().service?.syncStatus)
              }}</mat-icon>
              {{ facade.detailState().service?.syncStatus }}
            </span>
          </div>
          @if (facade.detailState().service?.description) {
          <p class="description">
            {{ facade.detailState().service?.description }}
          </p>
          }

          <div class="meta">
            <span>
              <mat-icon inline>update</mat-icon>
              {{
                facade.detailState().service?.lastSyncAt
                  ? (facade.detailState().service?.lastSyncAt
                    | date : 'short')
                  : 'Never synced'
              }}
            </span>
            @if (facade.detailState().service?.syncError) {
            <span class="error">
              <mat-icon inline>error</mat-icon>
              {{ facade.detailState().service?.syncError }}
            </span>
            }
          </div>
          <mat-chip-set
            *ngIf="facade.detailState().service?.topics?.length"
          >
            @for (topic of facade.detailState().service?.topics; track
            topic) {
            <mat-chip appearance="outlined">{{ topic }}</mat-chip>
            }
          </mat-chip-set>
        </div>
        <div class="hero-actions">
          <button
            mat-stroked-button
            color="primary"
            (click)="openRepo()"
            [disabled]="!facade.detailState().service?.htmlUrl"
            aria-label="Open repo"
          >
            <mat-icon>open_in_new</mat-icon>
            Open repo
          </button>
          <button
            mat-flat-button
            color="accent"
            (click)="reload(true)"
          >
            <mat-icon>refresh</mat-icon>
            Refresh
          </button>
        </div>
      </header>

      <mat-tab-group (selectedTabChange)="onTabChange($event)">
        <mat-tab label="README">
          <section class="tab-pane">
            <ngx-backstage-markdown-viewer
              title="README"
              [doc]="facade.docStates().readme.data"
              [loading]="facade.docStates().readme.loading"
              [error]="facade.docStates().readme.error"
              [unauthorized]="facade.docStates().readme.unauthorized"
              (reload)="reloadDoc('readme', true)"
            ></ngx-backstage-markdown-viewer>
          </section>
        </mat-tab>
        <mat-tab label="OpenAPI">
          <section class="tab-pane">
            <ngx-backstage-doc-viewer
              title="OpenAPI"
              [doc]="facade.docStates().openapi.data"
              [loading]="facade.docStates().openapi.loading"
              [error]="facade.docStates().openapi.error"
              [unauthorized]="facade.docStates().openapi.unauthorized"
              (reload)="reloadDoc('openapi', true)"
            ></ngx-backstage-doc-viewer>
          </section>
        </mat-tab>
        <mat-tab
          label="Runbook"
          [disabled]="
            !hasDoc('runbook') && !facade.docStates().runbook.loading
          "
        >
          <section class="tab-pane">
            <ngx-backstage-markdown-viewer
              title="Runbook"
              [doc]="facade.docStates().runbook.data"
              [loading]="facade.docStates().runbook.loading"
              [error]="facade.docStates().runbook.error"
              [unauthorized]="facade.docStates().runbook.unauthorized"
              (reload)="reloadDoc('runbook', true)"
              emptyLabel="Runbook not provided"
            ></ngx-backstage-markdown-viewer>
          </section>
        </mat-tab>
        <mat-tab
          label="Metadata"
          [disabled]="
            !hasDoc('metadata') &&
            !facade.docStates().metadata.loading
          "
        >
          <section class="tab-pane">
            <ngx-backstage-doc-viewer
              title="Metadata"
              [doc]="facade.docStates().metadata.data"
              [loading]="facade.docStates().metadata.loading"
              [error]="facade.docStates().metadata.error"
              [unauthorized]="
                facade.docStates().metadata.unauthorized
              "
              (reload)="reloadDoc('metadata', true)"
              emptyLabel="Metadata not provided"
            ></ngx-backstage-doc-viewer>
          </section>
        </mat-tab>
      </mat-tab-group>
      }
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1.25rem;
        display: grid;
        gap: 1rem;
      }
      .hero {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
        align-items: flex-start;
      }
      .hero-text {
        display: grid;
        gap: 0.35rem;
        min-width: 0;
      }
      .title-row {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        flex-wrap: wrap;
      }
      h1 {
        margin: 0;
      }
      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 1px;
        font-size: 0.8rem;
        color: var(--mat-sys-on-surface-variant);
      }
      .description {
        margin: 0;
        color: var(--mat-sys-on-surface-variant);
      }
      .status {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.25rem 0.6rem;
        border-radius: 999px;
        text-transform: uppercase;
        font-size: 0.8rem;
        font-weight: 700;
      }
      .status .status-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
      .status.ok {
        background: #e8f5e9;
        color: #1b5e20;
      }
      .status.failed {
        background: #ffebee;
        color: #b71c1c;
      }
      .status.partial {
        background: #fff8e1;
        color: #ff6f00;
      }
      .status.rate_limited {
        background: #e3f2fd;
        color: #0d47a1;
      }
      .status.idle {
        background: #eceff1;
        color: #37474f;
      }
      .meta {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
        color: var(--mat-sys-on-surface-variant);
      }
      .meta .error {
        color: #b71c1c;
      }
      .hero-actions {
        display: grid;
        gap: 0.5rem;
        align-items: center;
      }
      .tab-pane {
        padding: 1rem 0.25rem;
      }
      .empty {
        display: grid;
        gap: 0.5rem;
        justify-items: center;
        text-align: center;
        padding: 2rem 1rem;
        border-radius: 12px;
        border: 1px dashed var(--mat-sys-outline-variant, #ddd);
        color: var(--mat-sys-on-surface-variant);
      }
      .empty.error {
        color: #b71c1c;
      }
      .empty mat-icon {
        font-size: 42px;
      }
      @media (max-width: 768px) {
        .page {
          padding: 1rem;
        }
        .hero {
          flex-direction: column;
        }
        .hero-actions {
          width: 100%;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackstageDetailPage {
  protected readonly facade = inject(BackstageFacadeService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  private repo: string | null = null;
  private readonly tabOrder: DocKind[] = [
    'readme',
    'openapi',
    'runbook',
    'metadata',
  ];

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const repo = params.get('repo');
      if (repo) {
        this.repo = repo;
        this.facade.loadDetail(repo);
        this.ensureDoc('readme');
      }
    });
  }

  goBack() {
    this.router.navigate(['/backstage']);
  }

  reload(refresh = false) {
    if (!this.repo) return;
    this.snackBar.open('Refreshing service', undefined, {
      duration: 1500,
    });
    this.facade.loadDetail(this.repo, { refresh });
  }

  openRepo() {
    const url = this.facade.detailState().service?.htmlUrl;
    if (url) window.open(url, '_blank');
  }

  onTabChange(event: MatTabChangeEvent) {
    const kind = this.tabOrder[event.index];
    this.ensureDoc(kind);
  }

  reloadDoc(kind: DocKind, refresh = false) {
    this.facade.fetchDoc(kind, {
      repo: this.repo ?? undefined,
      refresh,
    });
  }

  ensureDoc(kind: DocKind) {
    const doc = this.facade.docStates()[kind];
    if (!doc?.data && !doc?.loading) {
      this.reloadDoc(kind);
    }
  }

  hasDoc(kind: DocKind) {
    return Boolean(this.facade.docStates()[kind]?.data?.content);
  }

  statusIcon(status?: string | null) {
    switch (status) {
      case 'ok':
        return 'check_circle';
      case 'partial':
        return 'pending';
      case 'failed':
        return 'error';
      case 'rate_limited':
        return 'schedule';
      default:
        return 'more_horiz';
    }
  }

  statusTooltip(status?: string | null) {
    switch (status) {
      case 'ok':
        return 'Synced';
      case 'partial':
        return 'Partial sync';
      case 'failed':
        return 'Sync failed';
      case 'rate_limited':
        return 'Rate limited';
      default:
        return 'Idle';
    }
  }
}
