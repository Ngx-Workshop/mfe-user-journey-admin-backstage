import {
  buildGroups,
  filterGroups,
  parseOpenApi,
  contentEntries,
  toResponseEntries,
} from '../../../../../src/app/features/backstage/utils/openapi.utils';
import { buildSchemaTree } from '../../../../../src/app/features/backstage/utils/schema-tree.utils';

describe('viewer projections', () => {
  it('reports invalid JSON/arrays and invalid document containers', () => {
    for (const value of [
      'invalid',
      '[]',
      '{"tags":"bad"}',
      '{"paths":[]}',
    ]) {
      expect(parseOpenApi(value).error).toBeTruthy();
    }
    expect(parseOpenApi('').error).toBeUndefined();
  });
  it('groups by tag, overrides inherited parameters and filters case-insensitively', () => {
    const groups = buildGroups({
      tags: [{ name: 'Users' }],
      paths: {
        '/users': {
          parameters: [{ name: 'id', in: 'query', required: false }],
          get: {
            tags: ['Users'],
            summary: 'List users',
            parameters: [{ name: 'id', in: 'query', required: true }],
          },
          post: { summary: 'Create' },
        },
      },
    });
    expect(groups.map((g) => g.tag)).toEqual(['Users', 'default']);
    expect(groups[0].operations[0].parameters.length).toBe(1);
    expect(groups[0].operations[0].parameters[0].required).toBeTrue();
    expect(filterGroups(groups, ' LIST ')[0].operations.length).toBe(
      1
    );
    expect(filterGroups(groups, 'missing')).toEqual([]);
  });
  it('retains falsy examples and orders numeric responses', () => {
    expect(
      contentEntries({ 'application/json': { example: false } })[0]
        .example
    ).toBeFalse();
    expect(
      toResponseEntries({ '404': {}, '200': {}, default: {} }).map(
        (r) => r.status
      )
    ).toEqual(['200', '404', 'default']);
  });
  it('terminates circular references while preserving required properties', () => {
    const schema = {
      properties: { next: { $ref: '#/components/schemas/Node' } },
      required: ['next'],
    };
    const root = buildSchemaTree(
      { $ref: '#/components/schemas/Node' },
      'Node',
      { Node: schema }
    );
    expect(root?.children?.[0].circular).toBeTrue();
    expect(root?.children?.[0].required).toBeTrue();
    expect(buildSchemaTree(undefined, 'Schema', {})).toBeNull();
  });
});
