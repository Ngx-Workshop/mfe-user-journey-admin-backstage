import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import {
  ServiceSummaryDto,
  SyncResponseDto,
} from '@tmdjr/backstage-contracts';
import { BackstageApiClient } from '../../../../../src/app/features/backstage/api/backstage-api-client.service';
import { BackstageCatalogStore } from '../../../../../src/app/features/backstage/state/backstage-catalog.store';

describe('BackstageCatalogStore', () => {
  let store: BackstageCatalogStore;
  let lists: Subject<ServiceSummaryDto[]>[];
  let syncs: Subject<SyncResponseDto>[];
  let api: jasmine.SpyObj<BackstageApiClient>;
  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(2026, 0, 1));
    lists = [];
    syncs = [];
    api = jasmine.createSpyObj('api', [
      'listServices',
      'getService',
      'syncServices',
    ]);
    api.listServices.and.callFake(() => {
      const s = new Subject<ServiceSummaryDto[]>();
      lists.push(s);
      return s;
    });
    api.syncServices.and.callFake(() => {
      const s = new Subject<SyncResponseDto>();
      syncs.push(s);
      return s;
    });
    TestBed.configureTestingModule({
      providers: [{ provide: BackstageApiClient, useValue: api }],
    });
    store = TestBed.inject(BackstageCatalogStore);
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    jasmine.clock().uninstall();
  });
  it('debounces and cancels old searches, and toggles includes once', () => {
    jasmine.clock().tick(300);
    store.setQuery('a');
    store.setQuery('ab');
    jasmine.clock().tick(300);
    expect(api.listServices).toHaveBeenCalledTimes(2);
    expect(lists[0].observed).toBeFalse();
    store.setIncludeDocs(true);
    expect(api.listServices).toHaveBeenCalledTimes(3);
    expect(lists[1].observed).toBeFalse();
    expect(
      api.listServices.calls.mostRecent().args[0]?.include
    ).toEqual(['readme', 'openapi', 'runbook', 'metadata']);
    lists[2].next([]);
    expect(store.listState().loading).toBeFalse();
  });
  it('recovers from catalog denial and retries', () => {
    jasmine.clock().tick(300);
    lists[0].error({ status: 401 });
    expect(store.listState().unauthorized).toBeTrue();
    store.refreshList();
    lists[1].next([]);
    expect(store.listState().error).toBeUndefined();
  });
  it('ignores duplicate sync commands and permits retry after error', () => {
    store.syncAll();
    store.syncAll();
    expect(api.syncServices).toHaveBeenCalledTimes(1);
    syncs[0].error({ status: 500 });
    expect(store.syncState().loading).toBeFalse();
    store.syncAll();
    const result = {
      total: 2,
      succeeded: 1,
      failed: 1,
      durationMs: 5,
      failures: ['a'],
    };
    syncs[1].next(result);
    syncs[1].complete();
    expect(store.syncState().result).toEqual(result);
    expect(store.syncState().loading).toBeFalse();
  });
  it('updates refreshed cards without sorting or replacing unrelated services', () => {
    jasmine.clock().tick(300);
    lists[0].next([
      { repoName: 'a', topics: [], syncStatus: 'idle' },
      { repoName: 'b', topics: [], syncStatus: 'ok' },
    ]);
    const refresh = new Subject<ServiceSummaryDto>();
    api.getService.and.returnValue(refresh);
    store.refreshService('a');
    refresh.next({ repoName: 'a', topics: [], syncStatus: 'ok' });
    expect(store.listState().items.map((s) => s.syncStatus)).toEqual([
      'ok',
      'ok',
    ]);
  });
});
