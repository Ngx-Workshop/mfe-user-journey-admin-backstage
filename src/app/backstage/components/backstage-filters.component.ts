import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'ngx-backstage-filters',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatButtonModule,
  ],
  template: `
    <div class="filters">
      <div>
        <p class="eyebrow">Catalog</p>
        <h1>Backstage</h1>
      </div>
      <div class="header-actions">
        <mat-form-field appearance="outline" class="search">
          <mat-label>Search services</mat-label>
          <input
            matInput
            placeholder="Name, description, topic"
            [value]="searchTerm()"
            (input)="onQueryChange($any($event.target).value)"
            aria-label="Search services"
          />
          @if (hasQuery()) {
          <button
            mat-icon-button
            matSuffix
            aria-label="Clear search"
            (click)="onQueryChange('')"
          >
            <mat-icon>close</mat-icon>
          </button>
          }
        </mat-form-field>

        <mat-slide-toggle
          [checked]="includeDocs()"
          (change)="onIncludeDocsChange($event.checked)"
        >
          Include docs in list
        </mat-slide-toggle>

        <button
          mat-flat-button
          color="primary"
          [disabled]="syncing()"
          (click)="onSyncAllClick()"
        >
          <mat-icon>sync</mat-icon>
          Sync all
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .filters {
        background: var(--mat-sys-surface-container-low);
        padding: 1.5rem;
        border-radius: var(
          --mat-card-elevated-container-shape,
          var(--mat-sys-corner-medium)
        );
        margin-bottom: 2rem;
        h3 {
          margin-top: 0;
          margin-bottom: 1rem;
        }
      }

      .page-header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
      }
      .eyebrow {
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.8rem;
      }
      h1 {
        margin: 0;
      }
      .header-actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.5rem;
      }
      .search {
        min-width: min(360px, 100vw - 2rem);
      }
      @media (max-width: 768px) {
        .page-header {
          flex-direction: column;
          align-items: flex-start;
        }
        .header-actions {
          width: 100%;
        }
        .search {
          width: 100%;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackstageFiltersComponent {
  readonly searchTerm = input('');
  readonly includeDocs = input(false);
  readonly syncing = input(false);

  readonly queryChange = output<string>();
  readonly includeDocsChange = output<boolean>();
  readonly syncAll = output<void>();

  readonly hasQuery = computed(() => !!this.searchTerm()?.trim());

  onQueryChange(value: string) {
    this.queryChange.emit(value ?? '');
  }

  onIncludeDocsChange(checked: boolean) {
    this.includeDocsChange.emit(!!checked);
  }

  onSyncAllClick() {
    if (!this.syncing()) {
      this.syncAll.emit();
    }
  }
}
