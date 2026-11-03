import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgxButton } from '@tmdjr/ngx-workshop-design-system';
import { ListState } from '../models/backstage-state.models';
import { BackstagePanelComponent } from './backstage-panel.component';
import { ServiceCardComponent } from './service-card.component';
@Component({
  selector: 'ngx-backstage-results', imports: [NgxButton, MatButtonModule, MatIconModule, MatProgressBarModule, BackstagePanelComponent, ServiceCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="backstage-results" [class.backstage-results--issues]="issues().length">
      @if (issues().length) {
        <div class="backstage-results__switch" role="group" aria-label="Repository result panels">
          <button mat-flat-button ngxButton surface="glass" type="button" [attr.aria-pressed]="pane() === 'repos'" (click)="pane.set('repos')">Catalogue ({{ repos().length }})</button>
          <button mat-flat-button ngxButton surface="glass" type="button" [attr.aria-pressed]="pane() === 'issues'" (click)="pane.set('issues')">Sync issues ({{ issues().length }})</button>
        </div>
      }
      <ngx-backstage-panel heading="Repositories" eyebrow="BACKSTAGE / CATALOGUE" background="grid"
        [class.backstage-results__panel--hidden]="issues().length && pane() !== 'repos'" [resetKey]="state().items">
        <span backstagePanelHeader class="backstage-results__count">{{ repos().length }} repositories</span>
        <button backstagePanelHeader mat-icon-button type="button" aria-label="Refresh repository list" [disabled]="state().loading" (click)="onRefreshList()"><mat-icon>refresh</mat-icon></button>
        @if (state().loading) { <mat-progress-bar mode="indeterminate" aria-label="Loading repositories" /> }
        @if (state().error) {
          <div class="backstage-results__error" role="alert"><p>{{ state().error }}</p><button mat-flat-button ngxButton surface="outline" (click)="onRefreshList()">Retry</button></div>
        }
        <div role="list">
          @for (svc of repos(); track svc.repoName) {
            <ngx-backstage-service-card role="listitem" [serviceSummaryDto]="svc" (view)="onView($event)" (refresh)="onRefresh($event)" />
          } @empty {
            @if (!state().loading) {
              <div class="backstage-results__empty" [attr.data-testid]="state().unauthorized ? 'unauthorized' : 'empty'">
                <mat-icon>{{ state().unauthorized ? 'lock' : 'search_off' }}</mat-icon>
                <h2>{{ state().unauthorized ? 'Unauthorized' : state().error ? 'Unable to load services' : issues().length ? 'Repositories needing attention are in Sync issues' : 'No services found' }}</h2>
                <p>{{ state().unauthorized ? 'Check your access or sign in to view backstage services.' : 'Adjust your search or inspect sync issues.' }}</p>
              </div>
            }
          }
        </div>
      </ngx-backstage-panel>
      @if (issues().length) {
        <ngx-backstage-panel heading="Sync issues" eyebrow="BACKSTAGE / REPAIR" shape="beveled" tone="secondary"
          [class.backstage-results__panel--hidden]="pane() !== 'issues'" [resetKey]="state().items">
          <span backstagePanelHeader class="backstage-results__count">{{ issues().length }} issues</span>
          <div role="list">
            @for (svc of issues(); track svc.repoName) {
              <ngx-backstage-service-card role="listitem" [serviceSummaryDto]="svc" (view)="onView($event)" (refresh)="onRefresh($event)" />
            }
          </div>
        </ngx-backstage-panel>
      }
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 0; min-width: 0; height: 100%; }
    .backstage-results { display: grid; grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr); min-height: 0; height: 100%; }
    .backstage-results--issues { grid-template-columns: minmax(0, 2fr) minmax(260px, 1fr); gap: 1rem; }
    .backstage-results__switch { display: none; }
    .backstage-results__error { color: var(--ngx-color-error); font-size: 0.8rem; }
    .backstage-results__empty { padding: 1.5rem 0.5rem; text-align: center; font-size: 0.8rem; }
    .backstage-results__empty h2 { font-size: 0.9rem; }
    @media (max-width: 1100px) {
      .backstage-results--issues { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr); gap: 0.25rem; }
      .backstage-results__count { display: none; }
      .backstage-results__switch { display: flex; }
      .backstage-results__switch button[aria-pressed='true'] { background: var(--ngx-color-surface-high); }
      .backstage-results--issues > ngx-backstage-panel { grid-column: 1; grid-row: 2; }
      .backstage-results__panel--hidden { display: none; }
    }
  `],
})
export class BackstageResultsComponent {
  readonly state = input.required<ListState>(); readonly view = output<string>(); readonly refresh = output<string>(); readonly refreshList = output<void>();
  readonly pane = signal<'repos' | 'issues'>('repos');
  readonly issues = computed(() => this.state().items.filter(item => ['failed', 'partial', 'rate_limited'].includes(item.syncStatus)));
  readonly repos = computed(() => this.state().items.filter(item => !['failed', 'partial', 'rate_limited'].includes(item.syncStatus)));
  readonly hasItems = computed(() => this.state().items.length > 0);
  onView(repo: string) { this.view.emit(repo); } onRefresh(repo: string) { this.refresh.emit(repo); } onRefreshList() { this.refreshList.emit(); }
}
