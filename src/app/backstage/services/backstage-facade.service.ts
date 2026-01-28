import {
  DestroyRef,
  Injectable,
  inject,
  signal,
} from '@angular/core';
import {
  DocBlobDto,
  ServiceDetailDto,
  ServiceSummaryDto,
  SyncRequestDto,
} from '@tmdjr/backstage-contracts';
import { BehaviorSubject, Subject, combineLatest, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
import {
  BackstageApiClient,
  type DocInclude,
} from './backstage-api-client.service';

export type DocKind = 'readme' | 'openapi' | 'runbook' | 'metadata';

export type DocState = {
  loading: boolean;
  data?: DocBlobDto | null;
  error?: string;
  unauthorized?: boolean;
};

type ListState = {
  loading: boolean;
  items: ServiceSummaryDto[];
  error?: string;
  unauthorized?: boolean;
};

type DetailState = {
  loading: boolean;
  service?: ServiceDetailDto;
  error?: string;
  unauthorized?: boolean;
};

@Injectable({ providedIn: 'root' })
export class BackstageFacadeService {
  private readonly api = inject(BackstageApiClient);
  private readonly destroyRef = inject(DestroyRef);

  readonly search = signal('');
  readonly includeDocs = signal(false);
  readonly listState = signal<ListState>({
    loading: true,
    items: [],
  });
  readonly detailState = signal<DetailState>({ loading: false });
  readonly docStates = signal<Record<DocKind, DocState>>(
    this.blankDocStates()
  );
  readonly activeRepo = signal<string | null>(null);
  readonly syncing = signal(false);

  private readonly listReload$ = new Subject<{ refresh?: boolean }>();
  private readonly search$ = new BehaviorSubject<string>(
    this.search()
  );
  private readonly includeDocs$ = new BehaviorSubject<boolean>(
    this.includeDocs()
  );

  constructor() {
    this.connectList();
  }

  private connectList() {
    const search$ = this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    );
    const include$ = this.includeDocs$.pipe(distinctUntilChanged());

    combineLatest([
      search$,
      include$,
      this.listReload$.pipe(startWith({})),
    ])
      .pipe(
        tap(() =>
          this.listState.update((state) => ({
            ...state,
            loading: true,
            error: undefined,
            unauthorized: false,
          }))
        ),
        switchMap(([q, include]) => {
          const includeParam: DocInclude[] | undefined = include
            ? ['readme', 'openapi', 'runbook', 'metadata']
            : undefined;
          return this.api
            .listServices({
              q,
              include: includeParam,
              refresh: false,
            })
            .pipe(
              tap((items) => {
                this.listState.set({ loading: false, items });
              }),
              catchError((err) => {
                const unauthorized =
                  err?.status === 401 || err?.status === 403;
                const fallback: ListState = {
                  loading: false,
                  items: [],
                  error: unauthorized
                    ? 'Unauthorized'
                    : 'Unable to load services',
                  unauthorized,
                };
                this.listState.set(fallback);
                return of([] as ServiceSummaryDto[]);
              })
            );
        })
      )
      .subscribe();
  }

  refreshList() {
    this.listReload$.next({});
  }

  setQuery(q: string) {
    this.search.set(q);
    this.search$.next(q);
  }

  setIncludeDocs(value: boolean) {
    this.includeDocs.set(value);
    this.includeDocs$.next(value);
  }

  refreshService(repo: string) {
    this.api
      .getService(repo, { refresh: true })

      .subscribe({
        next: (service) => {
          const current = this.listState();
          const items = [...current.items];
          const idx = items.findIndex(
            (i) => i.repoName === service.repoName
          );
          if (idx >= 0) items[idx] = service;
          this.listState.set({ ...current, items, loading: false });
          if (this.activeRepo() === repo) {
            this.detailState.set({ loading: false, service });
            this.patchDocStates(service);
          }
        },
        error: (err) => {
          const unauthorized =
            err?.status === 401 || err?.status === 403;
          this.listState.update((state) => ({
            ...state,
            error: unauthorized ? 'Unauthorized' : 'Refresh failed',
            unauthorized,
          }));
        },
      });
  }

  loadDetail(repo: string, opts?: { refresh?: boolean }) {
    this.activeRepo.set(repo);
    this.detailState.set({ loading: true });
    this.docStates.set(this.blankDocStates());

    this.api
      .getService(repo, { refresh: opts?.refresh })

      .subscribe({
        next: (service) => {
          if (this.activeRepo() !== repo) return;
          this.detailState.set({ loading: false, service });
          this.patchDocStates(service);
        },
        error: (err) => {
          const unauthorized =
            err?.status === 401 || err?.status === 403;
          if (this.activeRepo() !== repo) return;
          this.detailState.set({
            loading: false,
            error: unauthorized
              ? 'Unauthorized'
              : 'Unable to load service',
            unauthorized,
          });
        },
      });
  }

  fetchDoc(
    kind: DocKind,
    opts?: { repo?: string; refresh?: boolean }
  ) {
    const repo = opts?.repo ?? this.activeRepo();
    if (!repo) return;

    this.docStates.update((docs) => ({
      ...docs,
      [kind]: {
        ...docs[kind],
        loading: true,
        error: undefined,
        unauthorized: false,
      },
    }));

    this.getDocRequest(kind, repo, opts?.refresh).subscribe({
      next: (blob) => {
        if (this.activeRepo() !== repo) return;
        this.docStates.update((docs) => ({
          ...docs,
          [kind]: { loading: false, data: blob },
        }));
        this.detailState.update((state) => {
          if (!state.service) return state;
          const updated = { ...state.service } as any;
          if (kind === 'metadata') updated.serviceMetadata = blob;
          else updated[kind] = blob;
          return { ...state, service: updated };
        });
      },
      error: (err) => {
        if (this.activeRepo() !== repo) return;
        const unauthorized =
          err?.status === 401 || err?.status === 403;
        this.docStates.update((docs) => ({
          ...docs,
          [kind]: {
            loading: false,
            data: docs[kind].data,
            error: unauthorized
              ? 'Unauthorized'
              : 'Unable to load document',
            unauthorized,
          },
        }));
      },
    });
  }

  syncAll(body: SyncRequestDto) {
    this.syncing.set(true);
    return this.api.syncServices(body).pipe(
      tap({
        next: () => {
          this.syncing.set(false);
          this.refreshList();
        },
        error: () => this.syncing.set(false),
      })
    );
  }

  private getDocRequest(
    kind: DocKind,
    repo: string,
    refresh?: boolean
  ) {
    switch (kind) {
      case 'readme':
        return this.api.getReadme(repo, refresh);
      case 'openapi':
        return this.api.getOpenApi(repo, refresh);
      case 'runbook':
        return this.api.getRunbook(repo, refresh);
      case 'metadata':
      default:
        return this.api.getMetadata(repo, refresh);
    }
  }

  private patchDocStates(service: ServiceDetailDto) {
    this.docStates.update((docs) => ({
      readme: {
        loading: false,
        data: service.readme ?? docs.readme.data ?? null,
      },
      openapi: {
        loading: false,
        data: service.openapi ?? docs.openapi.data ?? null,
      },
      runbook: {
        loading: false,
        data: service.runbook ?? docs.runbook.data ?? null,
      },
      metadata: {
        loading: false,
        data:
          (service as any).serviceMetadata ??
          docs.metadata.data ??
          null,
      },
    }));
  }

  private blankDocStates(): Record<DocKind, DocState> {
    return {
      readme: { loading: false, data: null },
      openapi: { loading: false, data: null },
      runbook: { loading: false, data: null },
      metadata: { loading: false, data: null },
    };
  }
}
