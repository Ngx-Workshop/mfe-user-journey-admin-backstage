import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { ServiceSummaryDto } from '@tmdjr/backstage-contracts';
import { StatusBadgeComponent } from './status-badge.component';

@Component({
  selector: 'ngx-backstage-service-card',
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    StatusBadgeComponent,
  ],
  template: `
    <mat-card class="service-card">
      <mat-card-header>
        <div class="title-row">
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
            @if (service().syncStatus !== 'ok' && service().syncError)
            {
            <div class="meta-row error">
              <mat-icon inline>error</mat-icon>
              <span>{{ service().syncError }}</span>
            </div>
            }

            <div class="meta-row">
              @for(lang of service().languages | keyvalue; track lang)
              {
              <i
                [class]="'devicon-' + lang.key + '-plain colored'"
              ></i>
              }
            </div>
          </div>

          <div class="repo-desc">
            {{ service().description ?? 'MISSING DESCRIPTION' }}
          </div>
          <div class="repo-name">
            <pre><code>{{ service().repoName }}</code></pre>
          </div>
        </div>
        <div class="flex-spacer"></div>
        <ngx-backstage-status-badge
          [status]="service().syncStatus"
        ></ngx-backstage-status-badge>
      </mat-card-header>

      <mat-card-content>
        @if(service().topics.length > 0) {
        <div class="chips">
          <mat-chip-set>
            @for (topic of service().topics; track topic) {
            <mat-chip appearance="outlined">
              <i [class]="'angular'"></i>
              {{ topic }}</mat-chip
            >
            }
          </mat-chip-set>
        </div>
        } @else {
        <mat-chip class="muted" appearance="outlined"
          >No topics</mat-chip
        >

        }
      </mat-card-content>

      <mat-card-actions align="end">
        <button
          mat-button
          (click)="onView()"
          aria-label="View details"
        >
          <mat-icon>open_in_new</mat-icon>
          View
        </button>
        <button mat-button (click)="onRefresh()" aria-label="Refresh">
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
        height: 100%;
        background-color: var(--mat-sys-surface-container-high);
        transition: all 0.2s ease;
      }
      .repo-name {
        padding: 0.6rem 0;
        code {
          font-size: 0.8rem;
          padding: 0.7rem;
          border-radius: var(
            --mat-card-elevated-container-shape,
            var(--mat-sys-corner-medium)
          );
          background-color: var(--mat-sys-surface-container-highest);
        }
      }

      .repo-desc {
        font-weight: 100;
        font-size: 2rem;
        word-break: break-word;
        padding: 0.5em 0 0;
      }
      .chips {
        margin-bottom: 0.5rem;
      }
      .muted {
        color: red;
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

  protected readonly viewModel = computed(() => ({
    lastSyncAt: this.service().lastSyncAt,
    syncError: this.service().syncError,
    languages: this.service().languages,
    description: this.service().description,
    repoName: this.service().repoName,
    topics: this.service().topics,
  }));

  onView() {
    this.view.emit(this.service().repoName);
  }

  onRefresh() {
    this.refresh.emit(this.service().repoName);
  }
}
