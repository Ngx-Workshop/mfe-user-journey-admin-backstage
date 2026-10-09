import { OpenApiParametersComponent } from './openapi-parameters.component';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { OpenApiMediaComponent } from './openapi-media.component';
import { HttpMethodComponent } from './http-method.component';
import {
  OperationItem,
  OpenApiSchema,
} from '../models/openapi.models';
import {
  contentEntries,
  toResponseEntries,
} from '../utils/openapi.utils';
@Component({
  selector: 'ngx-backstage-openapi-operation',
  imports: [
    MatButtonModule,
    OpenApiMediaComponent,
    HttpMethodComponent,
    OpenApiParametersComponent,
  ],
  template: `
    @if (operation(); as op) {
      <div class="openapi-operation__operation">
        <header class="openapi-operation__operation-header">
          <h2>{{ op.summary || op.operationId || op.path }}</h2>
          <div class="openapi-operation__operation-path">
            <ngx-backstage-http-method [method]="op.method" /><span>{{
              op.path
            }}</span>
          </div>
          @if (op.description) {
            <p class="openapi-operation__description">
              {{ op.description }}
            </p>
          }
        </header>
        <section class="openapi-operation__panel">
          <h3>Parameters</h3>
          <ngx-backstage-openapi-parameters
            [parameters]="op.parameters"
          />
        </section>
        <section class="openapi-operation__panel">
          <h3>Request body</h3>
          @if (!request().length) {
            <div
              class="openapi-operation__empty openapi-operation--small"
            >
              No request body.
            </div>
          } @else {
            <ngx-backstage-openapi-media
              [entries]="request()"
              [schemas]="schemas()"
            />
          }
        </section>
        <section class="openapi-operation__panel">
          <h3>Responses</h3>
          @if (!responses().length) {
            <div
              class="openapi-operation__empty openapi-operation--small"
            >
              No responses documented.
            </div>
          }
          @for (response of responses(); track response.status) {
            <div class="openapi-operation__response-block">
              <div class="openapi-operation__response-header">
                <span class="openapi-operation__status">{{
                  response.status
                }}</span>
                <span
                  class="openapi-operation__response-description"
                  >{{
                    response.description || 'No description'
                  }}</span
                >
              </div>
              <ngx-backstage-openapi-media
                [entries]="contentEntries(response.content ?? {})"
                [schemas]="schemas()"
              />
            </div>
          }
        </section>
        <section class="openapi-operation__panel">
          <h3>Try it out</h3>
          <div
            class="openapi-operation__tryout openapi-operation--disabled"
          >
            <p>
              Try it out is disabled in this preview. Provide a
              documented server URL with CORS enabled to enable live
              requests.
            </p>
            <button mat-stroked-button type="button" disabled>
              Send request
            </button>
          </div>
        </section>
      </div>
    } @else {
      <div class="openapi-operation__empty">
        Select an operation to view details.
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .openapi-operation__operation {
        display: grid;
        gap: 1.5rem;
      }
      .openapi-operation__operation-header h2 {
        margin: 0 0 0.4rem;
      }
      .openapi-operation__operation-path {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
      }
      .openapi-operation__description {
        color: var(--mat-sys-on-surface-variant);
        margin: 0.5rem 0 0;
      }
      .openapi-operation__panel {
        display: grid;
        gap: 0.75rem;
        border-top: 1px solid var(--mat-sys-outline-variant, #e0e0e0);
        padding-top: 0.75rem;
      }
      .openapi-operation__response-block {
        border: 1px solid var(--mat-sys-outline-variant, #e0e0e0);
        border-radius: 8px;
        padding: 0.6rem;
        background: var(--mat-sys-surface-container-high, #fff);
        display: grid;
        gap: 0.6rem;
      }
      .openapi-operation__response-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
      .openapi-operation__status {
        font-weight: 700;
        border: 1px solid var(--mat-sys-outline-variant, #ddd);
        padding: 0.1rem 0.45rem;
        border-radius: 999px;
        font-size: 0.75rem;
      }
      .openapi-operation__response-description {
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.85rem;
      }
      .openapi-operation__tryout {
        border: 1px dashed var(--mat-sys-outline-variant, #ddd);
        border-radius: 8px;
        padding: 0.75rem;
        display: grid;
        gap: 0.5rem;
      }
      .openapi-operation__tryout.openapi-operation--disabled {
        color: var(--mat-sys-on-surface-variant);
      }
      .openapi-operation__empty {
        display: grid;
        gap: 0.35rem;
        justify-items: center;
        padding: 1.25rem;
        color: var(--mat-sys-on-surface-variant);
      }
      .openapi-operation__empty.openapi-operation--small {
        padding: 0.5rem;
        font-size: 0.85rem;
        text-align: center;
      }
      .openapi-operation__empty mat-icon {
        font-size: 28px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenApiOperationComponent {
  readonly operation = input<OperationItem | null>(null);
  readonly schemas = input<Record<string, OpenApiSchema>>({});
  readonly contentEntries = contentEntries;
  readonly request = computed(() =>
    contentEntries(this.operation()?.requestBody?.content ?? {})
  );
  readonly responses = computed(() =>
    toResponseEntries(this.operation()?.responses ?? {})
  );
}
