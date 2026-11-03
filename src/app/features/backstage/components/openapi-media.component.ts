import { NgxCodeBlock } from '@tmdjr/ngx-workshop-design-system';
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
  imports: [NgxCodeBlock, SchemaTreeComponent],
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
            <ngx-code-block [code]="formatJson(entry.example)" label="Example" language="json" [wrap]="true" />
          </div>
        }
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block; min-width: 0; position: relative;
      }
      .openapi-media__content-block {
        border: 1px solid var(--ngx-color-border);
        border-radius: var(--ngx-radius);
        padding: 0.6rem;
        background: var(--ngx-color-surface-high);
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
        border: 1px solid var(--ngx-color-border);
        padding: 0.1rem 0.45rem;
        border-radius: var(--ngx-radius);
        color: var(--ngx-color-muted);
      }
      .openapi-media__example pre {
        margin: 0;
        padding: 0.5rem;
        background: var(--ngx-color-surface-low);
        border-radius: var(--ngx-radius);
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
