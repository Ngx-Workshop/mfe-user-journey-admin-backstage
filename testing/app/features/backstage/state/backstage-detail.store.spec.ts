import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import {
  ServiceDetailDto,
  DocBlobDto,
} from '@tmdjr/backstage-contracts';
import { BackstageApiClient } from '../../../../../src/app/features/backstage/api/backstage-api-client.service';
import { BackstageDetailStore } from '../../../../../src/app/features/backstage/state/backstage-detail.store';

describe('BackstageDetailStore', () => {
  let store: BackstageDetailStore;
  let details: Subject<ServiceDetailDto>[];
  let docs: Subject<DocBlobDto>[];
  const service = (repoName: string): ServiceDetailDto => ({
    repoName,
    topics: [],
    syncStatus: 'ok',
  });
  beforeEach(() => {
    details = [];
    docs = [];
    TestBed.configureTestingModule({
      providers: [
        {
          provide: BackstageApiClient,
          useValue: {
            getService: () => {
              const s = new Subject<ServiceDetailDto>();
              details.push(s);
              return s;
            },
            getDocument: () => {
              const s = new Subject<DocBlobDto>();
              docs.push(s);
              return s;
            },
          },
        },
      ],
    });
    store = TestBed.inject(BackstageDetailStore);
  });
  it('cancels same-repo refresh and ignores stale detail responses', () => {
    store.loadDetail('repo');
    store.loadDetail('repo', true);
    expect(details[0].observed).toBeFalse();
    details[1].next({
      ...service('repo'),
      description: 'new',
      readme: { content: 'readme' },
    });
    details[0].next({ ...service('repo'), description: 'old' });
    expect(store.detailState().service?.description).toBe('new');
  });
  it('loads missing initial README and cancels documents on navigation', () => {
    store.loadDetail('a');
    details[0].next(service('a'));
    expect(docs.length).toBe(1);
    store.loadDetail('b');
    expect(docs[0].observed).toBeFalse();
    docs[0].next({ content: 'stale' });
    details[1].next(service('b'));
    docs[1].next({ content: 'current' });
    expect(store.docStates().readme.data?.content).toBe('current');
  });
  it('cancels same-kind reloads, allows concurrent kinds and preserves independent results', () => {
    store.loadDetail('a');
    details[0].next({
      ...service('a'),
      readme: { content: 'cached' },
    });
    store.fetchDoc('openapi');
    store.fetchDoc('metadata');
    store.fetchDoc('openapi', true);
    expect(docs[0].observed).toBeFalse();
    expect(docs[1].observed).toBeTrue();
    docs[1].next({ content: '{"meta":true}' });
    docs[2].next({ content: '{"openapi":"3.0.0"}' });
    expect(store.docStates().metadata.data?.content).toContain(
      'meta'
    );
    expect(store.docStates().openapi.loading).toBeFalse();
  });
  it('recovers from document and detail access denial and clears on leaving', () => {
    store.loadDetail('a');
    details[0].error({ status: 403 });
    expect(store.detailState().unauthorized).toBeTrue();
    store.loadDetail('a');
    details[1].next(service('a'));
    docs[0].error({ status: 401 });
    expect(store.docStates().readme.unauthorized).toBeTrue();
    store.fetchDoc('readme', true);
    docs[1].next({ content: 'recovered' });
    expect(store.docStates().readme.error).toBeUndefined();
    store.clear();
    expect(store.detailState()).toEqual({ loading: false });
    expect(docs[1].observed).toBeFalse();
  });
});
