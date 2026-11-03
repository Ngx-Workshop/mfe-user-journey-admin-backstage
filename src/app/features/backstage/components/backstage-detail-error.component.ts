import { NgxButton } from '@tmdjr/ngx-workshop-design-system';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ngx-backstage-detail-error',
  imports: [NgxButton, CommonModule, MatButtonModule, MatIconModule],
  template: `
    <section
      class="backstage-detail-error__empty"
      [class.backstage-detail-error--error]="unauthorized()"
      aria-live="polite"
    >
      <mat-icon>{{ unauthorized() ? 'lock' : 'error' }}</mat-icon>
      <div class="backstage-detail-error__title">
        {{ message() ?? 'Unable to load service' }}
      </div>
      <p>Try refreshing or check your permissions.</p>
      <button
        mat-flat-button ngxButton surface="outline"
        color="primary"
        (click)="retry.emit()"
      >
        <mat-icon>refresh</mat-icon>
        Retry
      </button>
    </section>
  `,
  styles: [
    `
      .backstage-detail-error__empty {
        display: grid;
        gap: 0.5rem;
        justify-items: center;
        text-align: center;
        padding: 2rem 1rem;
        border-radius: var(--ngx-radius);
        border: 1px dashed var(--ngx-color-border);
        color: var(--ngx-color-muted);
      }
      .backstage-detail-error__empty.backstage-detail-error--error {
        color: var(--ngx-color-error);
      }
      .backstage-detail-error__empty mat-icon {
        font-size: 42px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackstageDetailErrorComponent {
  readonly message = input<string | null | undefined>(null);
  readonly unauthorized = input<boolean>(false);
  readonly retry = output<void>();
}
