import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ServiceSummaryDto } from '@tmdjr/backstage-contracts';

@Component({
  selector: 'ngx-backstage-status-badge',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  template: `
    <div
      class="status-badge__status"
      [class.status-badge--ok]="status() === 'ok'"
      [class.status-badge--failed]="status() === 'failed'"
      [class.status-badge--partial]="status() === 'partial'"
      [class.status-badge--rate-limited]="status() === 'rate_limited'"
      [class.status-badge--idle]="status() === 'idle'"
      [matTooltip]="statusTooltip(status())"
    >
      <mat-icon inline class="status-badge__status-icon">
        {{ statusIcon(status()) }}
      </mat-icon>
      {{ status() }}
    </div>
  `,
  styles: [
    `
      .status-badge__status {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.25rem 0.5rem;
        border-radius: 999px;
        text-transform: uppercase;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.02em;
      }
      .status-badge__status.status-badge--ok {
        background: #e8f5e9;
        color: #1b5e20;
      }
      .status-badge__status.status-badge--failed {
        background: #ffebee;
        color: #b71c1c;
      }
      .status-badge__status.status-badge--partial {
        background: #fff8e1;
        color: #ff6f00;
      }
      .status-badge__status.status-badge--rate-limited {
        background: #e3f2fd;
        color: #0d47a1;
      }
      .status-badge__status.status-badge--idle {
        background: #eceff1;
        color: #37474f;
      }
      .status-badge__status .status-badge__status-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  readonly status = input.required<ServiceSummaryDto['syncStatus']>();

  private readonly iconByStatus: Partial<
    Record<ServiceSummaryDto['syncStatus'], string>
  > = {
    ok: 'check_circle',
    partial: 'pending',
    failed: 'error',
    rate_limited: 'schedule',
    idle: 'more_horiz',
  };

  private readonly tooltipByStatus: Partial<
    Record<ServiceSummaryDto['syncStatus'], string>
  > = {
    ok: 'Synced',
    partial: 'Partial sync',
    failed: 'Sync failed',
    rate_limited: 'Rate limited',
    idle: 'Idle',
  };

  statusIcon(status: ServiceSummaryDto['syncStatus']): string {
    return this.iconByStatus[status] ?? 'more_horiz';
  }

  statusTooltip(status: ServiceSummaryDto['syncStatus']): string {
    return this.tooltipByStatus[status] ?? 'Idle';
  }
}
