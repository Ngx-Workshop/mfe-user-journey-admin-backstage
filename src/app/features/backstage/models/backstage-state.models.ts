import {
  DocBlobDto,
  ServiceDetailDto,
  ServiceSummaryDto,
  SyncResponseDto,
} from '@tmdjr/backstage-contracts';

export type DocKind = 'readme' | 'openapi' | 'runbook' | 'metadata';
export const DOC_KINDS: DocKind[] = [
  'readme',
  'openapi',
  'runbook',
  'metadata',
];
export interface RequestState {
  loading: boolean;
  error?: string;
  unauthorized?: boolean;
}
export interface ListState extends RequestState {
  items: ServiceSummaryDto[];
}
export interface DetailState extends RequestState {
  service?: ServiceDetailDto;
}
export interface DocState extends RequestState {
  data?: DocBlobDto | null;
}
export interface SyncState extends RequestState {
  result?: SyncResponseDto;
}
export type DocStates = Record<DocKind, DocState>;

export function blankDocStates(): DocStates {
  return {
    readme: { loading: false, data: null },
    openapi: { loading: false, data: null },
    runbook: { loading: false, data: null },
    metadata: { loading: false, data: null },
  };
}
export function serviceDocs(service: ServiceDetailDto): DocStates {
  return {
    readme: { loading: false, data: service.readme ?? null },
    openapi: { loading: false, data: service.openapi ?? null },
    runbook: { loading: false, data: service.runbook ?? null },
    metadata: {
      loading: false,
      data: service.serviceMetadata ?? null,
    },
  };
}
export function requestError(
  error: unknown,
  fallback: string
): RequestState {
  const status = (error as { status?: number } | null)?.status;
  const unauthorized = status === 401 || status === 403;
  return {
    loading: false,
    error: unauthorized ? 'Unauthorized' : fallback,
    unauthorized,
  };
}
