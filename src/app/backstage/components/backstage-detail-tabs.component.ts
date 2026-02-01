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
  type DocKind,
  type DocState,
} from '../services/backstage-facade.service';
import { DocViewerComponent } from './doc-viewer.component';
import { MarkdownViewerComponent } from './markdown-viewer.component';
import { OpenApiViewerComponent } from './openapi-viewer.component';

const defaultDocStates: Record<DocKind, DocState> = {
  readme: { loading: false, data: null },
  openapi: { loading: false, data: null },
  runbook: { loading: false, data: null },
  metadata: { loading: false, data: null },
};

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
      class="tabs"
      (selectedTabChange)="handleTabChange($event)"
    >
      <mat-tab label="README">
        <section class="tab-content">
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
      <mat-tab
        label="Runbook"
        [disabled]="!hasDoc('runbook') && !docs().runbook.loading"
      >
        <section class="tab-content">
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
      <mat-tab
        label="Metadata"
        [disabled]="!hasDoc('metadata') && !docs().metadata.loading"
      >
        <section class="tab-content">
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
      .tab-content {
        display: flex;
        justify-content: center;
      }

      ngx-backstage-markdown-viewer,
      ngx-backstage-doc-viewer {
        margin: 3rem 0;
        flex: 0 1 clamp(480px, 900px, 1400px);
        max-width: 100%;
      }

      :host ::ng-deep .tabs .mat-mdc-tab-header {
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
    input<Record<DocKind, DocState>>(defaultDocStates);
  readonly tabChange = output<DocKind>();
  readonly reloadDoc = output<{ kind: DocKind; refresh: boolean }>();

  readonly docs = computed(() => this.docStates());

  hasDoc(kind: DocKind) {
    return Boolean(this.docs()[kind]?.data?.content);
  }

  handleTabChange(event: MatTabChangeEvent) {
    const kind = this.tabOrder[event.index];
    this.tabChange.emit(kind);
  }
}
