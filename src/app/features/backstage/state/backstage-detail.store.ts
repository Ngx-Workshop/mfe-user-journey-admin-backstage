import { Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject } from 'rxjs';
import {
  catchError,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { BackstageApiClient } from '../api/backstage-api-client.service';
import {
  DOC_KINDS,
  DetailState,
  DocKind,
  blankDocStates,
  requestError,
  serviceDocs,
} from '../models/backstage-state.models';

@Injectable({ providedIn: 'root' })
export class BackstageDetailStore {
  private readonly api = inject(BackstageApiClient);
  private readonly selection = new Subject<{
    repo: string;
    refresh?: boolean;
  } | null>();
  private readonly cancelDocs = new Subject<void>();
  private readonly docRequests = new Map<DocKind, Subject<boolean>>();
  private readonly detailValue = signal<DetailState>({
    loading: false,
  });
  private readonly docsValue = signal(blankDocStates());
  private repo: string | null = null;

  readonly detailState = this.detailValue.asReadonly();
  readonly docStates = this.docsValue.asReadonly();

  constructor() {
    this.selection
      .pipe(
        switchMap((command) => {
          this.docsValue.set(blankDocStates());
          this.detailValue.set({ loading: !!command });
          if (!command) return EMPTY;
          return this.api
            .getService(command.repo, { refresh: command.refresh })
            .pipe(
              tap((service) => {
                this.detailValue.set({ loading: false, service });
                this.docsValue.set(serviceDocs(service));
                this.ensureDoc('readme');
              }),
              catchError((error) => {
                this.detailValue.set(
                  requestError(error, 'Unable to load service')
                );
                return EMPTY;
              })
            );
        }),
        takeUntilDestroyed()
      )
      .subscribe();

    for (const kind of DOC_KINDS) {
      const requests = new Subject<boolean>();
      this.docRequests.set(kind, requests);
      requests
        .pipe(
          switchMap((refresh) => {
            if (!this.repo) return EMPTY;
            this.docsValue.update((docs) => ({
              ...docs,
              [kind]: {
                ...docs[kind],
                loading: true,
                error: undefined,
                unauthorized: false,
              },
            }));
            return this.api
              .getDocument(this.repo, kind, refresh)
              .pipe(
                tap((data) =>
                  this.docsValue.update((docs) => ({
                    ...docs,
                    [kind]: { loading: false, data },
                  }))
                ),
                catchError((error) => {
                  this.docsValue.update((docs) => ({
                    ...docs,
                    [kind]: {
                      data: docs[kind].data,
                      ...requestError(
                        error,
                        'Unable to load document'
                      ),
                    },
                  }));
                  return EMPTY;
                }),
                takeUntil(this.cancelDocs)
              );
          }),
          takeUntilDestroyed()
        )
        .subscribe();
    }
  }

  loadDetail(repo: string, refresh = false) {
    this.cancelDocs.next();
    this.repo = repo;
    this.selection.next({ repo, refresh });
  }
  clear() {
    this.cancelDocs.next();
    this.repo = null;
    this.selection.next(null);
  }
  ensureDoc(kind: DocKind) {
    const doc = this.docStates()[kind];
    if (!doc.data && !doc.loading) this.fetchDoc(kind);
  }
  fetchDoc(kind: DocKind, refresh = false) {
    if (!this.repo || this.detailState().loading) return;
    this.docRequests.get(kind)?.next(refresh);
  }
}
