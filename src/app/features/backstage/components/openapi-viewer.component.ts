import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DocBlobDto } from '@tmdjr/backstage-contracts';
import { OpenApiNavigationComponent } from './openapi-navigation.component';
import { OpenApiOperationComponent } from './openapi-operation.component';
import {
  parseOpenApi,
  buildGroups,
  filterGroups,
} from '../utils/openapi.utils';
@Component({
  selector: 'ngx-backstage-openapi-viewer',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    OpenApiNavigationComponent,
    OpenApiOperationComponent,
  ],
  template: `
    <div class="openapi-viewer__doc-header">
      <div class="openapi-viewer__title">{{ title() }}</div>
      <button
        mat-icon-button
        aria-label="Reload OpenAPI"
        (click)="reload.emit()"
      >
        <mat-icon>refresh</mat-icon>
      </button>
      @if (infoTitle()) {
        <div class="openapi-viewer__meta">
          <span>{{ infoTitle() }}</span>
          @if (infoVersion()) {
            <span>v{{ infoVersion() }}</span>
          }
        </div>
      }
    </div>

    @if (loading()) {
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    } @else {
      <div class="openapi-viewer__body">
        @if (error()) {
          <div
            class="openapi-viewer__empty openapi-viewer--error"
            role="alert"
          >
            <mat-icon aria-hidden="true">error</mat-icon>
            <div>
              <div class="openapi-viewer__title">{{ error() }}</div>
              @if (unauthorized()) {
                <div class="openapi-viewer__subtitle">
                  Check your access and retry.
                </div>
              }
            </div>
          </div>
        } @else if (parseError()) {
          <div
            class="openapi-viewer__empty openapi-viewer--error"
            role="alert"
          >
            <mat-icon aria-hidden="true">error</mat-icon>
            <div>
              <div class="openapi-viewer__title">
                {{ parseError() }}
              </div>
              <div class="openapi-viewer__subtitle">
                The document is not valid OpenAPI JSON.
              </div>
            </div>
          </div>
        } @else if (!docContent()) {
          <div class="openapi-viewer__empty">
            <mat-icon aria-hidden="true">description</mat-icon>
            <div class="openapi-viewer__title">
              {{ emptyLabel() }}
            </div>
          </div>
        } @else {
          <div class="openapi-viewer__layout">
            <aside
              class="openapi-viewer__left"
              aria-label="Operations list"
            >
              <ngx-backstage-openapi-navigation
                [groups]="filteredGroups()"
                [query]="query()"
                [selectedId]="selectedOperation()?.id"
                (queryChange)="query.set($event)"
                (select)="selectedOperationId.set($event)"
              />
            </aside>

            <section class="openapi-viewer__right" aria-live="polite">
              <ngx-backstage-openapi-operation
                [operation]="selectedOperation()"
                [schemas]="componentsSchemas()"
              />
            </section>
          </div>
        }
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .openapi-viewer__doc-header {
        padding: 24px;
      }
      .openapi-viewer__title {
        font-weight: 700;
        font-size: 1.1rem;
      }
      .openapi-viewer__meta {
        display: flex;
        gap: 0.75rem;
        align-items: center;
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.9rem;
      }
      .openapi-viewer__body {
        border: 1px solid var(--mat-sys-outline-variant, #e0e0e0);
        border-radius: 8px;
        padding: 0.75rem;
        background: var(--mat-sys-surface-container-low, #fafafa);
      }
      .openapi-viewer__layout {
        display: grid;
        grid-template-columns: minmax(260px, 360px) minmax(0, 1fr);
        gap: 1rem;
      }
      .openapi-viewer__left {
        display: grid;
        gap: 0.75rem;
        align-content: start;
      }
      .openapi-viewer__right {
        display: block;
      }
      .openapi-viewer__empty {
        display: grid;
        gap: 0.35rem;
        justify-items: center;
        padding: 1.25rem;
        color: var(--mat-sys-on-surface-variant);
      }
      .openapi-viewer__empty.openapi-viewer--error {
        color: #b71c1c;
      }
      .openapi-viewer__empty mat-icon {
        font-size: 28px;
      }
      @media (max-width: 960px) {
        .openapi-viewer__layout {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenApiViewerComponent {
  readonly title = input('OpenAPI');
  readonly doc = input<DocBlobDto | null | undefined>(null);
  readonly loading = input(false);
  readonly error = input<string | undefined>();
  readonly unauthorized = input<boolean | undefined>();
  readonly emptyLabel = input('OpenAPI not provided');
  readonly reload = output<void>();

  readonly query = signal('');
  readonly selectedOperationId = signal<string | null>(null);

  readonly parseResult = computed(() =>
    parseOpenApi(this.doc()?.content ?? '')
  );
  readonly openApi = computed(() => this.parseResult().doc);
  readonly parseError = computed(() => this.parseResult().error);
  readonly docContent = computed(() => this.doc()?.content ?? '');

  readonly componentsSchemas = computed(
    () => this.openApi()?.components?.schemas ?? {}
  );

  readonly infoTitle = computed(() => this.openApi()?.info?.title);
  readonly infoVersion = computed(
    () => this.openApi()?.info?.version
  );

  readonly operationGroups = computed(() =>
    buildGroups(this.openApi())
  );

  readonly filteredGroups = computed(() =>
    filterGroups(this.operationGroups(), this.query())
  );

  readonly flatOperations = computed(() =>
    this.filteredGroups().flatMap((group) => group.operations)
  );

  readonly selectedOperation = computed(() => {
    const operations = this.flatOperations();
    if (!operations.length) return null;
    const selectedId = this.selectedOperationId();
    return (
      operations.find((op) => op.id === selectedId) ?? operations[0]
    );
  });
}
