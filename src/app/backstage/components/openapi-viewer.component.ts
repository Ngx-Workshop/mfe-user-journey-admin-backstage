import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DocBlobDto } from '@tmdjr/backstage-contracts';
import { SchemaTreeComponent } from './schema-tree.component';

type JsonRecord = Record<string, unknown>;

type OpenApiDocument = {
  openapi?: string;
  info?: OpenApiInfo;
  servers?: OpenApiServer[];
  tags?: OpenApiTag[];
  paths?: Record<string, OpenApiPathItem>;
  components?: {
    schemas?: Record<string, OpenApiSchema>;
  };
};

type OpenApiInfo = {
  title?: string;
  version?: string;
  description?: string;
};

type OpenApiServer = {
  url?: string;
  description?: string;
};

type OpenApiTag = {
  name: string;
  description?: string;
};

type OpenApiPathItem = {
  parameters?: OpenApiParameter[];
} & Record<string, unknown>;

type OpenApiOperation = {
  summary?: string;
  operationId?: string;
  description?: string;
  tags?: string[];
  parameters?: OpenApiParameter[];
  requestBody?: OpenApiRequestBody;
  responses?: Record<string, OpenApiResponse>;
};

type OpenApiParameter = {
  name: string;
  in: string;
  required?: boolean;
  description?: string;
  schema?: OpenApiSchema;
};

type OpenApiRequestBody = {
  description?: string;
  required?: boolean;
  content?: Record<string, OpenApiMediaType>;
};

type OpenApiResponse = {
  description?: string;
  content?: Record<string, OpenApiMediaType>;
};

type OpenApiMediaType = {
  schema?: OpenApiSchema;
  example?: unknown;
  examples?: Record<string, { value?: unknown }>;
};

type OpenApiSchema = {
  $ref?: string;
  type?: string;
  format?: string;
  description?: string;
  enum?: unknown[];
  items?: OpenApiSchema | OpenApiSchema[];
  properties?: Record<string, OpenApiSchema>;
  required?: string[];
  oneOf?: OpenApiSchema[];
  anyOf?: OpenApiSchema[];
  allOf?: OpenApiSchema[];
  additionalProperties?: boolean | OpenApiSchema;
};

type HttpMethod =
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'options'
  | 'head'
  | 'trace';

const HTTP_METHODS: HttpMethod[] = [
  'get',
  'post',
  'put',
  'delete',
  'patch',
  'options',
  'head',
  'trace',
];

type OperationItem = {
  id: string;
  method: HttpMethod;
  path: string;
  summary: string;
  operationId?: string;
  description?: string;
  tags: string[];
  parameters: OpenApiParameter[];
  requestBody?: OpenApiRequestBody;
  responses: Record<string, OpenApiResponse>;
};

type OperationGroup = {
  tag: string;
  description?: string;
  operations: OperationItem[];
};

type ParseResult = {
  doc?: OpenApiDocument;
  error?: string;
};

type ParameterRow = {
  name: string;
  location: string;
  required: boolean;
  schema: string;
  description: string;
};

type RequestBodyEntry = {
  mediaType: string;
  schema?: OpenApiSchema;
  example?: unknown;
};

type ResponseEntry = {
  status: string;
  description?: string;
  content?: Record<string, OpenApiMediaType>;
};

@Component({
  selector: 'ngx-backstage-openapi-viewer',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    SchemaTreeComponent,
  ],
  template: `
    <div class="doc-header">
      <div class="title-row">
        <div class="title">{{ title() }}</div>
        <div class="actions">
          <button
            mat-stroked-button
            type="button"
            (click)="reload.emit()"
            aria-label="Reload OpenAPI document"
          >
            <mat-icon>refresh</mat-icon>
            Reload
          </button>
        </div>
      </div>
      @if (infoTitle()) {
      <div class="meta">
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
    <div class="body">
      @if (error()) {
      <div class="empty error" role="alert">
        <mat-icon aria-hidden="true">error</mat-icon>
        <div>
          <div class="title">{{ error() }}</div>
          @if (unauthorized()) {
          <div class="subtitle">Check your access and retry.</div>
          }
        </div>
      </div>
      } @else if (parseError()) {
      <div class="empty error" role="alert">
        <mat-icon aria-hidden="true">error</mat-icon>
        <div>
          <div class="title">{{ parseError() }}</div>
          <div class="subtitle">
            The document is not valid OpenAPI JSON.
          </div>
        </div>
      </div>
      } @else if (!docContent()) {
      <div class="empty">
        <mat-icon aria-hidden="true">description</mat-icon>
        <div class="title">{{ emptyLabel() }}</div>
      </div>
      } @else {
      <div class="layout">
        <aside class="left" aria-label="Operations list">
          <mat-form-field appearance="outline" class="search">
            <mat-label>Search operations</mat-label>
            <input
              matInput
              placeholder="Path, summary, tag, operation id"
              [value]="query()"
              (input)="onQueryChange($event)"
              aria-label="Search operations"
            />
          </mat-form-field>

          @if (filteredGroups().length === 0) {
          <div class="empty small">
            No operations match the search.
          </div>
          } @else {
          <div class="tag-list" role="list">
            @for (group of filteredGroups(); track group.tag) {
            <details class="tag-group" open>
              <summary>
                <span class="tag-name">{{ group.tag }}</span>
                <span class="tag-count">{{
                  group.operations.length
                }}</span>
              </summary>
              @if (group.description) {
              <div class="tag-description">
                {{ group.description }}
              </div>
              }
              <div class="op-list" role="list">
                @for (op of group.operations; track op.id) {
                <button
                  type="button"
                  class="op-item"
                  [class.selected]="isSelected(op.id)"
                  (click)="selectOperation(op.id)"
                  [attr.aria-pressed]="isSelected(op.id)"
                >
                  <span
                    class="method-badge"
                    [class.method-get]="op.method === 'get'"
                    [class.method-post]="op.method === 'post'"
                    [class.method-put]="op.method === 'put'"
                    [class.method-delete]="op.method === 'delete'"
                    [class.method-patch]="op.method === 'patch'"
                    [class.method-options]="op.method === 'options'"
                    [class.method-head]="op.method === 'head'"
                    [class.method-trace]="op.method === 'trace'"
                  >
                    {{ op.method.toUpperCase() }}
                  </span>
                  <span class="op-path">{{ op.path }}</span>
                  <span class="op-summary">{{ op.summary }}</span>
                </button>
                }
              </div>
            </details>
            }
          </div>
          }
        </aside>

        <section class="right" aria-live="polite">
          @if (!selectedOperation()) {
          <div class="empty">
            Select an operation to view details.
          </div>
          } @else {
          <div class="operation">
            <header class="operation-header">
              <h2>{{ operationTitle() }}</h2>
              <div class="operation-path">
                <span
                  class="method-badge"
                  [class.method-get]="
                    selectedOperation()?.method === 'get'
                  "
                  [class.method-post]="
                    selectedOperation()?.method === 'post'
                  "
                  [class.method-put]="
                    selectedOperation()?.method === 'put'
                  "
                  [class.method-delete]="
                    selectedOperation()?.method === 'delete'
                  "
                  [class.method-patch]="
                    selectedOperation()?.method === 'patch'
                  "
                  [class.method-options]="
                    selectedOperation()?.method === 'options'
                  "
                  [class.method-head]="
                    selectedOperation()?.method === 'head'
                  "
                  [class.method-trace]="
                    selectedOperation()?.method === 'trace'
                  "
                >
                  {{ selectedOperation()?.method?.toUpperCase() }}
                </span>
                <span>{{ selectedOperation()?.path }}</span>
              </div>
              @if (selectedOperation()?.description) {
              <p class="description">
                {{ selectedOperation()?.description }}
              </p>
              }
            </header>

            <section class="panel">
              <h3>Parameters</h3>
              @if (parameterRows().length === 0) {
              <div class="empty small">No parameters documented.</div>
              } @else {
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">In</th>
                      <th scope="col">Required</th>
                      <th scope="col">Schema</th>
                      <th scope="col">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of parameterRows(); track row.name +
                    row.location) {
                    <tr>
                      <td>{{ row.name }}</td>
                      <td>{{ row.location }}</td>
                      <td>{{ row.required ? 'Yes' : 'No' }}</td>
                      <td>{{ row.schema }}</td>
                      <td>{{ row.description }}</td>
                    </tr>
                    }
                  </tbody>
                </table>
              </div>
              }
            </section>

            <section class="panel">
              <h3>Request body</h3>
              @if (requestBodyEntries().length === 0) {
              <div class="empty small">No request body.</div>
              } @else {
              <div class="content-list">
                @for (entry of requestBodyEntries(); track
                entry.mediaType) {
                <div class="content-block">
                  <div class="content-header">
                    <span class="content-type">{{
                      entry.mediaType
                    }}</span>
                  </div>
                  <ngx-backstage-schema-tree
                    [schema]="entry.schema"
                    [components]="componentsSchemas()"
                    rootLabel="Schema"
                  ></ngx-backstage-schema-tree>
                  @if (entry.example !== undefined) {
                  <div class="example">
                    <div class="example-title">Example</div>
                    <pre><code>{{ formatJson(entry.example) }}</code></pre>
                  </div>
                  }
                </div>
                }
              </div>
              }
            </section>

            <section class="panel">
              <h3>Responses</h3>
              @if (responseEntries().length === 0) {
              <div class="empty small">No responses documented.</div>
              } @else {
              <div class="response-list">
                @for (response of responseEntries(); track
                response.status) {
                <div class="response-block">
                  <div class="response-header">
                    <span class="status">{{ response.status }}</span>
                    <span class="response-description">
                      {{ response.description || 'No description' }}
                    </span>
                  </div>
                  @if (response.content) {
                  <div class="content-list">
                    @for (entry of responseContentEntries(response);
                    track entry.mediaType) {
                    <div class="content-block">
                      <div class="content-header">
                        <span class="content-type">{{
                          entry.mediaType
                        }}</span>
                      </div>
                      <ngx-backstage-schema-tree
                        [schema]="entry.schema"
                        [components]="componentsSchemas()"
                        rootLabel="Schema"
                      ></ngx-backstage-schema-tree>
                      @if (entry.example !== undefined) {
                      <div class="example">
                        <div class="example-title">Example</div>
                        <pre><code>{{ formatJson(entry.example) }}</code></pre>
                      </div>
                      }
                    </div>
                    }
                  </div>
                  }
                </div>
                }
              </div>
              }
            </section>

            <section class="panel">
              <h3>Try it out</h3>
              <div class="tryout" [class.disabled]="true">
                <p>
                  Try it out is disabled in this preview. Provide a
                  documented server URL with CORS enabled to enable
                  live requests.
                </p>
                <button mat-stroked-button type="button" disabled>
                  Send request
                </button>
              </div>
            </section>
          </div>
          }
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
      .doc-header {
        display: grid;
        gap: 0.25rem;
        margin-bottom: 0.5rem;
      }
      .title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
      }
      .title {
        font-weight: 700;
        font-size: 1.1rem;
      }
      .actions {
        display: inline-flex;
        gap: 0.5rem;
      }
      .meta {
        display: flex;
        gap: 0.75rem;
        align-items: center;
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.9rem;
      }
      .body {
        border: 1px solid var(--mat-sys-outline-variant, #e0e0e0);
        border-radius: 8px;
        padding: 0.75rem;
        background: var(--mat-sys-surface-container-low, #fafafa);
      }
      .layout {
        display: grid;
        grid-template-columns: minmax(260px, 360px) minmax(0, 1fr);
        gap: 1rem;
      }
      .left {
        display: grid;
        gap: 0.75rem;
        align-content: start;
      }
      .right {
        display: block;
      }
      .search {
        width: 100%;
      }
      .tag-list {
        display: grid;
        gap: 0.6rem;
      }
      .tag-group {
        border: 1px solid var(--mat-sys-outline-variant, #e0e0e0);
        border-radius: 10px;
        padding: 0.35rem 0.6rem;
        background: var(--mat-sys-surface-container-high, #fff);
      }
      .tag-group summary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        list-style: none;
        font-weight: 600;
      }
      .tag-group summary::-webkit-details-marker {
        display: none;
      }
      .tag-count {
        font-size: 0.75rem;
        border: 1px solid var(--mat-sys-outline-variant, #ddd);
        padding: 0.05rem 0.5rem;
        border-radius: 999px;
        color: var(--mat-sys-on-surface-variant);
      }
      .tag-description {
        margin: 0.25rem 0 0.5rem;
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.85rem;
      }
      .op-list {
        display: grid;
        gap: 0.35rem;
      }
      .op-item {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.3rem 0.5rem;
        text-align: left;
        border-radius: 8px;
        border: 1px solid transparent;
        padding: 0.4rem 0.5rem;
        background: transparent;
        cursor: pointer;
      }
      .op-item:hover,
      .op-item:focus-visible {
        border-color: var(--mat-sys-outline-variant, #ccc);
        background: var(--mat-sys-surface-container-low, #fafafa);
        outline: none;
      }
      .op-item.selected {
        border-color: var(--mat-sys-primary);
        background: color-mix(
          in srgb,
          var(--mat-sys-primary) 10%,
          transparent
        );
      }
      .op-path {
        font-family: var(--mat-sys-label-large-font, inherit);
        font-size: 0.85rem;
      }
      .op-summary {
        grid-column: 1 / -1;
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.8rem;
      }
      .method-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        padding: 0.1rem 0.45rem;
        border-radius: 6px;
        color: #fff;
        min-width: 48px;
      }
      .method-get {
        background: #61affe;
      }
      .method-post {
        background: #49cc90;
      }
      .method-put {
        background: #fca130;
      }
      .method-delete {
        background: #f93e3e;
      }
      .method-patch {
        background: #50e3c2;
        color: #163b2c;
      }
      .method-options {
        background: #9012fe;
      }
      .method-head {
        background: #0f6ab4;
      }
      .method-trace {
        background: #b71c1c;
      }
      .operation {
        display: grid;
        gap: 1.5rem;
      }
      .operation-header h2 {
        margin: 0 0 0.4rem;
      }
      .operation-path {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
      }
      .description {
        color: var(--mat-sys-on-surface-variant);
        margin: 0.5rem 0 0;
      }
      .panel {
        display: grid;
        gap: 0.75rem;
        border-top: 1px solid var(--mat-sys-outline-variant, #e0e0e0);
        padding-top: 0.75rem;
      }
      .table-wrap {
        overflow: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.85rem;
      }
      th,
      td {
        text-align: left;
        padding: 0.4rem 0.5rem;
        border-bottom: 1px solid
          var(--mat-sys-outline-variant, #e0e0e0);
      }
      th {
        font-weight: 600;
      }
      .content-list {
        display: grid;
        gap: 0.75rem;
      }
      .content-block {
        border: 1px solid var(--mat-sys-outline-variant, #e0e0e0);
        border-radius: 8px;
        padding: 0.6rem;
        background: var(--mat-sys-surface-container-high, #fff);
        display: grid;
        gap: 0.6rem;
      }
      .content-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .content-type {
        font-size: 0.75rem;
        text-transform: uppercase;
        border: 1px solid var(--mat-sys-outline-variant, #ddd);
        padding: 0.1rem 0.45rem;
        border-radius: 999px;
        color: var(--mat-sys-on-surface-variant);
      }
      .response-list {
        display: grid;
        gap: 0.75rem;
      }
      .response-block {
        border: 1px solid var(--mat-sys-outline-variant, #e0e0e0);
        border-radius: 8px;
        padding: 0.6rem;
        background: var(--mat-sys-surface-container-high, #fff);
        display: grid;
        gap: 0.6rem;
      }
      .response-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
      .status {
        font-weight: 700;
        border: 1px solid var(--mat-sys-outline-variant, #ddd);
        padding: 0.1rem 0.45rem;
        border-radius: 999px;
        font-size: 0.75rem;
      }
      .response-description {
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.85rem;
      }
      .example pre {
        margin: 0;
        padding: 0.5rem;
        background: var(--mat-sys-surface-container-low, #fafafa);
        border-radius: 6px;
        overflow: auto;
        font-size: 0.8rem;
      }
      .example-title {
        font-weight: 600;
        font-size: 0.8rem;
      }
      .tryout {
        border: 1px dashed var(--mat-sys-outline-variant, #ddd);
        border-radius: 8px;
        padding: 0.75rem;
        display: grid;
        gap: 0.5rem;
      }
      .tryout.disabled {
        color: var(--mat-sys-on-surface-variant);
      }
      .empty {
        display: grid;
        gap: 0.35rem;
        justify-items: center;
        padding: 1.25rem;
        color: var(--mat-sys-on-surface-variant);
      }
      .empty.small {
        padding: 0.5rem;
        font-size: 0.85rem;
        text-align: center;
      }
      .empty.error {
        color: #b71c1c;
      }
      .empty mat-icon {
        font-size: 28px;
      }
      @media (max-width: 960px) {
        .layout {
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
    this.parseOpenApi(this.doc()?.content ?? '')
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
    this.buildGroups(this.openApi())
  );

  readonly filteredGroups = computed(() =>
    this.filterGroups(this.operationGroups(), this.query())
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

  readonly parameterRows = computed(() => {
    const op = this.selectedOperation();
    if (!op) return [];
    return op.parameters.map((param) => ({
      name: param.name,
      location: param.in,
      required: Boolean(param.required),
      schema: this.schemaLabel(param.schema),
      description: param.description ?? '',
    }));
  });

  readonly requestBodyEntries = computed(() => {
    const op = this.selectedOperation();
    if (!op?.requestBody?.content) return [];
    return this.contentEntries(op.requestBody.content);
  });

  readonly responseEntries = computed(() => {
    const op = this.selectedOperation();
    if (!op?.responses) return [];
    return this.toResponseEntries(op.responses);
  });

  operationTitle() {
    const op = this.selectedOperation();
    if (!op) return 'Operation';
    return op.summary || op.operationId || `${op.method} ${op.path}`;
  }

  onQueryChange(event: Event) {
    const value = this.eventValue(event);
    this.query.set(value);
  }

  selectOperation(id: string) {
    this.selectedOperationId.set(id);
  }

  isSelected(id: string) {
    return this.selectedOperation()?.id === id;
  }

  responseContentEntries(response: ResponseEntry) {
    if (!response.content) return [];
    return this.contentEntries(response.content);
  }

  formatJson(value: unknown) {
    if (value === undefined) return '';
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }

  private parseOpenApi(content: string): ParseResult {
    if (!content) return {};
    try {
      const parsed = JSON.parse(content) as unknown;
      if (!this.isRecord(parsed)) {
        return { error: 'OpenAPI document must be a JSON object.' };
      }
      return { doc: parsed as OpenApiDocument };
    } catch {
      return { error: 'Unable to parse OpenAPI document.' };
    }
  }

  private buildGroups(
    doc: OpenApiDocument | undefined
  ): OperationGroup[] {
    if (!doc?.paths) return [];
    const tagDescriptions = new Map(
      (doc.tags ?? []).map((tag) => [tag.name, tag.description])
    );
    const tagOrder = (doc.tags ?? []).map((tag) => tag.name);
    const groups = new Map<string, OperationItem[]>();

    Object.entries(doc.paths).forEach(([path, pathItem]) => {
      if (!this.isRecord(pathItem)) return;
      const pathParams = this.getParameters(pathItem.parameters);
      HTTP_METHODS.forEach((method) => {
        const opCandidate = pathItem[method] as unknown;
        if (!this.isRecord(opCandidate)) return;
        const operation = opCandidate as OpenApiOperation;
        const tags = operation.tags?.length
          ? operation.tags
          : ['default'];
        const parameters = [
          ...pathParams,
          ...this.getParameters(operation.parameters),
        ];
        const opItem: OperationItem = {
          id: `${method.toUpperCase()} ${path}`,
          method,
          path,
          summary:
            operation.summary ||
            operation.operationId ||
            `${method.toUpperCase()} ${path}`,
          description: operation.description,
          operationId: operation.operationId,
          tags,
          parameters,
          requestBody: operation.requestBody,
          responses: operation.responses ?? {},
        };
        tags.forEach((tag) => {
          const list = groups.get(tag) ?? [];
          list.push(opItem);
          groups.set(tag, list);
        });
      });
    });

    const sortedTags = [
      ...tagOrder,
      ...Array.from(groups.keys()).filter(
        (tag) => !tagOrder.includes(tag)
      ),
    ];

    return sortedTags
      .filter((tag) => groups.has(tag))
      .map((tag) => ({
        tag,
        description: tagDescriptions.get(tag),
        operations: groups.get(tag) ?? [],
      }));
  }

  private filterGroups(groups: OperationGroup[], query: string) {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return groups;
    return groups
      .map((group) => ({
        ...group,
        operations: group.operations.filter((op) =>
          this.matchesQuery(op, trimmed)
        ),
      }))
      .filter((group) => group.operations.length > 0);
  }

  private matchesQuery(op: OperationItem, query: string) {
    const target = [
      op.path,
      op.summary,
      op.operationId ?? '',
      op.tags.join(' '),
      op.method,
    ]
      .join(' ')
      .toLowerCase();
    return target.includes(query);
  }

  private getParameters(value: unknown): OpenApiParameter[] {
    if (!Array.isArray(value)) return [];
    return value.filter(this.isParameter) as OpenApiParameter[];
  }

  private isParameter = (
    value: unknown
  ): value is OpenApiParameter => {
    if (!this.isRecord(value)) return false;
    return (
      typeof value['name'] === 'string' &&
      typeof value['in'] === 'string'
    );
  };

  private schemaLabel(schema: OpenApiSchema | undefined) {
    if (!schema) return '—';
    if (schema.$ref) return this.refLabel(schema.$ref);
    if (schema.type) {
      return schema.format
        ? `${schema.type} (${schema.format})`
        : schema.type;
    }
    if (schema.oneOf) return 'oneOf';
    if (schema.anyOf) return 'anyOf';
    if (schema.allOf) return 'allOf';
    return 'schema';
  }

  private refLabel(ref: string) {
    const match = ref.match(/#\/components\/schemas\/(.+)$/);
    return match ? decodeURIComponent(match[1]) : ref;
  }

  private contentEntries(content: Record<string, OpenApiMediaType>) {
    return Object.entries(content).map(([mediaType, media]) => ({
      mediaType,
      schema: media.schema,
      example: this.pickExample(media),
    }));
  }

  private pickExample(media: OpenApiMediaType) {
    if (media.example !== undefined) return media.example;
    if (media.examples) {
      const first = Object.values(media.examples)[0];
      return first?.value;
    }
    return undefined;
  }

  private toResponseEntries(
    responses: Record<string, OpenApiResponse>
  ) {
    const entries = Object.entries(responses).map(
      ([status, response]) => ({
        status,
        description: response.description,
        content: response.content,
      })
    );
    return entries.sort((a, b) =>
      this.sortStatus(a.status, b.status)
    );
  }

  private sortStatus(a: string, b: string) {
    const aNum = Number(a);
    const bNum = Number(b);
    if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
      return aNum - bNum;
    }
    return a.localeCompare(b);
  }

  private eventValue(event: Event) {
    const target = event.target as HTMLInputElement | null;
    return target?.value ?? '';
  }

  private isRecord(value: unknown): value is JsonRecord {
    return typeof value === 'object' && value !== null;
  }
}
