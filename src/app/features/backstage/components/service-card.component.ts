import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ServiceSummaryDto } from '@tmdjr/backstage-contracts';
import { StatusBadgeComponent } from './status-badge.component';
@Component({
  selector: 'ngx-backstage-service-card', imports: [CommonModule, MatButtonModule, MatIconModule, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (viewModel(); as vm) {
      <article class="service-card">
        <button class="service-card__open" type="button" [attr.aria-label]="'View details ' + vm.repoName" (click)="onView()">
          <strong [title]="vm.repoName">{{ vm.repoName }}</strong>
          <span class="service-card__description" [title]="vm.description || 'No description provided'">{{ vm.description || 'No description provided' }}</span>
          <span class="service-card__meta">{{ vm.lastSyncAt ? (vm.lastSyncAt | date: 'short') : 'Never synced' }} · {{ vm.topics.join(' · ') || 'No topics' }}</span>
          @if (vm.syncStatus !== 'ok' && vm.syncError) { <span class="service-card__error" [title]="vm.syncError">{{ vm.syncError }}</span> }
          <span class="service-card__languages">@for (lang of vm.deviconLanguages; track lang) { <i [class]="lang" aria-hidden="true"></i> }</span>
        </button>
        <ngx-backstage-status-badge [status]="vm.syncStatus" />
        <button mat-icon-button type="button" [attr.aria-label]="'Refresh ' + vm.repoName" title="Refresh repository" (click)="onRefresh()"><mat-icon>refresh</mat-icon></button>
      </article>
    }
  `,
  styles: [`
    @use '@angular/material' as mat;
    :host { display: block; min-width: 0; @include mat.icon-button-density(-3); }
    .service-card { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; align-items: center; gap: 0.5rem; padding: 4px 8px; border-bottom: 1px solid var(--ngx-color-border); background: var(--ngx-color-surface-low); }
    .service-card__open { display: grid; gap: 2px; min-width: 0; width: 100%; border: 0; background: transparent; color: var(--ngx-color-text); text-align: left; cursor: pointer; padding: 4px 0; }
    .service-card__open strong { font: 600 0.75rem/1.5 var(--ngx-font-mono); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .service-card__open span { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
    .service-card__open:focus-visible { outline: 2px solid var(--ngx-color-primary); }
    .service-card__description { font-size: 0.75rem; }
    .service-card__meta, .service-card__languages { color: var(--ngx-color-muted); font-size: 0.65rem; }
    .service-card__languages:empty { display: none; }
    .service-card__languages i { margin-right: 4px; }
    .service-card__error { color: var(--ngx-color-error); font-size: 0.7rem; }
    .service-card:hover { background: var(--ngx-color-surface-high); }
  `],
})
export class ServiceCardComponent {
  readonly view = output<string>(); readonly refresh = output<string>();
  readonly serviceSummaryDto = input.required<ServiceSummaryDto>();
  protected readonly viewModel = computed(() => ({ ...this.serviceSummaryDto(),
    topics: this.serviceSummaryDto().topics ?? [],
    deviconLanguages: this.serviceSummaryDto().deviconLanguages?.slice().sort((a, b) => a.localeCompare(b)) ?? [],
  }));
  onView() { this.view.emit(this.serviceSummaryDto().repoName); }
  onRefresh() { this.refresh.emit(this.serviceSummaryDto().repoName); }
}
