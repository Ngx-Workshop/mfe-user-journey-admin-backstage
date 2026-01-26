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
import { marked } from 'marked';

@Component({
  selector: 'ngx-backstage-markdown-viewer',
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
            [disabled]="!doc?.content"
            matTooltip="Copy raw markdown"
            (click)="copy()"
            aria-label="Copy markdown"
          >
            <mat-icon>content_copy</mat-icon>
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
      <div class="meta" *ngIf="doc?.fetchedAt || doc?.sha">
        <span *ngIf="doc?.sha">SHA {{ doc?.sha }}</span>
        <span *ngIf="doc?.fetchedAt"
          >Fetched {{ doc?.fetchedAt | date : 'short' }}</span
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
      } @else if (!doc?.content) {
      <div class="empty">
        <mat-icon>description</mat-icon>
        <div class="title">{{ emptyLabel }}</div>
      </div>
      } @else {
      <div class="markdown" [innerHTML]="renderedHtml"></div>
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
      .body {
        border: 1px solid var(--mat-sys-outline-variant, #e0e0e0);
        border-radius: 8px;
        padding: 0.75rem;
        background: var(--mat-sys-surface-container-low, #fafafa);
      }
      .markdown :is(h1, h2, h3, h4, h5, h6) {
        margin: 0.6em 0 0.3em;
      }
      .markdown p {
        margin: 0.4em 0;
      }
      .markdown pre {
        padding: 0.5rem;
        background: #0b1021;
        color: #f8f8f2;
        border-radius: 6px;
        overflow: auto;
      }
      .markdown code:not(pre code) {
        background: rgba(0, 0, 0, 0.05);
        padding: 0.1rem 0.35rem;
        border-radius: 4px;
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
export class MarkdownViewerComponent {
  @Input() title = 'Document';
  @Input() doc?: DocBlobDto | null;
  @Input() loading = false;
  @Input() error?: string;
  @Input() unauthorized?: boolean;
  @Input() emptyLabel = 'Not provided in repo';
  @Output() reload = new EventEmitter<void>();

  private readonly snackBar = inject(MatSnackBar);

  get renderedHtml(): string {
    return marked.parse(this.doc?.content ?? '', {
      async: false,
    }) as string;
  }

  async copy() {
    if (!this.doc?.content) return;
    try {
      await navigator.clipboard.writeText(this.doc.content);
      this.snackBar.open('Copied markdown', undefined, {
        duration: 1800,
      });
    } catch (e) {
      this.snackBar.open('Copy failed', undefined, {
        duration: 2000,
      });
    }
  }
}
