import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  MatSnackBar,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxParticleHeader } from '@tmdjr/ngx-shared-headers';
import { BackstageDetailErrorComponent } from '../components/backstage-detail-error.component';
import { BackstageDetailTabsComponent } from '../components/backstage-detail-tabs.component';
import { StatusBadgeComponent } from '../components/status-badge.component';
import {
  BackstageFacadeService,
  type DocKind,
} from '../services/backstage-facade.service';

@Component({
  selector: 'ngx-backstage-detail-page',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressBarModule,
    BackstageDetailTabsComponent,
    BackstageDetailErrorComponent,
    NgxParticleHeader,
    StatusBadgeComponent,
  ],
  template: `
    <ngx-particle-header class="header">
      <h1>
        {{
          detailState().service?.repoName?.replace('-', ' ')
            | titlecase
        }}
      </h1>
      <ngx-backstage-status-badge
        [status]="detailState().service!.syncStatus"
      ></ngx-backstage-status-badge>
    </ngx-particle-header>

    <div class="action-bar">
      <a matButton="filled" (click)="goBack()">
        <mat-icon>arrow_back</mat-icon>Back to backstage</a
      >

      <button
        matButton="filled"
        (click)="openRepo()"
        [disabled]="!detailState().service?.htmlUrl"
      >
        <mat-icon>open_in_new</mat-icon>
        Open repo
      </button>

      <div class="flex-spacer"></div>
      <button matButton="filled" (click)="reload(true)">
        <mat-icon>refresh</mat-icon>
        Refresh
        <span>
          {{
            detailState().service?.lastSyncAt
              ? (detailState().service?.lastSyncAt | date : 'short')
              : 'Never synced'
          }}
        </span>
        @if (detailState().service?.syncError) {
        <span class="error">
          <mat-icon inline>error</mat-icon>
          {{ detailState().service?.syncError }}
        </span>
        }
      </button>
    </div>

    @if (detailState().loading) {
    <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    } @if (detailState().error && !detailState().loading) {
    <ngx-backstage-detail-error
      [message]="detailState().error"
      [unauthorized]="detailState().unauthorized ?? false"
      (retry)="reload(true)"
    ></ngx-backstage-detail-error>
    } @if (detailState().service) {
    <ngx-backstage-detail-tabs
      [docStates]="docStates()"
      (tabChange)="onTabChange($event)"
      (reloadDoc)="reloadDoc($event.kind, $event.refresh)"
    ></ngx-backstage-detail-tabs>
    }
  `,
  styles: [
    `
      .header h1 {
        font-size: 1.85rem;
        font-weight: 100;
        margin: 1.7rem 1rem;
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackstageDetailPage {
  protected readonly facade = inject(BackstageFacadeService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  private readonly repo = signal<string | null>(null);
  private readonly tabOrder: DocKind[] = [
    'readme',
    'openapi',
    'runbook',
    'metadata',
  ];

  readonly detailState = computed(() => this.facade.detailState());
  readonly docStates = computed(() => this.facade.docStates());

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const repo = params.get('repo');
      if (repo) {
        this.repo.set(repo);
        this.facade.loadDetail(repo);
        this.ensureDoc('readme');
      }
    });
  }

  goBack() {
    this.router.navigate(['/backstage']);
  }

  reload(refresh = false) {
    if (!this.repo()) return;
    this.snackBar.open('Refreshing service', undefined, {
      duration: 1500,
    });
    this.facade.loadDetail(this.repo() as string, { refresh });
  }

  openRepo() {
    const url = this.detailState().service?.htmlUrl;
    if (url) window.open(url, '_blank');
  }

  onTabChange(kind: DocKind) {
    this.ensureDoc(kind);
  }

  reloadDoc(kind: DocKind, refresh = false) {
    this.facade.fetchDoc(kind, {
      repo: this.repo() ?? undefined,
      refresh,
    });
  }

  ensureDoc(kind: DocKind) {
    const doc = this.docStates()[kind];
    if (!doc?.data && !doc?.loading) {
      this.reloadDoc(kind);
    }
  }
}
