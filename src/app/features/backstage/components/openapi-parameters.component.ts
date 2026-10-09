import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { OpenApiParameter } from '../models/openapi.models';
import { schemaLabel } from '../utils/openapi.utils';

@Component({
  selector: 'ngx-backstage-openapi-parameters',
  template: `
    @if (!rows().length) {
      <div
        class="openapi-parameters__empty openapi-parameters--small"
      >
        No parameters documented.
      </div>
    } @else {
      <div class="openapi-parameters__table-wrap">
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
            @for (row of rows(); track row.name + row.location) {
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
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .openapi-parameters__empty {
        padding: 0.5rem;
        text-align: center;
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.85rem;
      }
      .openapi-parameters__table-wrap {
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenApiParametersComponent {
  readonly parameters = input<OpenApiParameter[]>([]);
  readonly rows = computed(() =>
    (this.parameters() ?? []).map((param) => ({
      name: param.name,
      location: param.in,
      required: !!param.required,
      schema: schemaLabel(param.schema),
      description: param.description ?? '',
    }))
  );
}
