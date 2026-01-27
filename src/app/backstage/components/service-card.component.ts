import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ServiceSummaryDto } from '@tmdjr/backstage-contracts';

@Component({
  selector: 'ngx-backstage-service-card',
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  template: `
    <mat-card class="service-card">
      <mat-card-header>
        <div class="title-row">
          <div class="titles">
            <div class="name">{{ service().repoName }}</div>
            @if (service().description) {
            <div class="desc">{{ service().description }}</div>
            }
          </div>
          <span
            class="status"
            [class.ok]="service().syncStatus === 'ok'"
            [class.failed]="service().syncStatus === 'failed'"
            [class.partial]="service().syncStatus === 'partial'"
            [class.rate_limited]="
              service().syncStatus === 'rate_limited'
            "
            [class.idle]="service().syncStatus === 'idle'"
            [matTooltip]="statusTooltip(service().syncStatus)"
          >
            <mat-icon inline class="status-icon">
              {{ statusIcon(service().syncStatus) }}
            </mat-icon>
            {{ service().syncStatus }}
          </span>
        </div>
      </mat-card-header>

      <mat-card-content>
        <div
          class="chips"
          *ngIf="service().topics.length; else noTopics"
        >
          <mat-chip-set>
            @for (topic of service().topics; track topic) {
            <mat-chip appearance="outlined">{{ topic }}</mat-chip>
            }
          </mat-chip-set>
        </div>
        <ng-template #noTopics>
          <div class="muted">No topics</div>
        </ng-template>

        <div class="meta">
          <div class="meta-row">
            <mat-icon inline>update</mat-icon>
            <span>
              Last sync:
              {{
                service().lastSyncAt
                  ? (service().lastSyncAt | date : 'short')
                  : 'Never'
              }}
            </span>
          </div>
          @if (service().syncError) {
          <div class="meta-row error">
            <mat-icon inline>error</mat-icon>
            <span>{{ service().syncError }}</span>
          </div>
          }
        </div>
      </mat-card-content>

      <mat-card-actions align="end">
        <button
          mat-stroked-button
          color="primary"
          (click)="onView()"
          aria-label="View details"
        >
          <mat-icon>open_in_new</mat-icon>
          View
        </button>
        <button
          mat-flat-button
          color="accent"
          (click)="onRefresh()"
          aria-label="Refresh"
        >
          <mat-icon>refresh</mat-icon>
          Refresh
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [
    `
      .service-card {
        display: grid;
        gap: 0.5rem;
      }
      .title-row {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 0.75rem;
      }
      .titles {
        display: grid;
        gap: 0.25rem;
        min-width: 0;
      }
      .name {
        font-weight: 700;
        font-size: 1.05rem;
        word-break: break-word;
      }
      .desc {
        color: var(--mat-sys-on-surface-variant);
      }
      .status {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.25rem 0.5rem;
        border-radius: 999px;
        text-transform: uppercase;
        font-size: 0.75rem;
        font-weight: 700;
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
      .status .status-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
      .chips {
        margin-bottom: 0.5rem;
      }
      .muted {
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.85rem;
      }
      .meta {
        display: grid;
        gap: 0.25rem;
        font-size: 0.9rem;
      }
      .meta-row {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        color: var(--mat-sys-on-surface-variant);
      }
      .meta-row.error {
        color: #b71c1c;
      }
      mat-card-actions {
        padding: 0 1rem 1rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceCardComponent {
  readonly service = input.required<ServiceSummaryDto>();
  readonly view = output<string>();
  readonly refresh = output<string>();

  statusIcon(status: ServiceSummaryDto['syncStatus']): string {
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

  statusTooltip(status: ServiceSummaryDto['syncStatus']): string {
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

  onView() {
    this.view.emit(this.service().repoName);
  }

  onRefresh() {
    this.refresh.emit(this.service().repoName);
  }
}
