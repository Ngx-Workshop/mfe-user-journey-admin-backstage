import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxActionBar, NgxButton, NgxInlineStatus } from '@tmdjr/ngx-workshop-design-system';
import { BackstageFiltersComponent } from '../components/backstage-filters.component';
import { BackstageResultsComponent } from '../components/backstage-results.component';
import { BackstagePanelComponent } from '../components/backstage-panel.component';
import { observeWorkspaceHeight } from '../utils/panel-body-viewport';
import { BackstageListViewModel } from './backstage-list.view-model';
@Component({
  selector: 'ngx-backstage-list-page', host: { class: 'ngx-design-system' }, providers: [BackstageListViewModel],
  imports: [MatButtonModule, MatIconModule, MatSnackBarModule, NgxActionBar, NgxButton, NgxInlineStatus, BackstageFiltersComponent, BackstageResultsComponent, BackstagePanelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ngx-action-bar heading="Backstage">
      <ngx-inline-status ngxActionBarIndicators [label]="vm.syncState().loading ? 'Syncing repositories…' : vm.listState().items.length + ' repositories'" [tone]="vm.syncState().loading ? 'info' : 'neutral'" [announce]="true" />
      <button class="backstage-list__sync" mat-flat-button ngxButton surface="outline" shape="chevron" type="button" [disabled]="vm.syncState().loading" (click)="vm.syncAll()"><mat-icon>sync</mat-icon>Sync all</button>
    </ngx-action-bar>
    <main class="backstage-list" aria-label="Repository catalogue">
      <div #workspace class="backstage-list__workspace" [style.height.px]="workspaceHeight()">
        <div class="backstage-list__switch" role="group" aria-label="Catalogue panels">
          <button mat-button type="button" [attr.aria-pressed]="pane() === 'filters'" (click)="pane.set('filters')">Filters</button>
          <button mat-button type="button" [attr.aria-pressed]="pane() === 'repos'" (click)="pane.set('repos')">Repositories</button>
        </div>
        <ngx-backstage-panel heading="Filter console" eyebrow="BACKSTAGE / FILTER" shape="chamfered" [class.backstage-list__panel--hidden]="pane() !== 'filters'">
          <ngx-backstage-filters [searchTerm]="vm.search()" [includeDocs]="vm.includeDocs()" (queryChange)="vm.setQuery($event)" (includeDocsChange)="vm.setIncludeDocs($event)" />
        </ngx-backstage-panel>
        <ngx-backstage-results [class.backstage-list__panel--hidden]="pane() !== 'repos'" [state]="vm.listState()" (view)="vm.view($event)" (refresh)="vm.refresh($event)" (refreshList)="vm.refreshList()" />
      </div>
    </main>
  `,
  styles: [`
    :host { display: block; min-width: 0; color: var(--ngx-color-text); background: var(--ngx-color-canvas); }
    ngx-action-bar { --ngx-action-bar-top: var(--backstage-toolbar-top, 96px); }
    .backstage-list { width: calc(100% - 2rem); margin: 0 auto; padding: 1rem 0; }
    .backstage-list__workspace { display: grid; grid-template-columns: 300px minmax(0, 1fr); grid-template-rows: minmax(0, 1fr); gap: 1rem; min-height: 0; }
    .backstage-list__switch { display: none; }
    @media (max-width: 1100px) {
      .backstage-list { width: calc(100% - 1rem); padding: 0.5rem 0 1rem; }
      .backstage-list__workspace { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr); gap: 0.5rem; }
      .backstage-list__switch { display: flex; }
      .backstage-list__switch button[aria-pressed='true'] { background: var(--ngx-color-surface-high); }
      ngx-backstage-panel, ngx-backstage-results { grid-column: 1; grid-row: 2; }
      .backstage-list__panel--hidden { display: none; }
    }
    @media (max-width: 720px) { .backstage-list__sync { min-width: 0; padding-inline: 8px; font-size: 0.7rem; } ngx-action-bar { --ngx-action-bar-top: var(--backstage-toolbar-top, 76px); } }
  `],
})
export class BackstageListPage {
  readonly vm = inject(BackstageListViewModel); readonly pane = signal<'filters' | 'repos'>('repos'); readonly workspaceHeight = signal(0);
  private readonly workspace = viewChild.required<ElementRef<HTMLElement>>('workspace'); private readonly destroyRef = inject(DestroyRef);
  constructor() { afterNextRender(() => this.destroyRef.onDestroy(observeWorkspaceHeight(this.workspace().nativeElement, height => this.workspaceHeight.set(height)))); }
}
