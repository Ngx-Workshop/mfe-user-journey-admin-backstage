import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import {
  MatTabsModule,
  type MatTabChangeEvent,
} from '@angular/material/tabs';
import {
  blankDocStates,
  type DocKind,
  type DocState,
} from '../models/backstage-state.models';
import { DocViewerComponent } from './doc-viewer.component';
import { MarkdownViewerComponent } from './markdown-viewer.component';
import { OpenApiViewerComponent } from './openapi-viewer.component';

@Component({
  selector: 'ngx-backstage-detail-tabs',
  imports: [
    CommonModule,
    MatTabsModule,
    MarkdownViewerComponent,
    DocViewerComponent,
    OpenApiViewerComponent,
  ],
  template: `
    <mat-tab-group
      class="backstage-detail-tabs__tabs"
      (selectedTabChange)="handleTabChange($event)"
    >
      <mat-tab label="README">
        <section class="backstage-detail-tabs__tab-content">
          <ngx-backstage-markdown-viewer
            title="README"
            [doc]="docs().readme.data"
            [loading]="docs().readme.loading"
            [error]="docs().readme.error"
            [unauthorized]="docs().readme.unauthorized"
            (reload)="
              reloadDoc.emit({ kind: 'readme', refresh: true })
            "
          ></ngx-backstage-markdown-viewer>
        </section>
      </mat-tab>
      <mat-tab label="OpenAPI">
        <ngx-backstage-openapi-viewer
          title="OpenAPI"
          [doc]="docs().openapi.data"
          [loading]="docs().openapi.loading"
          [error]="docs().openapi.error"
          [unauthorized]="docs().openapi.unauthorized"
          (reload)="
            reloadDoc.emit({ kind: 'openapi', refresh: true })
          "
        ></ngx-backstage-openapi-viewer>
      </mat-tab>
      <mat-tab label="Runbook">
        <section class="backstage-detail-tabs__tab-content">
          <ngx-backstage-markdown-viewer
            title="Runbook"
            [doc]="docs().runbook.data"
            [loading]="docs().runbook.loading"
            [error]="docs().runbook.error"
            [unauthorized]="docs().runbook.unauthorized"
            (reload)="
              reloadDoc.emit({ kind: 'runbook', refresh: true })
            "
            emptyLabel="Runbook not provided"
          ></ngx-backstage-markdown-viewer>
        </section>
      </mat-tab>
      <mat-tab label="Metadata">
        <section class="backstage-detail-tabs__tab-content">
          <ngx-backstage-doc-viewer
            title="Metadata"
            [doc]="docs().metadata.data"
            [loading]="docs().metadata.loading"
            [error]="docs().metadata.error"
            [unauthorized]="docs().metadata.unauthorized"
            (reload)="
              reloadDoc.emit({ kind: 'metadata', refresh: true })
            "
            emptyLabel="Metadata not provided"
          ></ngx-backstage-doc-viewer>
        </section>
      </mat-tab>
    </mat-tab-group>
  `,
  styles: [
    `
      .backstage-detail-tabs__tab-content {
        display: flex;
        justify-content: center;
      }

      ngx-backstage-markdown-viewer,
      ngx-backstage-doc-viewer {
        margin: 3rem 0;
        flex: 0 1 clamp(480px, 900px, 1400px);
        max-width: 100%;
        min-width: 0; /* <-- key for flex + long content */
      }

      :host
        ::ng-deep
        .backstage-detail-tabs__tabs
        .mat-mdc-tab-header {
        position: sticky;
        top: 112px;
        z-index: 10;
        background: var(--mat-sys-surface);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackstageDetailTabsComponent {
  private readonly tabOrder: DocKind[] = [
    'readme',
    'openapi',
    'runbook',
    'metadata',
  ];

  readonly docStates =
    input<Record<DocKind, DocState>>(blankDocStates());
  readonly tabChange = output<DocKind>();
  readonly reloadDoc = output<{ kind: DocKind; refresh: boolean }>();

  readonly docs = computed(() => this.docStates());

  handleTabChange(event: MatTabChangeEvent) {
    const kind = this.tabOrder[event.index];
    this.tabChange.emit(kind);
  }
}
