import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { SchemaTreeComponent } from './schema-tree.component';
import {
  OpenApiSchema,
  RequestBodyEntry,
} from '../models/openapi.models';
import { formatJson } from '../utils/document.utils';
@Component({
  selector: 'ngx-backstage-openapi-media',
  imports: [SchemaTreeComponent],
  template: `
    @for (entry of entries(); track entry.mediaType) {
      <div class="openapi-media__content-block">
        <div class="openapi-media__content-header">
          <span class="openapi-media__content-type">{{
            entry.mediaType
          }}</span>
        </div>
        <ngx-backstage-schema-tree
          [schema]="entry.schema"
          [components]="schemas()"
          rootLabel="Schema"
        />
        @if (entry.example !== undefined) {
          <div class="openapi-media__example">
            <div class="openapi-media__example-title">Example</div>
            <pre><code>{{ formatJson(entry.example) }}</code></pre>
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
      .openapi-media__content-block {
        border: 1px solid var(--mat-sys-outline-variant, #e0e0e0);
        border-radius: 8px;
        padding: 0.6rem;
        background: var(--mat-sys-surface-container-high, #fff);
        display: grid;
        gap: 0.6rem;
      }
      .openapi-media__content-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .openapi-media__content-type {
        font-size: 0.75rem;
        text-transform: uppercase;
        border: 1px solid var(--mat-sys-outline-variant, #ddd);
        padding: 0.1rem 0.45rem;
        border-radius: 999px;
        color: var(--mat-sys-on-surface-variant);
      }
      .openapi-media__example pre {
        margin: 0;
        padding: 0.5rem;
        background: var(--mat-sys-surface-container-low, #fafafa);
        border-radius: 6px;
        overflow: auto;
        font-size: 0.8rem;
      }
      .openapi-media__example-title {
        font-weight: 600;
        font-size: 0.8rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenApiMediaComponent {
  readonly entries = input.required<RequestBodyEntry[]>();
  readonly schemas = input<Record<string, OpenApiSchema>>({});
  readonly formatJson = formatJson;
}
