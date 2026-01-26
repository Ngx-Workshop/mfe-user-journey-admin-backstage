import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  MatSnackBar,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DocBlobDto } from '@tmdjr/backstage-contracts';

@Component({
  selector: 'ngx-backstage-doc-viewer',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressBarModule,
  ],
  template: `
    <div class="doc-header">
      <div class="title-row">
        <div class="title">{{ title }}</div>
        <div class="actions">
          <button
            mat-icon-button
            [disabled]="!doc"
            matTooltip="Copy"
            (click)="copy()"
            aria-label="Copy"
          >
            <mat-icon>content_copy</mat-icon>
          </button>
          <button
            mat-icon-button
            [disabled]="!doc"
            matTooltip="Download"
            (click)="download()"
            aria-label="Download"
          >
            <mat-icon>download</mat-icon>
          </button>
          <button
            mat-icon-button
            matTooltip="Reload"
            (click)="reload.emit()"
            aria-label="Reload"
          >
            <mat-icon>refresh</mat-icon>
          </button>
        </div>
      </div>
      <div class="meta" *ngIf="doc">
        <span class="badge">{{ doc.format || 'raw' }}</span>
        <span *ngIf="doc.sha">SHA {{ doc.sha }}</span>
        <span *ngIf="doc.fetchedAt"
          >Fetched {{ doc.fetchedAt | date : 'short' }}</span
        >
      </div>
    </div>

    @if (loading) {
    <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    } @else {
    <div class="body">
      @if (error) {
      <div class="empty error">
        <mat-icon>error</mat-icon>
        <div>
          <div class="title">{{ error }}</div>
          @if(unauthorized) {
          <div class="subtitle">Check your access and retry.</div>
          }
        </div>
      </div>
      } @else if (!doc) {
      <div class="empty">
        <mat-icon>description</mat-icon>
        <div class="title">{{ emptyLabel }}</div>
      </div>
      } @else {
      <pre><code>{{ formattedContent }}</code></pre>
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
        gap: 0.5rem;
      }
      .title {
        font-weight: 700;
        font-size: 1.1rem;
      }
      .actions {
        display: inline-flex;
        gap: 0.25rem;
      }
      .meta {
        display: flex;
        gap: 0.75rem;
        align-items: center;
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.9rem;
      }
      .badge {
        padding: 0.1rem 0.5rem;
        border-radius: 999px;
        border: 1px solid var(--mat-sys-outline);
        font-size: 0.75rem;
        text-transform: uppercase;
      }
      .body {
        border: 1px solid var(--mat-sys-outline-variant, #e0e0e0);
        border-radius: 8px;
        padding: 0.75rem;
        background: var(--mat-sys-surface-container-low, #fafafa);
      }
      pre {
        margin: 0;
        overflow: auto;
        font-size: 0.9rem;
        line-height: 1.4;
        background: transparent;
      }
      .empty {
        display: grid;
        gap: 0.35rem;
        justify-items: center;
        padding: 1.25rem;
        color: var(--mat-sys-on-surface-variant);
      }
      .empty.error {
        color: #b71c1c;
      }
      .empty mat-icon {
        font-size: 28px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocViewerComponent {
  @Input() title = 'Document';
  @Input() doc: DocBlobDto | null | undefined;
  @Input() loading = false;
  @Input() error?: string;
  @Input() unauthorized?: boolean;
  @Input() emptyLabel = 'Not provided in repo';
  @Output() reload = new EventEmitter<void>();

  private readonly snackBar = inject(MatSnackBar);

  get formattedContent(): string {
    if (!this.doc?.content) return '';
    const isJsonFormat = this.doc.format === 'json';
    if (isJsonFormat) {
      try {
        return JSON.stringify(JSON.parse(this.doc.content), null, 2);
      } catch (e) {
        return this.doc.content;
      }
    }
    try {
      const parsed = JSON.parse(this.doc.content);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return this.doc.content;
    }
  }

  async copy() {
    if (!this.doc?.content) return;
    try {
      await navigator.clipboard.writeText(this.doc.content);
      this.snackBar.open('Copied to clipboard', undefined, {
        duration: 1800,
      });
    } catch (e) {
      this.snackBar.open('Copy failed', undefined, {
        duration: 2000,
      });
    }
  }

  download() {
    if (!this.doc?.content) return;
    const blob = new Blob([this.doc.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.title
      .replace(/\s+/g, '-')
      .toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
