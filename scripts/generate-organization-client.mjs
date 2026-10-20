// Read only an authoritative SDL exported by kabipay-organization; no live gateway fallback.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { generate } from '@graphql-codegen/cli';
import { preset } from '@graphql-codegen/client-preset';
import { buildSchema, Kind, parse, print, validate, visit } from 'graphql';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const argument = process.argv.indexOf('--schema-path');
if (argument === -1 || !process.argv[argument + 1]) {
  throw new Error('Pass --schema-path with the kabipay-organization export_schema SDL.');
}
const text = readFileSync(resolve(process.argv[argument + 1]), 'utf8');
const schema = buildSchema(text);
const source = resolve(root, 'src/api/documents/organization.graphql');
const errors = validate(schema, parse(readFileSync(source, 'utf8')));
if (errors.length) throw new Error(errors.map((error) => error.message).join('\n'));

// Keep the normal federated codegen contract synchronized with the dedicated client.
const ast = parse(text);
const roots = [schema.getQueryType(), schema.getMutationType()].filter(Boolean);
const names = new Set();
const extensions = roots.map((type, index) => {
  const fields = Object.values(type.getFields())
    .filter((field) => !field.name.startsWith('_'))
    .map((field) => field.astNode);
  if (fields.some((field) => !field))
    throw new Error('Organization fields must retain exported SDL definitions.');
  const extension = {
    ...type.astNode,
    kind: Kind.OBJECT_TYPE_EXTENSION,
    name: { kind: Kind.NAME, value: index === 0 ? 'Query' : 'Mutation' },
    fields,
  };
  visit(
    { kind: Kind.DOCUMENT, definitions: [extension] },
    {
      NamedType(node) {
        names.add(node.name.value);
      },
    }
  );
  return extension;
});
const definitions = [];
const pending = [...names];
const emitted = new Set(['Query', 'Mutation']);
while (pending.length) {
  const name = pending.pop();
  if (emitted.has(name)) continue;
  emitted.add(name);
  const definition = ast.definitions.find((item) => item.name?.value === name);
  if (!definition || name.startsWith('_')) continue;
  definitions.push(definition);
  visit(definition, {
    NamedType(node) {
      if (!emitted.has(node.name.value)) pending.push(node.name.value);
    },
  });
}
writeFileSync(
  resolve(root, 'src/api/schema-extensions/organization.graphql'),
  '# Generated from kabipay-organization export_schema SDL.\n' +
    print({ kind: Kind.DOCUMENT, definitions: [...definitions, ...extensions] }) +
    '\n'
);
await generate(
  {
    schema: text,
    documents: source,
    generates: {
      [resolve(root, 'src/api/organization') + '/']: {
        preset,
        presetConfig: { fragmentMasking: false, gqlTagName: 'organizationGraphql' },
        config: {
          onlyOperationTypes: true,
          useTypeImports: true,
          scalars: { JSON: 'unknown', UUID: 'string', DateTime: 'string', NaiveDate: 'string' },
        },
      },
    },
  },
  true
);
