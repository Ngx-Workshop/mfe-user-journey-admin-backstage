import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxParticleHeader } from '@tmdjr/ngx-shared-headers';
import { BackstageDetailErrorComponent } from '../components/backstage-detail-error.component';
import { BackstageDetailTabsComponent } from '../components/backstage-detail-tabs.component';
import { StatusBadgeComponent } from '../components/status-badge.component';
import { BackstageDetailViewModel } from './backstage-detail.view-model';

@Component({
  selector: 'ngx-backstage-detail-page',
  providers: [BackstageDetailViewModel],
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
    <ngx-particle-header class="backstage-detail__header">
      <h1>{{ vm.detailState().service?.description }}</h1>
      <ngx-backstage-status-badge
        [status]="vm.detailState().service?.syncStatus ?? 'failed'"
      ></ngx-backstage-status-badge>
    </ngx-particle-header>

    <div class="backstage-detail__action-bar">
      <a matButton="filled" (click)="vm.goBack()">
        <mat-icon>arrow_back</mat-icon>Back to backstage</a
      >

      <button
        matButton="filled"
        (click)="vm.openRepo()"
        [disabled]="!vm.detailState().service?.htmlUrl"
      >
        <mat-icon>open_in_new</mat-icon>
        Open repo
      </button>

      <div class="backstage-detail__flex-spacer"></div>
      <button matButton="filled" (click)="vm.reload(true)">
        <mat-icon>refresh</mat-icon>
        Refresh
        <span>
          {{
            vm.detailState().service?.lastSyncAt
              ? (vm.detailState().service?.lastSyncAt | date: 'short')
              : 'Never synced'
          }}
        </span>

        @if (
          vm.detailState().service?.syncStatus !== 'ok' &&
          vm.detailState().service?.syncError
        ) {
          <span class="backstage-detail--error">
            <mat-icon inline>error</mat-icon>
            {{ vm.detailState().service?.syncError }}
          </span>
        }
      </button>
    </div>

    @if (vm.detailState().loading) {
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    }
    @if (vm.detailState().error && !vm.detailState().loading) {
      <ngx-backstage-detail-error
        [message]="vm.detailState().error"
        [unauthorized]="vm.detailState().unauthorized ?? false"
        (retry)="vm.reload(true)"
      ></ngx-backstage-detail-error>
    }
    @if (vm.detailState().service) {
      <ngx-backstage-detail-tabs
        [docStates]="vm.docStates()"
        (tabChange)="vm.onTabChange($event)"
        (reloadDoc)="vm.reloadDoc($event.kind, $event.refresh)"
      ></ngx-backstage-detail-tabs>
    }
  `,
  styles: [
    `
      .backstage-detail__header h1 {
        font-size: 1.85rem;
        font-weight: 100;
        margin: 1.7rem 1rem;
      }
      .backstage-detail__flex-spacer {
        flex: 1;
      }
      .backstage-detail__action-bar {
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
  readonly vm = inject(BackstageDetailViewModel);
}
