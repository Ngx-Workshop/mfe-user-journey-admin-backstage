import {
  HTTP_METHODS,
  JsonRecord,
  OpenApiDocument,
  OpenApiOperation,
  OpenApiParameter,
  OpenApiSchema,
  OpenApiMediaType,
  OpenApiResponse,
  OperationGroup,
  OperationItem,
  ParseResult,
} from '../models/openapi.models';

export function parseOpenApi(content: string): ParseResult {
  if (!content) return {};
  try {
    const parsed = JSON.parse(content) as unknown;
    if (!isRecord(parsed)) {
      return { error: 'OpenAPI document must be a JSON object.' };
    }
    if (
      (parsed['paths'] !== undefined && !isRecord(parsed['paths'])) ||
      (parsed['tags'] !== undefined &&
        (!Array.isArray(parsed['tags']) ||
          !parsed['tags'].every(
            (tag) => isRecord(tag) && typeof tag['name'] === 'string'
          )))
    )
      return { error: 'Invalid OpenAPI paths or tags.' };
    return { doc: parsed as OpenApiDocument };
  } catch {
    return { error: 'Unable to parse OpenAPI document.' };
  }
}

export function buildGroups(
  doc: OpenApiDocument | undefined
): OperationGroup[] {
  if (!doc?.paths) return [];
  const tagDescriptions = new Map(
    (doc.tags ?? []).map((tag) => [tag.name, tag.description])
  );
  const tagOrder = (doc.tags ?? []).map((tag) => tag.name);
  const groups = new Map<string, OperationItem[]>();

  Object.entries(doc.paths).forEach(([path, pathItem]) => {
    if (!isRecord(pathItem)) return;
    const pathParams = getParameters(pathItem.parameters);
    HTTP_METHODS.forEach((method) => {
      const opCandidate = pathItem[method] as unknown;
      if (!isRecord(opCandidate)) return;
      const operation = opCandidate as OpenApiOperation;
      const tags = operation.tags?.length
        ? operation.tags
        : ['default'];
      const parameters = Array.from(
        new Map(
          [...pathParams, ...getParameters(operation.parameters)].map(
            (param) => [param.in + ':' + param.name, param]
          )
        ).values()
      );
      const opItem: OperationItem = {
        id: `${method.toUpperCase()} ${path}`,
        method,
        path,
        summary:
          operation.summary ||
          operation.operationId ||
          `${method.toUpperCase()} ${path}`,
        description: operation.description,
        operationId: operation.operationId,
        tags,
        parameters,
        requestBody: operation.requestBody,
        responses: operation.responses ?? {},
      };
      tags.forEach((tag) => {
        const list = groups.get(tag) ?? [];
        list.push(opItem);
        groups.set(tag, list);
      });
    });
  });

  const sortedTags = [
    ...tagOrder,
    ...Array.from(groups.keys()).filter(
      (tag) => !tagOrder.includes(tag)
    ),
  ];

  return sortedTags
    .filter((tag) => groups.has(tag))
    .map((tag) => ({
      tag,
      description: tagDescriptions.get(tag),
      operations: groups.get(tag) ?? [],
    }));
}

export function filterGroups(
  groups: OperationGroup[],
  query: string
) {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return groups;
  return groups
    .map((group) => ({
      ...group,
      operations: group.operations.filter((op) =>
        matchesQuery(op, trimmed)
      ),
    }))
    .filter((group) => group.operations.length > 0);
}

export function matchesQuery(op: OperationItem, query: string) {
  const target = [
    op.path,
    op.summary,
    op.operationId ?? '',
    op.tags.join(' '),
    op.method,
  ]
    .join(' ')
    .toLowerCase();
  return target.includes(query);
}

export function getParameters(value: unknown): OpenApiParameter[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isParameter) as OpenApiParameter[];
}

const isParameter = (value: unknown): value is OpenApiParameter => {
  if (!isRecord(value)) return false;
  return (
    typeof value['name'] === 'string' &&
    typeof value['in'] === 'string'
  );
};

export function schemaLabel(schema: OpenApiSchema | undefined) {
  if (!schema) return '—';
  if (schema.$ref) return refLabel(schema.$ref);
  if (schema.type) {
    return schema.format
      ? `${schema.type} (${schema.format})`
      : schema.type;
  }
  if (schema.oneOf) return 'oneOf';
  if (schema.anyOf) return 'anyOf';
  if (schema.allOf) return 'allOf';
  return 'schema';
}

export function refLabel(ref: string) {
  const match = ref.match(/#\/components\/schemas\/(.+)$/);
  return match ? decodeURIComponent(match[1]) : ref;
}

export function contentEntries(
  content: Record<string, OpenApiMediaType>
) {
  return Object.entries(content).map(([mediaType, media]) => ({
    mediaType,
    schema: media.schema,
    example: pickExample(media),
  }));
}

export function pickExample(media: OpenApiMediaType) {
  if (media.example !== undefined) return media.example;
  if (media.examples) {
    const first = Object.values(media.examples)[0];
    return first?.value;
  }
  return undefined;
}

export function toResponseEntries(
  responses: Record<string, OpenApiResponse>
) {
  const entries = Object.entries(responses).map(
    ([status, response]) => ({
      status,
      description: response.description,
      content: response.content,
    })
  );
  return entries.sort((a, b) => sortStatus(a.status, b.status));
}

export function sortStatus(a: string, b: string) {
  const aNum = Number(a);
  const bNum = Number(b);
  if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
    return aNum - bNum;
  }
  return a.localeCompare(b);
}

export function isRecord(value: unknown): value is JsonRecord {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}
