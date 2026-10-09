export type JsonRecord = Record<string, unknown>;

export type OpenApiDocument = {
  openapi?: string;
  info?: OpenApiInfo;
  servers?: OpenApiServer[];
  tags?: OpenApiTag[];
  paths?: Record<string, OpenApiPathItem>;
  components?: {
    schemas?: Record<string, OpenApiSchema>;
  };
};

export type OpenApiInfo = {
  title?: string;
  version?: string;
  description?: string;
};

export type OpenApiServer = {
  url?: string;
  description?: string;
};

export type OpenApiTag = {
  name: string;
  description?: string;
};

export type OpenApiPathItem = {
  parameters?: OpenApiParameter[];
} & Record<string, unknown>;

export type OpenApiOperation = {
  summary?: string;
  operationId?: string;
  description?: string;
  tags?: string[];
  parameters?: OpenApiParameter[];
  requestBody?: OpenApiRequestBody;
  responses?: Record<string, OpenApiResponse>;
};

export type OpenApiParameter = {
  name: string;
  in: string;
  required?: boolean;
  description?: string;
  schema?: OpenApiSchema;
};

export type OpenApiRequestBody = {
  description?: string;
  required?: boolean;
  content?: Record<string, OpenApiMediaType>;
};

export type OpenApiResponse = {
  description?: string;
  content?: Record<string, OpenApiMediaType>;
};

export type OpenApiMediaType = {
  schema?: OpenApiSchema;
  example?: unknown;
  examples?: Record<string, { value?: unknown }>;
};

export type OpenApiSchema = {
  $ref?: string;
  type?: string;
  format?: string;
  description?: string;
  enum?: unknown[];
  items?: OpenApiSchema | OpenApiSchema[];
  properties?: Record<string, OpenApiSchema>;
  required?: string[];
  oneOf?: OpenApiSchema[];
  anyOf?: OpenApiSchema[];
  allOf?: OpenApiSchema[];
  additionalProperties?: boolean | OpenApiSchema;
};

export type HttpMethod =
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'options'
  | 'head'
  | 'trace';

export const HTTP_METHODS: HttpMethod[] = [
  'get',
  'post',
  'put',
  'delete',
  'patch',
  'options',
  'head',
  'trace',
];

export type OperationItem = {
  id: string;
  method: HttpMethod;
  path: string;
  summary: string;
  operationId?: string;
  description?: string;
  tags: string[];
  parameters: OpenApiParameter[];
  requestBody?: OpenApiRequestBody;
  responses: Record<string, OpenApiResponse>;
};

export type OperationGroup = {
  tag: string;
  description?: string;
  operations: OperationItem[];
};

export type ParseResult = {
  doc?: OpenApiDocument;
  error?: string;
};

export type ParameterRow = {
  name: string;
  location: string;
  required: boolean;
  schema: string;
  description: string;
};

export type RequestBodyEntry = {
  mediaType: string;
  schema?: OpenApiSchema;
  example?: unknown;
};

export type ResponseEntry = {
  status: string;
  description?: string;
  content?: Record<string, OpenApiMediaType>;
};
