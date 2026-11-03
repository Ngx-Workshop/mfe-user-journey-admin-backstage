import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
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
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressBarModule,
  ],
  template: `
    <div class="markdown-viewer__doc-header">
      <div class="markdown-viewer__title-row">
        <div class="markdown-viewer__title">{{ title() }}</div>
        <div class="markdown-viewer__actions">
          <button
            mat-icon-button
            [disabled]="!canCopy()"
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
      @if (docHasMeta()) {
        <div class="markdown-viewer__meta">
          @if (docSha()) {
            <span>SHA {{ docSha() }}</span>
          }
          @if (docFetchedAt()) {
            <span>Fetched {{ docFetchedAt() | date: 'short' }}</span>
          }
        </div>
      }
    </div>

    @if (loading()) {
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    } @else {
      <div class="markdown-viewer__body">
        @if (error()) {
          <div class="markdown-viewer__empty markdown-viewer--error">
            <mat-icon>error</mat-icon>
            <div>
              <div class="markdown-viewer__title">{{ error() }}</div>
            </div>
          </div>
        } @else if (!doc()?.content) {
          <div class="markdown-viewer__empty">
            <mat-icon>description</mat-icon>
            <div class="markdown-viewer__title">
              {{ emptyLabel() }}
            </div>
          </div>
        } @else {
          <div
            class="markdown-viewer__markdown ngx-editor-js2-block"
            [innerHTML]="renderedHtml()"
          ></div>
        }
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block; min-width: 0;
      }
      .markdown-viewer__doc-header {
        display: grid;
        gap: 0.25rem;
        margin-bottom: 0.5rem;
      }
      .markdown-viewer__title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .markdown-viewer__title {
        font-weight: 700;
        font-size: 1.1rem;
      }
      .markdown-viewer__actions {
        display: inline-flex;
        gap: 0.25rem;
      }
      .markdown-viewer__meta {
        display: flex; flex-wrap: wrap; overflow-wrap: anywhere;
        gap: 0.75rem;
        align-items: center;
        color: var(--ngx-color-muted);
        font-size: 0.9rem;
      }
      .markdown-viewer__body {
        border-radius: var(--ngx-radius);
        padding: 1rem;
        background: var(--ngx-color-surface-high);
      }

      :host ::ng-deep .markdown-viewer__markdown {
        font: 400 0.875rem/1.7 var(--ngx-font-body); overflow-wrap: anywhere;
        h1, h2, h3, h4, h5, h6 { font-family: var(--ngx-font-heading); line-height: 1.4; color: var(--ngx-color-text); margin: 1rem 0 0.5rem; }
        h1 { font-size: 1.5rem; } h2 { font-size: 1.3rem; } h3 { font-size: 1.1rem; }
        h4, h5, h6 { font-size: 0.95rem; }
        pre { background: var(--ngx-color-surface-low); border: 1px solid var(--ngx-color-border); padding: 0.75rem; overflow: auto; white-space: pre-wrap; }
        code { font-family: var(--ngx-font-mono); font-size: 0.8rem; color: var(--ngx-color-primary); }
        img { max-width: 100%; height: auto; }
        table { max-width: 100%; display: block; overflow: auto; }
      }
      .markdown-viewer__empty {
        display: grid;
        gap: 0.35rem;
        justify-items: center;
        padding: 1.25rem;
        color: var(--ngx-color-muted);
      }
      .markdown-viewer__empty.markdown-viewer--error {
        color: var(--ngx-color-error);
      }
      .markdown-viewer__empty mat-icon {
        font-size: 28px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarkdownViewerComponent {
  readonly title = input('Document');
  readonly doc = input<DocBlobDto | null | undefined>(null);
  readonly loading = input(false);
  readonly error = input<string | undefined>();
  readonly unauthorized = input<boolean | undefined>();
  readonly emptyLabel = input('Not provided in repo');
  readonly reload = output<void>();

  private readonly snackBar = inject(MatSnackBar);

  readonly docContent = computed(() => this.doc()?.content ?? '');
  readonly docSha = computed(() => this.doc()?.sha);
  readonly docFetchedAt = computed(() => this.doc()?.fetchedAt);
  readonly docHasMeta = computed(
    () => !!(this.docSha() || this.docFetchedAt())
  );
  readonly canCopy = computed(() => this.docContent().length > 0);

  readonly renderedHtml = computed(
    () => marked.parse(this.docContent()) as string
  );

  async copy() {
    const content = this.docContent();
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
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
