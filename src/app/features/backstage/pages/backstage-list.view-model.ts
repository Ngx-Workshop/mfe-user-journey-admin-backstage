import { Injectable, effect, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BackstageCatalogStore } from '../state/backstage-catalog.store';

@Injectable()
export class BackstageListViewModel {
  private readonly store = inject(BackstageCatalogStore);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  readonly search = this.store.search;
  readonly includeDocs = this.store.includeDocs;
  readonly listState = this.store.listState;
  readonly syncState = this.store.syncState;

  constructor() {
    let previous = this.syncState();
    effect(() => {
      const state = this.syncState();
      if (state === previous) return;
      previous = state;
      if (state.loading)
        this.snackBar.open('Sync started', undefined, {
          duration: 1500,
        });
      else if (state.result)
        this.snackBar.open(
          `Sync finished: ${state.result.succeeded}/${state.result.total} succeeded`,
          'Dismiss',
          { duration: 3500 }
        );
      else if (state.error)
        this.snackBar.open(state.error, 'Dismiss', {
          duration: 3000,
        });
    });
  }
  setQuery(query: string) {
    this.store.setQuery(query);
  }
  setIncludeDocs(include: boolean) {
    this.store.setIncludeDocs(include);
  }
  view(repo: string) {
    void this.router.navigate(['/backstage/details', repo]);
  }
  refresh(repo: string) {
    this.snackBar.open('Refreshing service...', undefined, {
      duration: 1500,
    });
    this.store.refreshService(repo);
  }
  refreshList() {
    this.store.refreshList();
  }
  syncAll() {
    this.store.syncAll();
  }
}
