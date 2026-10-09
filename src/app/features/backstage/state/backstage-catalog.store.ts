import { Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SyncRequestDto } from '@tmdjr/backstage-contracts';
import {
  BehaviorSubject,
  EMPTY,
  Subject,
  combineLatest,
  of,
} from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  exhaustMap,
  groupBy,
  map,
  mergeMap,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
import { BackstageApiClient } from '../api/backstage-api-client.service';
import {
  DOC_KINDS,
  ListState,
  SyncState,
  requestError,
} from '../models/backstage-state.models';

@Injectable({ providedIn: 'root' })
export class BackstageCatalogStore {
  private readonly api = inject(BackstageApiClient);
  private readonly queryInput = new BehaviorSubject('');
  private readonly includeInput = new BehaviorSubject(false);
  private readonly reload = new Subject<void>();
  private readonly refresh = new Subject<string>();
  private readonly sync = new Subject<SyncRequestDto>();
  private readonly searchValue = signal('');
  private readonly includeValue = signal(false);
  private readonly listValue = signal<ListState>({
    loading: true,
    items: [],
  });
  private readonly syncValue = signal<SyncState>({ loading: false });

  readonly search = this.searchValue.asReadonly();
  readonly includeDocs = this.includeValue.asReadonly();
  readonly listState = this.listValue.asReadonly();
  readonly syncState = this.syncValue.asReadonly();

  constructor() {
    combineLatest([
      this.queryInput.pipe(debounceTime(300), distinctUntilChanged()),
      this.includeInput.pipe(distinctUntilChanged()),
      this.reload.pipe(startWith(undefined)),
    ])
      .pipe(
        switchMap(([q, include]) =>
          this.api
            .listServices({
              q,
              include: include ? DOC_KINDS : undefined,
              refresh: false,
            })
            .pipe(
              map(
                (items) => ({ loading: false, items }) as ListState
              ),
              catchError((error) =>
                of({
                  ...requestError(error, 'Unable to load services'),
                  items: [],
                })
              ),
              startWith({
                ...this.listValue(),
                loading: true,
                error: undefined,
                unauthorized: false,
              })
            )
        ),
        takeUntilDestroyed()
      )
      .subscribe((state) => this.listValue.set(state));

    // Different cards can refresh independently; latest refresh for each repo wins.
    this.refresh
      .pipe(
        groupBy((repo) => repo),
        mergeMap((repos) =>
          repos.pipe(
            switchMap((repo) =>
              this.api.getService(repo, { refresh: true }).pipe(
                tap((service) =>
                  this.listValue.update((state) => ({
                    ...state,
                    items: state.items.map((item) =>
                      item.repoName === repo ? service : item
                    ),
                  }))
                ),
                catchError((error) => {
                  this.listValue.update((state) => ({
                    ...state,
                    ...requestError(error, 'Refresh failed'),
                    loading: state.loading,
                  }));
                  return EMPTY;
                })
              )
            )
          )
        ),
        takeUntilDestroyed()
      )
      .subscribe();

    this.sync
      .pipe(
        exhaustMap((body) => {
          this.syncValue.set({ loading: true });
          return this.api.syncServices(body).pipe(
            tap((result) => {
              this.syncValue.set({ loading: false, result });
              this.refreshList();
            }),
            catchError((error) => {
              this.syncValue.set(requestError(error, 'Sync failed'));
              return EMPTY;
            })
          );
        }),
        takeUntilDestroyed()
      )
      .subscribe();
  }

  setQuery(query: string) {
    this.searchValue.set(query);
    this.queryInput.next(query);
  }
  setIncludeDocs(include: boolean) {
    this.includeValue.set(include);
    this.includeInput.next(include);
  }
  refreshList() {
    this.reload.next();
  }
  refreshService(repo: string) {
    this.refresh.next(repo);
  }
  syncAll(body: SyncRequestDto = {}) {
    this.sync.next(body);
  }
}
