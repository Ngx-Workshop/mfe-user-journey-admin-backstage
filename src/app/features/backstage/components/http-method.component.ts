import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { HttpMethod } from '../models/openapi.models';
@Component({
  selector: 'ngx-backstage-http-method',
  imports: [],
  template: `
    <span
      class="http-method__method-badge"
      [class]="
        'http-method__method-badge http-method__method-' + method()
      "
      >{{ method().toUpperCase() }}</span
    >
  `,
  styles: [`
    :host { display: inline-block; }
    .http-method__method-badge { --method-color: var(--ngx-color-primary); display: inline-flex;
      align-items: center; justify-content: center; min-width: 48px; padding: 2px 6px;
      font: 600 0.65rem/1.5 var(--ngx-font-mono); color: var(--ngx-color-text);
      border: 1px solid var(--method-color); background: color-mix(in srgb, var(--method-color) 14%, var(--ngx-color-surface)); }
    .http-method__method-post { --method-color: var(--ngx-color-success); }
    .http-method__method-put, .http-method__method-patch { --method-color: var(--ngx-color-warning); }
    .http-method__method-delete, .http-method__method-trace { --method-color: var(--ngx-color-error); }
    .http-method__method-options, .http-method__method-head { --method-color: var(--ngx-color-secondary); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HttpMethodComponent {
  readonly method = input.required<HttpMethod>();
}
