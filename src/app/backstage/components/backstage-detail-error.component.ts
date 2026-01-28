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
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <section
      class="empty"
      [class.error]="unauthorized()"
      aria-live="polite"
    >
      <mat-icon>{{ unauthorized() ? 'lock' : 'error' }}</mat-icon>
      <div class="title">
        {{ message() ?? 'Unable to load service' }}
      </div>
      <p>Try refreshing or check your permissions.</p>
      <button
        mat-stroked-button
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
      .empty {
        display: grid;
        gap: 0.5rem;
        justify-items: center;
        text-align: center;
        padding: 2rem 1rem;
        border-radius: 12px;
        border: 1px dashed var(--mat-sys-outline-variant, #ddd);
        color: var(--mat-sys-on-surface-variant);
      }
      .empty.error {
        color: #b71c1c;
      }
      .empty mat-icon {
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
