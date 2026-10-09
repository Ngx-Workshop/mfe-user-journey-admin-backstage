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
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

interface RepoNamePrefixesSearchParam {
  value: string;
  viewValue: string;
}

const repoNamePrefixes: RepoNamePrefixesSearchParam[] = [
  {
    value: 'service-',
    viewValue: 'Services',
  },
  {
    value: 'mfe-shell',
    viewValue: 'MFE Shell',
  },
  {
    value: 'mfe-structural',
    viewValue: 'MFE Structural',
  },
  {
    value: 'mfe-user-journey',
    viewValue: 'MFE User Journey',
  },
];

@Component({
  selector: 'ngx-backstage-filters',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatButtonModule,
  ],
  template: `
    <div class="backstage-filters__filters">
      <div
        class="backstage-filters__filter-row backstage-filters__header"
      >
        <h3>Filters</h3>
        <button matButton (click)="clearAllFilters()">
          <mat-icon>clear_all</mat-icon> Clear All
        </button>
      </div>

      <div class="backstage-filters__filter-row">
        <mat-form-field
          appearance="outline"
          class="backstage-filters__search-bar"
        >
          <mat-label>Search services</mat-label>
          <input
            matInput
            placeholder="Name, description, topic"
            [value]="searchTerm()"
            (input)="onInput($event)"
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
      </div>

      <div class="backstage-filters__filter-row">
        <mat-form-field
          appearance="outline"
          class="backstage-filters__repo-prefix-select"
        >
          <mat-label>Quick Search with Repo Prefixes</mat-label>
          <mat-select
            [value]="selectedPrefix()"
            (valueChange)="onQueryChange($event)"
          >
            @for (
              repoNamePrefix of repoNamePrefixes;
              track repoNamePrefix.value
            ) {
              <mat-option [value]="repoNamePrefix.value">{{
                repoNamePrefix.viewValue
              }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>
    </div>
  `,
  styles: [
    `
      .backstage-filters__filters {
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

      .backstage-filters__search-bar {
        width: 100%;
        max-width: 600px;
      }
      .backstage-filters__repo-prefix-select {
        width: 100%;
        max-width: 300px;
      }

      .backstage-filters__filter-row {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        align-items: center;
        margin-bottom: 1rem;

        &.backstage-filters__header {
          justify-content: space-between;
        }
      }

      .backstage-filters__filter-row:last-child {
        margin-bottom: 0;
      }

      .backstage-filters__filter-row mat-form-field {
        min-width: 200px;
      }

      @media (max-width: 768px) {
        .backstage-filters__filter-row {
          flex-direction: column;
          align-items: stretch;
        }

        .backstage-filters__filter-row mat-form-field {
          min-width: auto;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackstageFiltersComponent {
  readonly searchTerm = input('');
  readonly includeDocs = input(false);

  readonly queryChange = output<string>();
  readonly includeDocsChange = output<boolean>();

  readonly hasQuery = computed(() => !!this.searchTerm()?.trim());

  repoNamePrefixes = repoNamePrefixes;

  readonly selectedPrefix = computed(() =>
    this.repoNamePrefixes.some(
      (prefix) => prefix.value === this.searchTerm()
    )
      ? this.searchTerm()
      : null
  );

  onInput(event: Event) {
    this.onQueryChange((event.target as HTMLInputElement).value);
  }
  onQueryChange(value: string) {
    this.queryChange.emit(value ?? '');
  }

  onIncludeDocsChange(checked: boolean) {
    this.includeDocsChange.emit(!!checked);
  }

  clearAllFilters() {
    this.onQueryChange('');
    this.onIncludeDocsChange(false);
  }
}
