export type SchemaMap = Record<string, SchemaObject>;

export type SchemaObject = {
  $ref?: string;
  type?: string;
  description?: string;
  format?: string;
  nullable?: boolean;
  enum?: unknown[];
  properties?: Record<string, SchemaObject>;
  required?: string[];
  items?: SchemaObject | SchemaObject[];
  oneOf?: SchemaObject[];
  anyOf?: SchemaObject[];
  allOf?: SchemaObject[];
  additionalProperties?: boolean | SchemaObject;
};

export type SchemaNode = {
  id: string;
  name: string;
  typeLabel: string;
  format?: string;
  required?: boolean;
  description?: string;
  enumValues?: string[];
  children?: SchemaNode[];
  circular?: boolean;
  ref?: string;
  depth: number;
};
