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
    <div class="doc-header">
      <div class="title-row">
        <div class="title">{{ title() }}</div>
        <div class="actions">
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
      <div class="meta">
        @if (docSha()) {
        <span>SHA {{ docSha() }}</span>
        } @if (docFetchedAt()) {
        <span>Fetched {{ docFetchedAt() | date : 'short' }}</span>
        }
      </div>
      }
    </div>

    @if (loading()) {
    <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    } @else {
    <div class="body">
      @if (error()) {
      <div class="empty error">
        <mat-icon>error</mat-icon>
        <div>
          <div class="title">{{ error() }}</div>
        </div>
      </div>
      } @else if (!doc()?.content) {
      <div class="empty">
        <mat-icon>description</mat-icon>
        <div class="title">{{ emptyLabel() }}</div>
      </div>
      } @else {
      <div
        class="markdown ngx-editor-js2-block"
        [innerHTML]="renderedHtml()"
      ></div>
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
        border-radius: 16px;
        padding: 2rem;
        background: var(--mat-sys-surface-container-high, #fafafa);
      }

      :host ::ng-deep .markdown {
        font: var(--mat-sys-body-large);
        h1 {
          font: var(--mat-sys-display-large);
        }
        h2 {
          font: var(--mat-sys-display-medium);
        }
        h3 {
          font: var(--mat-sys-display-small);
        }
        h4 {
          font: var(--mat-sys-headline-large);
        }
        h5 {
          font: var(--mat-sys-headline-medium);
        }
        h6 {
          font: var(--mat-sys-headline-small);
        }

        pre {
          color: var(--mat-sys-on-secondary-container);
          background: var(--mat-sys-secondary-container);
          padding: 1rem;
          border-radius: 16px;
          overflow: auto;
          font-family: 'Fira Code', monospace;
          code {
            font-size: 1rem;
          }
        }
        code {
          background: var(--mat-sys-secondary-container);
          padding: 0.5rem;
          border-radius: 16px;
          font-family: 'Fira Code', monospace;
          font-size: 0.8rem;
        }

        li {
          margin: 12px 0px;
        }

        table img {
          max-width: 100%;
          height: auto;
          display: block;
          object-fit: contain;
        }
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
