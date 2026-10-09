import { HttpMethodComponent } from './http-method.component';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { OperationGroup } from '../models/openapi.models';
@Component({
  selector: 'ngx-backstage-openapi-navigation',
  imports: [
    HttpMethodComponent,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <mat-form-field
      appearance="outline"
      class="openapi-navigation__search"
    >
      <mat-label>Search operations</mat-label>
      <input
        matInput
        placeholder="Path, summary, tag, operation id"
        [value]="query()"
        (input)="onInput($event)"
        aria-label="Search operations"
      />
    </mat-form-field>

    @if (groups().length === 0) {
      <div
        class="openapi-navigation__empty openapi-navigation--small"
      >
        No operations match the search.
      </div>
    } @else {
      <div class="openapi-navigation__tag-list" role="list">
        @for (group of groups(); track group.tag) {
          <details class="openapi-navigation__tag-group" open>
            <summary>
              <span class="openapi-navigation__tag-name">{{
                group.tag
              }}</span>
              <span class="openapi-navigation__tag-count">{{
                group.operations.length
              }}</span>
            </summary>
            @if (group.description) {
              <div class="openapi-navigation__tag-description">
                {{ group.description }}
              </div>
            }
            <div class="openapi-navigation__op-list" role="list">
              @for (op of group.operations; track op.id) {
                <button
                  type="button"
                  class="openapi-navigation__op-item"
                  [class.openapi-navigation--selected]="
                    selectedId() === op.id
                  "
                  (click)="select.emit(op.id)"
                  [attr.aria-pressed]="selectedId() === op.id"
                >
                  <ngx-backstage-http-method [method]="op.method" />
                  <span class="openapi-navigation__op-path">{{
                    op.path
                  }}</span>
                  <span class="openapi-navigation__op-summary">{{
                    op.summary
                  }}</span>
                </button>
              }
            </div>
          </details>
        }
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .openapi-navigation__search {
        width: 100%;
      }
      .openapi-navigation__tag-list {
        display: grid;
        gap: 0.6rem;
      }
      .openapi-navigation__tag-group {
        border: 1px solid var(--mat-sys-outline-variant, #e0e0e0);
        border-radius: 10px;
        padding: 0.35rem 0.6rem;
        background: var(--mat-sys-surface-container-high, #fff);
      }
      .openapi-navigation__tag-group summary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        list-style: none;
        font-weight: 600;
        margin: 1rem 0;
      }
      .openapi-navigation__tag-group summary::-webkit-details-marker {
        display: none;
      }
      .openapi-navigation__tag-count {
        font-size: 0.75rem;
        border: 1px solid var(--mat-sys-outline-variant, #ddd);
        padding: 0.05rem 0.5rem;
        border-radius: 999px;
        color: var(--mat-sys-on-surface-variant);
      }
      .openapi-navigation__tag-description {
        margin: 0.25rem 0 0.5rem;
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.85rem;
      }
      .openapi-navigation__op-list {
        display: grid;
        gap: 0.35rem;
      }
      .openapi-navigation__op-item {
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
      .openapi-navigation__op-item:hover,
      .openapi-navigation__op-item:focus-visible {
        border-color: var(--mat-sys-outline-variant, #ccc);
        background: var(--mat-sys-surface-container-low, #fafafa);
        outline: none;
      }
      .openapi-navigation__op-item.openapi-navigation--selected {
        border-color: var(--mat-sys-primary);
        background: color-mix(
          in srgb,
          var(--mat-sys-primary) 10%,
          transparent
        );
      }
      .openapi-navigation__op-path {
        font-family: var(--mat-sys-label-large-font, inherit);
        font-size: 0.85rem;
      }
      .openapi-navigation__op-summary {
        grid-column: 1 / -1;
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.8rem;
      }
      .openapi-navigation__empty {
        display: grid;
        gap: 0.35rem;
        justify-items: center;
        padding: 1.25rem;
        color: var(--mat-sys-on-surface-variant);
      }
      .openapi-navigation__empty.openapi-navigation--small {
        padding: 0.5rem;
        font-size: 0.85rem;
        text-align: center;
      }
      .openapi-navigation__empty mat-icon {
        font-size: 28px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenApiNavigationComponent {
  readonly groups = input.required<OperationGroup[]>();
  readonly query = input('');
  readonly selectedId = input<string>();
  readonly queryChange = output<string>();
  readonly select = output<string>();
  onInput(event: Event) {
    this.queryChange.emit((event.target as HTMLInputElement).value);
  }
}
