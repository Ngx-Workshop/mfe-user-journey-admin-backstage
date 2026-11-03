import { NgxCodeBlock } from '@tmdjr/ngx-workshop-design-system';
import { formatDocument } from '../utils/document.utils';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  computed,
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
  imports: [NgxCodeBlock,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressBarModule,
  ],
  template: `
    <div class="doc-viewer__doc-header">
      <div class="doc-viewer__title-row">
        <div class="doc-viewer__title">{{ title() }}</div>
        <div class="doc-viewer__actions">
          <button
            mat-icon-button
            [disabled]="!doc()"
            matTooltip="Copy"
            (click)="copy()"
            aria-label="Copy"
          >
            <mat-icon>content_copy</mat-icon>
          </button>
          <button
            mat-icon-button
            [disabled]="!doc()"
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
      @if (doc(); as document) {
        <div class="doc-viewer__meta">
          <span class="doc-viewer__badge">{{
            doc()?.format || 'raw'
          }}</span>
          @if (document.sha) {
            <span>SHA {{ document.sha }}</span>
          }
          @if (document.fetchedAt) {
            <span
              >Fetched {{ document.fetchedAt | date: 'short' }}</span
            >
          }
        </div>
      }
    </div>

    @if (loading()) {
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    } @else {
      <div class="doc-viewer__body">
        @if (error()) {
          <div class="doc-viewer__empty doc-viewer--error">
            <mat-icon>error</mat-icon>
            <div>
              <div class="doc-viewer__title">{{ error() }}</div>
              @if (unauthorized()) {
                <div class="doc-viewer__subtitle">
                  Check your access and retry.
                </div>
              }
            </div>
          </div>
        } @else if (!doc()) {
          <div class="doc-viewer__empty">
            <mat-icon>description</mat-icon>
            <div class="doc-viewer__title">{{ emptyLabel() }}</div>
          </div>
        } @else {
          <ngx-code-block [code]="formattedContent()" [label]="title()" [language]="doc()?.format === 'json' ? 'json' : 'text'" [wrap]="true" />
        }
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block; min-width: 0; position: relative;
      }
      .doc-viewer__doc-header {
        display: grid;
        gap: 0.25rem;
        margin-bottom: 0.5rem;
      }
      .doc-viewer__title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
      }
      .doc-viewer__title {
        font-weight: 700;
        font-size: 1.1rem;
      }
      .doc-viewer__actions {
        display: inline-flex;
        gap: 0.25rem;
      }
      .doc-viewer__meta {
        display: flex; flex-wrap: wrap; overflow-wrap: anywhere;
        gap: 0.75rem;
        align-items: center;
        color: var(--ngx-color-muted);
        font-size: 0.9rem;
      }
      .doc-viewer__badge {
        padding: 0.1rem 0.5rem;
        border-radius: var(--ngx-radius);
        border: 1px solid var(--ngx-color-border);
        font-size: 0.75rem;
        text-transform: uppercase;
      }
      ngx-code-block { position: relative; min-width: 0; }
      .doc-viewer__body {
        border: 1px solid var(--ngx-color-border);
        border-radius: var(--ngx-radius);
        padding: 0.75rem;
        background: var(--ngx-color-surface-low);
      }
      pre {
        margin: 0;
        overflow: auto;
        font-size: 0.9rem;
        line-height: 1.4;
        background: transparent;
      }
      .doc-viewer__empty {
        display: grid;
        gap: 0.35rem;
        justify-items: center;
        padding: 1.25rem;
        color: var(--ngx-color-muted);
      }
      .doc-viewer__empty.doc-viewer--error {
        color: var(--ngx-color-error);
      }
      .doc-viewer__empty mat-icon {
        font-size: 28px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocViewerComponent {
  readonly title = input('Document');
  readonly doc = input<DocBlobDto | null | undefined>();
  readonly loading = input(false);
  readonly error = input<string>();
  readonly unauthorized = input<boolean>();
  readonly emptyLabel = input('Not provided in repo');
  readonly reload = output<void>();
  private readonly snackBar = inject(MatSnackBar);
  readonly formattedContent = computed(() =>
    formatDocument(this.doc()?.content ?? '')
  );

  async copy() {
    if (!this.doc()?.content) return;
    try {
      await navigator.clipboard.writeText(this.doc()!.content);
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
    if (!this.doc()?.content) return;
    const blob = new Blob([this.doc()!.content], {
      type: 'text/plain',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.title()
      .replace(/\s+/g, '-')
      .toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
