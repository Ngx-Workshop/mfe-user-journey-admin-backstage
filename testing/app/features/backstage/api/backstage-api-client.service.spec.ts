import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BackstageApiClient } from '../../../../../src/app/features/backstage/api/backstage-api-client.service';

describe('BackstageApiClient transport', () => {
  let api: BackstageApiClient;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(BackstageApiClient);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('maps list query and includes without state', () => {
    api
      .listServices({
        q: ' service- ',
        include: ['readme', 'metadata'],
        refresh: false,
      })
      .subscribe();
    const req = http.expectOne(
      (r) => r.url === '/api/backstage/services'
    );
    expect(req.request.params.get('q')).toBe('service-');
    expect(req.request.params.get('include')).toBe('readme,metadata');
    expect(req.request.params.get('refresh')).toBe('false');
    req.flush([]);
  });
  it('encodes repo paths and wraps raw documents for viewers', () => {
    const next = jasmine.createSpy();
    api.getDocument('org/repo', 'readme', true).subscribe(next);
    const req = http.expectOne(
      '/api/backstage/services/org%2Frepo/readme?refresh=true'
    );
    expect(req.request.responseType).toBe('text');
    req.flush('# README');
    expect(next).toHaveBeenCalledWith({
      content: '# README',
      format: 'markdown',
    });
  });
  it('preserves non-JSON metadata without a false format label', () => {
    const next = jasmine.createSpy();
    api.getDocument('repo', 'metadata').subscribe(next);
    http
      .expectOne(
        '/api/backstage/services/repo/metadata?refresh=false'
      )
      .flush('name: repo');
    expect(next).toHaveBeenCalledWith({ content: 'name: repo' });
  });
  it('sends the sync body unchanged', () => {
    api.syncServices({ repos: ['repo'], force: true }).subscribe();
    const req = http.expectOne('/api/backstage/sync');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      repos: ['repo'],
      force: true,
    });
    req.flush({
      total: 1,
      succeeded: 1,
      failed: 0,
      durationMs: 1,
      failures: [],
    });
  });
});
