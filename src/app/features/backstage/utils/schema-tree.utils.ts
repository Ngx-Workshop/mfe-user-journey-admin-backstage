import {
  SchemaMap,
  SchemaObject,
  SchemaNode,
} from '../models/schema.models';

export function buildSchemaTree(
  schema: SchemaObject | null | undefined,
  name: string,
  components: SchemaMap
) {
  return new SchemaTreeBuilder(components).buildTree(schema, name);
}
class SchemaTreeBuilder {
  constructor(private readonly components: SchemaMap) {}
  private nodeId = 0;

  buildTree(schema: SchemaObject | null | undefined, name: string) {
    if (!schema) return null;
    this.nodeId = 0;
    return this.buildNode(
      schema,
      name,
      this.components,
      new Set<string>(),
      0,
      false
    );
  }

  private buildNode(
    schema: SchemaObject,
    name: string,
    components: SchemaMap,
    visitedRefs: Set<string>,
    depth: number,
    required: boolean
  ): SchemaNode {
    const id = this.nextId();
    if (schema.$ref) {
      if (visitedRefs.has(schema.$ref)) {
        return {
          id,
          name,
          typeLabel: this.refLabel(schema.$ref),
          circular: true,
          ref: schema.$ref,
          required,
          depth,
        };
      }
      const resolved = this.resolveRef(schema.$ref, components);
      if (!resolved) {
        return {
          id,
          name,
          typeLabel: this.refLabel(schema.$ref),
          ref: schema.$ref,
          required,
          depth,
        };
      }
      const nextVisited = new Set(visitedRefs);
      nextVisited.add(schema.$ref);
      const resolvedNode = this.buildNode(
        resolved,
        name,
        components,
        nextVisited,
        depth,
        required
      );
      return {
        ...resolvedNode,
        ref: schema.$ref,
      };
    }

    const typeLabel = this.getTypeLabel(schema);
    const enumValues = Array.isArray(schema.enum)
      ? schema.enum.map((value) => String(value))
      : undefined;

    const children = this.getChildren(
      schema,
      components,
      visitedRefs,
      depth
    );

    return {
      id,
      name,
      typeLabel,
      format: schema.format,
      required,
      description: schema.description,
      enumValues,
      children,
      depth,
    };
  }

  private getChildren(
    schema: SchemaObject,
    components: SchemaMap,
    visitedRefs: Set<string>,
    depth: number
  ): SchemaNode[] | undefined {
    const children: SchemaNode[] = [];

    if (schema.properties) {
      const requiredSet = new Set(schema.required ?? []);
      Object.entries(schema.properties).forEach(
        ([propName, propSchema]) => {
          children.push(
            this.buildNode(
              propSchema,
              propName,
              components,
              new Set(visitedRefs),
              depth + 1,
              requiredSet.has(propName)
            )
          );
        }
      );
    }

    if (schema.items) {
      if (Array.isArray(schema.items)) {
        schema.items.forEach((itemSchema, index) => {
          children.push(
            this.buildNode(
              itemSchema,
              `items[${index}]`,
              components,
              new Set(visitedRefs),
              depth + 1,
              false
            )
          );
        });
      } else {
        children.push(
          this.buildNode(
            schema.items,
            'items',
            components,
            new Set(visitedRefs),
            depth + 1,
            false
          )
        );
      }
    }

    for (const kind of ['oneOf', 'anyOf', 'allOf'] as const) {
      schema[kind]?.forEach((child, index) => {
        children.push(
          this.buildNode(
            child,
            kind + '[' + (index + 1) + ']',
            components,
            new Set(visitedRefs),
            depth + 1,
            false
          )
        );
      });
    }

    if (
      schema.additionalProperties &&
      typeof schema.additionalProperties === 'object'
    ) {
      children.push(
        this.buildNode(
          schema.additionalProperties,
          'additionalProperties',
          components,
          new Set(visitedRefs),
          depth + 1,
          false
        )
      );
    }

    return children.length > 0 ? children : undefined;
  }

  private resolveRef(ref: string, components: SchemaMap) {
    const match = ref.match(/^#\/components\/schemas\/(.+)$/);
    if (!match) return null;
    const key = decodeURIComponent(match[1]);
    return components[key] ?? null;
  }

  private getTypeLabel(schema: SchemaObject): string {
    if (schema.type) return schema.type;
    if (schema.properties) return 'object';
    if (schema.items) return 'array';
    if (schema.oneOf) return 'oneOf';
    if (schema.anyOf) return 'anyOf';
    if (schema.allOf) return 'allOf';
    return 'unknown';
  }

  private refLabel(ref: string) {
    const match = ref.match(/#\/components\/schemas\/(.+)$/);
    const name = match ? decodeURIComponent(match[1]) : ref;
    return `ref: ${name}`;
  }

  private nextId() {
    this.nodeId += 1;
    return `schema-node-${this.nodeId}`;
  }
}
