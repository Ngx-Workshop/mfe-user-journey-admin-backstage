import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ActivatedRoute,
  Router,
  convertToParamMap,
} from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { BackstageDetailViewModel } from '../../../../../src/app/features/backstage/pages/backstage-detail.view-model';
import { BackstageListViewModel } from '../../../../../src/app/features/backstage/pages/backstage-list.view-model';
import { BackstageDetailStore } from '../../../../../src/app/features/backstage/state/backstage-detail.store';
import { BackstageCatalogStore } from '../../../../../src/app/features/backstage/state/backstage-catalog.store';

describe('Backstage page view models', () => {
  it('reacts to route changes once, releases detail ownership and tears down the route subscription', () => {
    const params = new BehaviorSubject(
      convertToParamMap({ repo: 'a' })
    );
    const store = jasmine.createSpyObj('detail', [
      'loadDetail',
      'clear',
      'ensureDoc',
      'fetchDoc',
    ]);
    store.detailState = signal({ loading: false });
    store.docStates = signal({});
    TestBed.configureTestingModule({
      providers: [
        BackstageDetailViewModel,
        { provide: ActivatedRoute, useValue: { paramMap: params } },
        {
          provide: Router,
          useValue: jasmine.createSpyObj('router', ['navigate']),
        },
        {
          provide: MatSnackBar,
          useValue: jasmine.createSpyObj('snack', ['open']),
        },
        { provide: BackstageDetailStore, useValue: store },
      ],
    });
    const vm = TestBed.inject(BackstageDetailViewModel);
    params.next(convertToParamMap({ repo: 'a' }));
    params.next(convertToParamMap({ repo: 'b' }));
    expect(store.loadDetail.calls.allArgs()).toEqual([['a'], ['b']]);
    vm.reload(true);
    expect(store.loadDetail).toHaveBeenCalledWith('b', true);
    vm.onTabChange('metadata');
    expect(store.ensureDoc).toHaveBeenCalledWith('metadata');
    vm.reloadDoc('openapi', true);
    expect(store.fetchDoc).toHaveBeenCalledWith('openapi', true);
    TestBed.resetTestingModule();
    expect(store.clear).toHaveBeenCalledTimes(1);
    expect(params.observed).toBeFalse();
  });
  it('routes list intent through the singleton store and preserves detail URLs', () => {
    const store = jasmine.createSpyObj('catalog', [
      'setQuery',
      'setIncludeDocs',
      'syncAll',
    ]);
    store.search = signal('');
    store.includeDocs = signal(false);
    store.listState = signal({ loading: false, items: [] });
    store.syncState = signal({ loading: false });
    const router = jasmine.createSpyObj('router', ['navigate']);
    TestBed.configureTestingModule({
      providers: [
        BackstageListViewModel,
        { provide: BackstageCatalogStore, useValue: store },
        { provide: Router, useValue: router },
        {
          provide: MatSnackBar,
          useValue: jasmine.createSpyObj('snack', ['open']),
        },
      ],
    });
    const vm = TestBed.inject(BackstageListViewModel);
    vm.setQuery('service-');
    vm.setIncludeDocs(true);
    vm.syncAll();
    vm.view('repo');
    expect(store.setQuery).toHaveBeenCalledWith('service-');
    expect(store.setIncludeDocs).toHaveBeenCalledOnceWith(true);
    expect(store.syncAll).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledWith([
      '/backstage/details',
      'repo',
    ]);
  });
});
