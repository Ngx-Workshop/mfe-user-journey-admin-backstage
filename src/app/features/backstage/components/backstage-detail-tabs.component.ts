import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { blankDocStates, DocKind, DocState } from '../models/backstage-state.models';
import { DocViewerComponent } from './doc-viewer.component';
import { MarkdownViewerComponent } from './markdown-viewer.component';
import { OpenApiViewerComponent } from './openapi-viewer.component';
@Component({
  selector: 'ngx-backstage-detail-tabs', imports: [MatButtonModule, MarkdownViewerComponent, DocViewerComponent, OpenApiViewerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="backstage-detail-tabs__nav" aria-label="Repository documents">
      @for (tab of tabs; track tab.kind) {
        <button mat-button type="button" [attr.aria-pressed]="selected() === tab.kind" (click)="select(tab.kind)">{{ tab.label }}</button>
      }
    </nav>
    <section class="backstage-detail-tabs__content" [attr.aria-label]="selected() + ' document'">
      @switch (selected()) {
        @case ('openapi') {
          <ngx-backstage-openapi-viewer title="OpenAPI" [doc]="active().data" [loading]="active().loading" [error]="active().error" [unauthorized]="active().unauthorized" (reload)="reloadDoc.emit({ kind: 'openapi', refresh: true })" />
        }
        @case ('metadata') {
          <ngx-backstage-doc-viewer title="Metadata" emptyLabel="Metadata not provided" [doc]="active().data" [loading]="active().loading" [error]="active().error" [unauthorized]="active().unauthorized" (reload)="reloadDoc.emit({ kind: 'metadata', refresh: true })" />
        }
        @default {
          <ngx-backstage-markdown-viewer [title]="selected() === 'readme' ? 'README' : 'Runbook'" [emptyLabel]="selected() === 'readme' ? 'Not provided in repo' : 'Runbook not provided'" [doc]="active().data" [loading]="active().loading" [error]="active().error" [unauthorized]="active().unauthorized" (reload)="reloadDoc.emit({ kind: selected(), refresh: true })" />
        }
      }
    </section>
  `,
  styles: [`
    :host { display: block; min-width: 0; }
    .backstage-detail-tabs__nav { position: sticky; top: -4px; z-index: 2; display: flex; flex-wrap: wrap; background: var(--ngx-color-surface); border-bottom: 1px solid var(--ngx-color-border); }
    .backstage-detail-tabs__nav button[aria-pressed='true'] { color: var(--ngx-color-primary); box-shadow: inset 0 -2px var(--ngx-color-primary); }
    .backstage-detail-tabs__nav button { min-width: 0; padding-inline: 8px; font-size: 0.75rem; }
    .backstage-detail-tabs__content { padding-top: 0.75rem; min-width: 0; }
  `],
})
export class BackstageDetailTabsComponent {
  readonly tabs: { kind: DocKind; label: string }[] = [{ kind: 'readme', label: 'README' }, { kind: 'openapi', label: 'OpenAPI' }, { kind: 'runbook', label: 'Runbook' }, { kind: 'metadata', label: 'Metadata' }];
  readonly docStates = input<Record<DocKind, DocState>>(blankDocStates()); readonly selected = signal<DocKind>('readme');
  readonly docs = computed(() => this.docStates()); readonly active = computed(() => this.docs()[this.selected()]);
  readonly tabChange = output<DocKind>(); readonly reloadDoc = output<{ kind: DocKind; refresh: boolean }>();
  select(kind: DocKind) { this.selected.set(kind); this.tabChange.emit(kind); }
}
