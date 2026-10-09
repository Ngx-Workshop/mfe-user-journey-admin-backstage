import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ListState } from '../models/backstage-state.models';
import { ServiceCardComponent } from './service-card.component';

@Component({
  selector: 'ngx-backstage-results',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    ServiceCardComponent,
  ],
  template: `
    <section class="backstage-results__results" aria-live="polite">
      @if (state().loading) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }
      @if (state().error) {
        <div class="backstage-results--error" role="alert">
          <p>{{ state().error }}</p>
          <button mat-stroked-button (click)="onRefreshList()">
            Retry
          </button>
        </div>
      }
      @if (hasItems()) {
        <div class="backstage-results__grid" role="list">
          @for (svc of state().items; track svc.repoName) {
            <ngx-backstage-service-card
              role="listitem"
              [serviceSummaryDto]="svc"
              (view)="onView($event)"
              (refresh)="onRefresh($event)"
            ></ngx-backstage-service-card>
          }
        </div>
      } @else if (!state().loading) {
        @if (state().unauthorized) {
          <div
            class="backstage-results__empty"
            data-testid="unauthorized"
          >
            <mat-icon aria-hidden="true">lock</mat-icon>
            <div class="backstage-results__title">Unauthorized</div>
            <p>
              Check your access or sign in to view backstage services.
            </p>
          </div>
        } @else {
          <div class="backstage-results__empty" data-testid="empty">
            <mat-icon aria-hidden="true">search_off</mat-icon>
            <div class="backstage-results__title">
              {{
                state().error
                  ? 'Unable to load services'
                  : 'No services found'
              }}
            </div>
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
        }
      }
    </section>
  `,
  styles: [
    `
      .backstage-results__results {
        background: var(--mat-sys-surface-container-low);
        padding: 1.5rem;
        border-radius: var(
          --mat-card-elevated-container-shape,
          var(--mat-sys-corner-medium)
        );
      }
      .backstage-results__grid {
        display: grid;
        grid-template-columns: repeat(
          auto-fill,
          minmax(min(100%, 375px), 1fr)
        );
        gap: 1rem;
      }
      .backstage-results__empty {
        display: grid;
        gap: 0.5rem;
        justify-items: center;
        text-align: center;
        color: var(--mat-sys-on-surface-variant);
        padding: 2rem 1rem;
        border: 1px dashed var(--mat-sys-outline-variant, #ddd);
        border-radius: 12px;
      }
      .backstage-results__empty mat-icon {
        font-size: 40px;
      }
      .backstage-results__title {
        font-weight: 700;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackstageResultsComponent {
  readonly state = input.required<ListState>();

  readonly view = output<string>();
  readonly refresh = output<string>();
  readonly refreshList = output<void>();

  readonly hasItems = computed(() => this.state().items.length > 0);

  onView(repo: string) {
    this.view.emit(repo);
  }

  onRefresh(repo: string) {
    this.refresh.emit(repo);
  }

  onRefreshList() {
    this.refreshList.emit();
  }
}
