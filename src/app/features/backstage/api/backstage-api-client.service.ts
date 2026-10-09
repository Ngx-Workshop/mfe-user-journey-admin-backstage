import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  DocBlobDto,
  ServiceDetailDto,
  ServiceSummaryDto,
  SyncRequestDto,
  SyncResponseDto,
} from '@tmdjr/backstage-contracts';
import { Observable, map } from 'rxjs';
import { DocKind } from '../models/backstage-state.models';

export type DocInclude =
  'readme' | 'openapi' | 'runbook' | 'metadata';

@Injectable({ providedIn: 'root' })
export class BackstageApiClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/';

  listServices(params?: {
    q?: string;
    include?: DocInclude[];
    refresh?: boolean;
  }): Observable<ServiceSummaryDto[]> {
    let httpParams = new HttpParams();

    if (params?.q?.trim())
      httpParams = httpParams.set('q', params.q.trim());
    if (params?.include?.length)
      httpParams = httpParams.set(
        'include',
        params.include.join(',')
      );
    if (typeof params?.refresh === 'boolean')
      httpParams = httpParams.set('refresh', String(params.refresh));

    return this.http.get<ServiceSummaryDto[]>(
      this.buildUrl('/backstage/services'),
      { params: httpParams }
    );
  }

  getService(
    repo: string,
    params?: { refresh?: boolean }
  ): Observable<ServiceDetailDto> {
    let httpParams = new HttpParams();
    if (typeof params?.refresh === 'boolean')
      httpParams = httpParams.set('refresh', String(params.refresh));

    return this.http.get<ServiceDetailDto>(
      this.buildUrl(
        `/backstage/services/${encodeURIComponent(repo)}`
      ),
      { params: httpParams }
    );
  }

  syncServices(body: SyncRequestDto): Observable<SyncResponseDto> {
    return this.http.post<SyncResponseDto>(
      this.buildUrl('/backstage/sync'),
      body
    );
  }

  getReadme(repo: string, refresh?: boolean): Observable<string> {
    return this.getDocBlob(repo, 'readme', refresh);
  }

  getOpenApi(repo: string, refresh?: boolean): Observable<string> {
    return this.getDocBlob(repo, 'openapi', refresh);
  }

  getRunbook(repo: string, refresh?: boolean): Observable<string> {
    return this.getDocBlob(repo, 'runbook', refresh);
  }

  getMetadata(repo: string, refresh?: boolean): Observable<string> {
    return this.getDocBlob(repo, 'metadata', refresh);
  }

  getDocument(
    repo: string,
    kind: DocKind,
    refresh = false
  ): Observable<DocBlobDto> {
    return this.getDocBlob(repo, kind, refresh).pipe(
      map((content) => {
        if (kind === 'readme' || kind === 'runbook') {
          return { content, format: 'markdown' as const };
        }
        // Metadata can also be YAML; only label JSON when it actually parses.
        try {
          JSON.parse(content);
          return { content, format: 'json' as const };
        } catch {
          return { content };
        }
      })
    );
  }

  private getDocBlob(
    repo: string,
    kind: DocInclude,
    refresh?: boolean
  ): Observable<string> {
    let params = new HttpParams();
    params = params.set('refresh', String(Boolean(refresh)));
    return this.http.get(
      this.buildUrl(
        `/backstage/services/${encodeURIComponent(repo)}/${kind}`
      ),
      { params, responseType: 'text' }
    );
  }

  private buildUrl(path: string): string {
    const base = (this.baseUrl || '').replace(/\/$/, '');
    return `${base}${path}`;
  }
}
