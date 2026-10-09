import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { DocKind } from '../models/backstage-state.models';
import { BackstageDetailStore } from '../state/backstage-detail.store';

@Injectable()
export class BackstageDetailViewModel {
  private readonly store = inject(BackstageDetailStore);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private repo: string | null = null;
  readonly detailState = this.store.detailState;
  readonly docStates = this.store.docStates;

  constructor() {
    inject(ActivatedRoute)
      .paramMap.pipe(
        map((params) => params.get('repo')),
        filter((repo): repo is string => !!repo),
        distinctUntilChanged(),
        takeUntilDestroyed()
      )
      .subscribe((repo) => {
        this.repo = repo;
        this.store.loadDetail(repo);
      });
    inject(DestroyRef).onDestroy(() => this.store.clear());
  }

  goBack() {
    void this.router.navigate(['/backstage']);
  }
  reload(refresh = false) {
    if (!this.repo) return;
    this.snackBar.open('Refreshing service', undefined, {
      duration: 1500,
    });
    this.store.loadDetail(this.repo, refresh);
  }
  openRepo() {
    const url = this.detailState().service?.htmlUrl;
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }
  onTabChange(kind: DocKind) {
    this.store.ensureDoc(kind);
  }
  reloadDoc(kind: DocKind, refresh = false) {
    this.store.fetchDoc(kind, refresh);
  }
}
