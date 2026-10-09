import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

import { SchemaMap, SchemaObject } from '../models/schema.models';
import { buildSchemaTree } from '../utils/schema-tree.utils';

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
      <div class="schema-tree__schema-empty">
        No schema available.
      </div>
    }

    <ng-template #nodeTemplate let-node="node">
      @if (node.children?.length) {
        <details
          class="schema-tree__node"
          [open]="node.depth === 0"
          role="treeitem"
        >
          <summary>
            <span class="schema-tree__node-name">{{
              node.name
            }}</span>
            <span class="schema-tree__node-type">{{
              node.typeLabel
            }}</span>
            @if (node.format) {
              <span class="schema-tree__node-format">{{
                node.format
              }}</span>
            }
            @if (node.required) {
              <span class="schema-tree__node-required">required</span>
            }
            @if (node.circular) {
              <span class="schema-tree__node-circular"
                >circular ref</span
              >
            }
          </summary>
          @if (node.description) {
            <div class="schema-tree__node-description">
              {{ node.description }}
            </div>
          }
          @if (node.enumValues?.length) {
            <div class="schema-tree__node-enum">
              Enum: {{ node.enumValues.join(', ') }}
            </div>
          }
          <div class="schema-tree__children" role="group">
            @for (child of node.children; track child.id) {
              <ng-container
                [ngTemplateOutlet]="nodeTemplate"
                [ngTemplateOutletContext]="{ node: child }"
              ></ng-container>
            }
          </div>
        </details>
      } @else {
        <div
          class="schema-tree__node schema-tree--leaf"
          role="treeitem"
        >
          <span class="schema-tree__node-name">{{ node.name }}</span>
          <span class="schema-tree__node-type">{{
            node.typeLabel
          }}</span>
          @if (node.format) {
            <span class="schema-tree__node-format">{{
              node.format
            }}</span>
          }
          @if (node.required) {
            <span class="schema-tree__node-required">required</span>
          }
          @if (node.circular) {
            <span class="schema-tree__node-circular"
              >circular ref</span
            >
          }
          @if (node.description) {
            <div class="schema-tree__node-description">
              {{ node.description }}
            </div>
          }
          @if (node.enumValues?.length) {
            <div class="schema-tree__node-enum">
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
      .schema-tree__schema-empty {
        color: var(--mat-sys-on-surface-variant);
        font-style: italic;
      }
      details.schema-tree__node {
        border: 1px solid var(--mat-sys-outline-variant, #e0e0e0);
        border-radius: 8px;
        padding: 0.35rem 0.6rem;
        background: var(--mat-sys-surface-container-low, #fafafa);
      }
      details.schema-tree__node > summary {
        cursor: pointer;
        list-style: none;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.4rem;
      }
      details.schema-tree__node > summary::-webkit-details-marker {
        display: none;
      }
      .schema-tree__node.schema-tree--leaf {
        border: 1px solid var(--mat-sys-outline-variant, #e0e0e0);
        border-radius: 8px;
        padding: 0.35rem 0.6rem;
        background: var(--mat-sys-surface-container-low, #fafafa);
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.4rem;
      }
      .schema-tree__node-name {
        font-weight: 600;
      }
      .schema-tree__node-type {
        font-family: var(--mat-sys-label-large-font, inherit);
        font-size: 0.8rem;
        color: var(--mat-sys-on-surface-variant);
        border: 1px solid var(--mat-sys-outline-variant, #ddd);
        border-radius: 999px;
        padding: 0.05rem 0.45rem;
      }
      .schema-tree__node-format,
      .schema-tree__node-required,
      .schema-tree__node-circular {
        font-size: 0.75rem;
        color: var(--mat-sys-on-surface-variant);
        border: 1px dashed var(--mat-sys-outline-variant, #ddd);
        border-radius: 999px;
        padding: 0.05rem 0.4rem;
      }
      .schema-tree__node-circular {
        color: #b71c1c;
        border-color: #b71c1c;
      }
      .schema-tree__node-description {
        margin-top: 0.35rem;
        color: var(--mat-sys-on-surface-variant);
      }
      .schema-tree__node-enum {
        margin-top: 0.35rem;
        color: var(--mat-sys-on-surface-variant);
      }
      .schema-tree__children {
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

  readonly tree = computed(() =>
    buildSchemaTree(
      this.schema(),
      this.rootLabel(),
      this.components() ?? {}
    )
  );
}
