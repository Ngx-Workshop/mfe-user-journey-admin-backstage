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
    <div class="filters">
      <div class="filter-row header">
        <h3>Filters</h3>
        <button matButton (click)="clearAllFilters()">
          <mat-icon>clear_all</mat-icon> Clear All
        </button>
      </div>

      <div class="filter-row">
        <mat-form-field appearance="outline" class="search-bar">
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
      </div>

      <div class="filter-row">
        <mat-form-field appearance="outline">
          <mat-label>Favorite food</mat-label>
          <mat-select
            [(value)]="repoNamePrefixesSelectValue"
            (valueChange)="onQueryChange($event)"
          >
            @for (repoNamePrefix of repoNamePrefixes; track
            repoNamePrefix.value) {
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

      .search-bar {
        width: 100%;
        max-width: 600px;
      }

      .filter-row {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        align-items: center;
        margin-bottom: 1rem;

        &.header {
          justify-content: space-between;
        }
      }

      .filter-row:last-child {
        margin-bottom: 0;
      }

      .filter-row mat-form-field {
        min-width: 200px;
      }

      @media (max-width: 768px) {
        .filter-row {
          flex-direction: column;
          align-items: stretch;
        }

        .filter-row mat-form-field {
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

  repoNamePrefixesSelectValue: string | null = null;

  onQueryChange(value: string) {
    !this.repoNamePrefixes.some((prefix) => value === prefix.value)
      ? (this.repoNamePrefixesSelectValue = null)
      : void 0;
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
