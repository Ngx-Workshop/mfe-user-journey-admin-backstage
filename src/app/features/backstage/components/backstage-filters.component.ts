import { NgxButton } from '@tmdjr/ngx-workshop-design-system';
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
  imports: [NgxButton,
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
        <button mat-flat-button ngxButton surface="outline" (click)="clearAllFilters()">
          <mat-icon>clear_all</mat-icon> Clear All
        </button>
      </div>

      <div class="backstage-filters__filter-row">
        <mat-form-field
          appearance="outline"
          class="backstage-filters__search-bar"
        >
          <mat-label>Search repositories</mat-label>
          <input
            matInput
            placeholder="Name, description, topic"
            [value]="searchTerm()"
            (input)="onInput($event)"
            aria-label="Search repositories"
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
          <mat-label>Repository prefix</mat-label>
          <mat-select panelClass="ngx-design-system-overlay ngx-select-panel"
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
  styles: [`
    @use '@angular/material' as mat;
    :host { display: block; min-width: 0; @include mat.form-field-density(-3); }
    .backstage-filters__filters { display: grid; gap: 0.75rem; }
    .backstage-filters__filter-row { display: flex; flex-direction: column; align-items: stretch; gap: 1rem; }
    .backstage-filters__header { flex-direction: row; align-items: center; justify-content: space-between; }
    .backstage-filters__header h3 { margin: 0; font: var(--ngx-font-label); }
    mat-form-field { width: 100%; min-width: 0; }
    mat-slide-toggle { font-size: 0.75rem; }
  `],
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
