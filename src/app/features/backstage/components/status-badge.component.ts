import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgxInlineStatus, NgxInlineStatusTone } from '@tmdjr/ngx-workshop-design-system';
import { ServiceSummaryDto } from '@tmdjr/backstage-contracts';
@Component({
  selector: 'ngx-backstage-status-badge', imports: [NgxInlineStatus], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ngx-inline-status [label]="labels[status()] ?? status()" [tone]="tones[status()] ?? 'neutral'" />`,
})
export class StatusBadgeComponent {
  readonly status = input.required<ServiceSummaryDto['syncStatus']>();
  readonly labels: Partial<Record<ServiceSummaryDto['syncStatus'], string>> = { ok: 'Synced', partial: 'Partial', failed: 'Failed', rate_limited: 'Rate limited', idle: 'Idle' };
  readonly tones: Partial<Record<ServiceSummaryDto['syncStatus'], NgxInlineStatusTone>> = { ok: 'success', partial: 'warning', failed: 'error', rate_limited: 'warning', idle: 'neutral' };
}
