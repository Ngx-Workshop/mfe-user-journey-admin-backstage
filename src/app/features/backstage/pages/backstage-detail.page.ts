import { CommonModule } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxActionBar, NgxButton } from '@tmdjr/ngx-workshop-design-system';
import { BackstageDetailErrorComponent } from '../components/backstage-detail-error.component';
import { BackstageDetailTabsComponent } from '../components/backstage-detail-tabs.component';
import { BackstagePanelComponent } from '../components/backstage-panel.component';
import { StatusBadgeComponent } from '../components/status-badge.component';
import { observeWorkspaceHeight } from '../utils/panel-body-viewport';
import { BackstageDetailViewModel } from './backstage-detail.view-model';
@Component({
  selector: 'ngx-backstage-detail-page', host: { class: 'ngx-design-system' }, providers: [BackstageDetailViewModel],
  imports: [CommonModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressBarModule,
    NgxActionBar, NgxButton, BackstagePanelComponent, BackstageDetailTabsComponent, BackstageDetailErrorComponent, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ngx-action-bar heading="Repository details">
      <button class="backstage-detail__action" mat-flat-button ngxButton surface="glass" type="button" aria-label="Back to backstage" title="Back to backstage" (click)="vm.goBack()"><mat-icon>arrow_back</mat-icon><span class="backstage-detail__action-label">Back to backstage</span></button>
      <button class="backstage-detail__action" mat-flat-button ngxButton surface="outline" type="button" aria-label="Open repo" title="Open repository" (click)="vm.openRepo()" [disabled]="!vm.detailState().service?.htmlUrl"><mat-icon>open_in_new</mat-icon><span class="backstage-detail__action-label">Open repo</span></button>
      <button class="backstage-detail__action" mat-flat-button ngxButton surface="outline" type="button" aria-label="Refresh" title="Refresh repository" (click)="vm.reload(true)"><mat-icon>refresh</mat-icon><span class="backstage-detail__action-label">Refresh</span></button>
    </ngx-action-bar>
    <main class="backstage-detail" aria-label="Repository details">
      <div #workspace class="backstage-detail__workspace" [style.height.px]="workspaceHeight()">
        <div class="backstage-detail__switch" role="group" aria-label="Repository detail panels">
          <button mat-button type="button" [attr.aria-pressed]="pane() === 'info'" (click)="pane.set('info')">Overview</button>
          <button mat-button type="button" [attr.aria-pressed]="pane() === 'docs'" (click)="pane.set('docs')">Documents</button>
        </div>
        <ngx-backstage-panel heading="Repository" eyebrow="BACKSTAGE / DETAILS" shape="chamfered" [class.backstage-detail__panel--hidden]="pane() !== 'info'">
          @if (vm.detailState().loading) { <mat-progress-bar mode="indeterminate" aria-label="Loading repository" /> }
          @if (vm.detailState().service; as service) {
            <ngx-backstage-status-badge [status]="service.syncStatus" />
            <h2>{{ service.repoName }}</h2><p>{{ service.description || 'No description provided' }}</p>
            <h3>Last sync</h3><p>{{ service.lastSyncAt ? (service.lastSyncAt | date: 'short') : 'Never synced' }}</p>
            @if (service.syncStatus !== 'ok' && service.syncError) { <p class="backstage-detail__error">{{ service.syncError }}</p> }
            <h3>Topics</h3><p>{{ service.topics.join(' · ') || 'No topics' }}</p>
          }
        </ngx-backstage-panel>
        <ngx-backstage-panel heading="Documentation" eyebrow="BACKSTAGE / DOCUMENTS" background="grid" [class.backstage-detail__panel--hidden]="pane() !== 'docs'">
          @if (vm.detailState().loading) { <mat-progress-bar mode="indeterminate" aria-label="Loading repository documents" /> }
          @if (vm.detailState().error && !vm.detailState().loading) {
            <ngx-backstage-detail-error [message]="vm.detailState().error" [unauthorized]="vm.detailState().unauthorized ?? false" (retry)="vm.reload(true)" />
          }
          @if (vm.detailState().service) {
            <ngx-backstage-detail-tabs [docStates]="vm.docStates()" (tabChange)="vm.onTabChange($event)" (reloadDoc)="vm.reloadDoc($event.kind, $event.refresh)" />
          }
        </ngx-backstage-panel>
      </div>
    </main>
  `,
  styles: [`
    :host { display: block; min-width: 0; color: var(--ngx-color-text); background: var(--ngx-color-canvas); }
    ngx-action-bar { --ngx-action-bar-top: var(--backstage-toolbar-top, 96px); }
    .backstage-detail { width: calc(100% - 2rem); margin: 0 auto; padding: 1rem 0; }
    .backstage-detail__workspace { display: grid; grid-template-columns: 300px minmax(0, 1fr); grid-template-rows: minmax(0, 1fr); gap: 1rem; min-height: 0; }
    .backstage-detail__switch { display: none; }
    h2 { font: 600 0.9rem/1.5 var(--ngx-font-mono); overflow-wrap: anywhere; color: var(--ngx-color-text); }
    h3 { font: var(--ngx-font-label); margin: 1rem 0 0.25rem; }
    p { font-size: 0.8rem; line-height: 1.6; overflow-wrap: anywhere; }
    .backstage-detail__error { color: var(--ngx-color-error); }
    @media (max-width: 1100px) {
      .backstage-detail { width: calc(100% - 1rem); padding: 0.5rem 0 1rem; }
      .backstage-detail__workspace { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr); gap: 0.5rem; }
      .backstage-detail__switch { display: flex; }
      .backstage-detail__switch button[aria-pressed='true'] { background: var(--ngx-color-surface-high); }
      ngx-backstage-panel { grid-column: 1; grid-row: 2; }
      .backstage-detail__panel--hidden { display: none; }
    }
    @media (max-width: 720px) { .backstage-detail__action-label { display: none; } .backstage-detail__action { min-width: 44px; padding-inline: 8px; } ngx-action-bar { --ngx-action-bar-top: var(--backstage-toolbar-top, 76px); } }
  `],
})
export class BackstageDetailPage {
  readonly vm = inject(BackstageDetailViewModel); readonly pane = signal<'info' | 'docs'>('docs'); readonly workspaceHeight = signal(0);
  private readonly workspace = viewChild.required<ElementRef<HTMLElement>>('workspace'); private readonly destroyRef = inject(DestroyRef);
  constructor() { afterNextRender(() => this.destroyRef.onDestroy(observeWorkspaceHeight(this.workspace().nativeElement, height => this.workspaceHeight.set(height)))); }
}
