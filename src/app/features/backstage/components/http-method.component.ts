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
  styles: [
    `
      .http-method__method-get {
        background: #61affe;
      }
      .http-method__method-post {
        background: #49cc90;
      }
      .http-method__method-put {
        background: #fca130;
      }
      .http-method__method-delete {
        background: #f93e3e;
      }
      .http-method__method-patch {
        background: #50e3c2;
      }
      .http-method__method-options {
        background: #9012fe;
      }
      .http-method__method-head {
        background: #0f6ab4;
      }
      .http-method__method-trace {
        background: #b71c1c;
      }
      :host {
        display: block;
      }
      .http-method__method-badge {
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HttpMethodComponent {
  readonly method = input.required<HttpMethod>();
}
