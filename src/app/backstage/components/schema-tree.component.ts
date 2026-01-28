import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

type SchemaMap = Record<string, SchemaObject>;

type SchemaObject = {
  $ref?: string;
  type?: string;
  description?: string;
  format?: string;
  nullable?: boolean;
  enum?: unknown[];
  properties?: Record<string, SchemaObject>;
  required?: string[];
  items?: SchemaObject | SchemaObject[];
  oneOf?: SchemaObject[];
  anyOf?: SchemaObject[];
  allOf?: SchemaObject[];
  additionalProperties?: boolean | SchemaObject;
};

type SchemaNode = {
  id: string;
  name: string;
  typeLabel: string;
  format?: string;
  required?: boolean;
  description?: string;
  enumValues?: string[];
  children?: SchemaNode[];
  circular?: boolean;
  ref?: string;
  depth: number;
};

@Component({
  selector: 'ngx-backstage-schema-tree',
  imports: [CommonModule],
  template: `
    @if (tree()) {
    <div class="schema-tree" role="tree">
      <ng-container
        [ngTemplateOutlet]="nodeTemplate"
        [ngTemplateOutletContext]="{ node: tree() }"
      ></ng-container>
    </div>
    } @else {
    <div class="schema-empty">No schema available.</div>
    }

    <ng-template #nodeTemplate let-node="node">
      @if (node.children?.length) {
      <details class="node" [open]="node.depth === 0" role="treeitem">
        <summary>
          <span class="node-name">{{ node.name }}</span>
          <span class="node-type">{{ node.typeLabel }}</span>
          @if (node.format) {
          <span class="node-format">{{ node.format }}</span>
          } @if (node.required) {
          <span class="node-required">required</span>
          } @if (node.circular) {
          <span class="node-circular">circular ref</span>
          }
        </summary>
        @if (node.description) {
        <div class="node-description">{{ node.description }}</div>
        } @if (node.enumValues?.length) {
        <div class="node-enum">
          Enum: {{ node.enumValues.join(', ') }}
        </div>
        }
        <div class="children" role="group">
          @for (child of node.children; track child.id) {
          <ng-container
            [ngTemplateOutlet]="nodeTemplate"
            [ngTemplateOutletContext]="{ node: child }"
          ></ng-container>
          }
        </div>
      </details>
      } @else {
      <div class="node leaf" role="treeitem">
        <span class="node-name">{{ node.name }}</span>
        <span class="node-type">{{ node.typeLabel }}</span>
        @if (node.format) {
        <span class="node-format">{{ node.format }}</span>
        } @if (node.required) {
        <span class="node-required">required</span>
        } @if (node.circular) {
        <span class="node-circular">circular ref</span>
        } @if (node.description) {
        <div class="node-description">{{ node.description }}</div>
        } @if (node.enumValues?.length) {
        <div class="node-enum">
          Enum: {{ node.enumValues.join(', ') }}
        </div>
        }
      </div>
      }
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .schema-tree {
        display: grid;
        gap: 0.5rem;
        font-size: 0.92rem;
        color: var(--mat-sys-on-surface);
      }
      .schema-empty {
        color: var(--mat-sys-on-surface-variant);
        font-style: italic;
      }
      details.node {
        border: 1px solid var(--mat-sys-outline-variant, #e0e0e0);
        border-radius: 8px;
        padding: 0.35rem 0.6rem;
        background: var(--mat-sys-surface-container-low, #fafafa);
      }
      details.node > summary {
        cursor: pointer;
        list-style: none;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.4rem;
      }
      details.node > summary::-webkit-details-marker {
        display: none;
      }
      .node.leaf {
        border: 1px solid var(--mat-sys-outline-variant, #e0e0e0);
        border-radius: 8px;
        padding: 0.35rem 0.6rem;
        background: var(--mat-sys-surface-container-low, #fafafa);
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.4rem;
      }
      .node-name {
        font-weight: 600;
      }
      .node-type {
        font-family: var(--mat-sys-label-large-font, inherit);
        font-size: 0.8rem;
        color: var(--mat-sys-on-surface-variant);
        border: 1px solid var(--mat-sys-outline-variant, #ddd);
        border-radius: 999px;
        padding: 0.05rem 0.45rem;
      }
      .node-format,
      .node-required,
      .node-circular {
        font-size: 0.75rem;
        color: var(--mat-sys-on-surface-variant);
        border: 1px dashed var(--mat-sys-outline-variant, #ddd);
        border-radius: 999px;
        padding: 0.05rem 0.4rem;
      }
      .node-circular {
        color: #b71c1c;
        border-color: #b71c1c;
      }
      .node-description {
        margin-top: 0.35rem;
        color: var(--mat-sys-on-surface-variant);
      }
      .node-enum {
        margin-top: 0.35rem;
        color: var(--mat-sys-on-surface-variant);
      }
      .children {
        display: grid;
        gap: 0.5rem;
        margin-top: 0.5rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchemaTreeComponent {
  readonly schema = input<SchemaObject | null | undefined>(null);
  readonly components = input<SchemaMap | null | undefined>(null);
  readonly rootLabel = input('Schema');

  private nodeId = 0;

  readonly tree = computed(() =>
    this.buildTree(this.schema(), this.rootLabel())
  );

  private buildTree(
    schema: SchemaObject | null | undefined,
    name: string
  ) {
    if (!schema) return null;
    this.nodeId = 0;
    return this.buildNode(
      schema,
      name,
      this.components() ?? {},
      new Set<string>(),
      0,
      false
    );
  }

  private buildNode(
    schema: SchemaObject,
    name: string,
    components: SchemaMap,
    visitedRefs: Set<string>,
    depth: number,
    required: boolean
  ): SchemaNode {
    const id = this.nextId();
    if (schema.$ref) {
      if (visitedRefs.has(schema.$ref)) {
        return {
          id,
          name,
          typeLabel: this.refLabel(schema.$ref),
          circular: true,
          ref: schema.$ref,
          depth,
        };
      }
      const resolved = this.resolveRef(schema.$ref, components);
      if (!resolved) {
        return {
          id,
          name,
          typeLabel: this.refLabel(schema.$ref),
          ref: schema.$ref,
          depth,
        };
      }
      const nextVisited = new Set(visitedRefs);
      nextVisited.add(schema.$ref);
      const resolvedNode = this.buildNode(
        resolved,
        name,
        components,
        nextVisited,
        depth,
        required
      );
      return {
        ...resolvedNode,
        ref: schema.$ref,
      };
    }

    const typeLabel = this.getTypeLabel(schema);
    const enumValues = Array.isArray(schema.enum)
      ? schema.enum.map((value) => String(value))
      : undefined;

    const children = this.getChildren(
      schema,
      components,
      visitedRefs,
      depth
    );

    return {
      id,
      name,
      typeLabel,
      format: schema.format,
      required,
      description: schema.description,
      enumValues,
      children,
      depth,
    };
  }

  private getChildren(
    schema: SchemaObject,
    components: SchemaMap,
    visitedRefs: Set<string>,
    depth: number
  ): SchemaNode[] | undefined {
    const children: SchemaNode[] = [];

    if (schema.properties) {
      const requiredSet = new Set(schema.required ?? []);
      Object.entries(schema.properties).forEach(
        ([propName, propSchema]) => {
          children.push(
            this.buildNode(
              propSchema,
              propName,
              components,
              new Set(visitedRefs),
              depth + 1,
              requiredSet.has(propName)
            )
          );
        }
      );
    }

    if (schema.items) {
      if (Array.isArray(schema.items)) {
        schema.items.forEach((itemSchema, index) => {
          children.push(
            this.buildNode(
              itemSchema,
              `items[${index}]`,
              components,
              new Set(visitedRefs),
              depth + 1,
              false
            )
          );
        });
      } else {
        children.push(
          this.buildNode(
            schema.items,
            'items',
            components,
            new Set(visitedRefs),
            depth + 1,
            false
          )
        );
      }
    }

    if (Array.isArray(schema.oneOf)) {
      schema.oneOf.forEach((childSchema, index) => {
        children.push(
          this.buildNode(
            childSchema,
            `oneOf[${index + 1}]`,
            components,
            new Set(visitedRefs),
            depth + 1,
            false
          )
        );
      });
    }

    if (Array.isArray(schema.anyOf)) {
      schema.anyOf.forEach((childSchema, index) => {
        children.push(
          this.buildNode(
            childSchema,
            `anyOf[${index + 1}]`,
            components,
            new Set(visitedRefs),
            depth + 1,
            false
          )
        );
      });
    }

    if (Array.isArray(schema.allOf)) {
      schema.allOf.forEach((childSchema, index) => {
        children.push(
          this.buildNode(
            childSchema,
            `allOf[${index + 1}]`,
            components,
            new Set(visitedRefs),
            depth + 1,
            false
          )
        );
      });
    }

    if (
      schema.additionalProperties &&
      typeof schema.additionalProperties === 'object'
    ) {
      children.push(
        this.buildNode(
          schema.additionalProperties,
          'additionalProperties',
          components,
          new Set(visitedRefs),
          depth + 1,
          false
        )
      );
    }

    return children.length > 0 ? children : undefined;
  }

  private resolveRef(ref: string, components: SchemaMap) {
    const match = ref.match(/^#\/components\/schemas\/(.+)$/);
    if (!match) return null;
    const key = decodeURIComponent(match[1]);
    return components[key] ?? null;
  }

  private getTypeLabel(schema: SchemaObject): string {
    if (schema.type) return schema.type;
    if (schema.properties) return 'object';
    if (schema.items) return 'array';
    if (schema.oneOf) return 'oneOf';
    if (schema.anyOf) return 'anyOf';
    if (schema.allOf) return 'allOf';
    return 'unknown';
  }

  private refLabel(ref: string) {
    const match = ref.match(/#\/components\/schemas\/(.+)$/);
    const name = match ? decodeURIComponent(match[1]) : ref;
    return `ref: ${name}`;
  }

  private nextId() {
    this.nodeId += 1;
    return `schema-node-${this.nodeId}`;
  }
}
