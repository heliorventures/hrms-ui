// Generate Loans contracts from the actual Payroll host without starting a server.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generate } from '@graphql-codegen/cli';
import { preset } from '@graphql-codegen/client-preset';
import { buildSchema, parse, print, validate, visit, Kind, getNamedType } from 'graphql';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'src/api/documents/loans.graphql');
const index = process.argv.indexOf('--schema-path');
if (index !== -1 && !process.argv[index + 1]) throw new Error('--schema-path requires an exported Payroll SDL file');
const text = index !== -1
  ? readFileSync(resolve(process.argv[index + 1]), 'utf8')
  : execFileSync('rtk', ['proxy', 'cargo', 'run', '--quiet', '--offline', '-p', 'kabipay-payroll', '--example', 'export_schema'], {
      cwd: resolve(root, '../hrms-svc'), encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'], maxBuffer: 16 * 1024 * 1024,
    });
const schema = buildSchema(text);
const errors = validate(schema, parse(readFileSync(source, 'utf8')));
if (errors.length) throw new Error(errors.map((error) => error.message).join('\n'));

// Generate the full-codegen extension from the same authoritative SDL, including inputs.
const ast = parse(text);
const names = new Set();
const roots = [];
for (const [type, name] of [[schema.getQueryType(), 'Query'], [schema.getMutationType(), 'Mutation']]) {
  const selected = Object.values(type.getFields()).filter((field) => getNamedType(field.type).name.startsWith('Loan'));
  const fields = selected.map((field) => field.astNode);
  if (fields.some((field) => !field)) throw new Error('Exported Loan fields must retain their schema definitions');
  visit({ kind: Kind.DOCUMENT, definitions: [{ ...type.astNode, fields }] }, { NamedType(node) { names.add(node.name.value); } });
  roots.push({ ...type.astNode, kind: Kind.OBJECT_TYPE_EXTENSION, name: { kind: Kind.NAME, value: name }, fields });
}
const definitions = [];
const pending = [...names];
const emitted = new Set();
while (pending.length) {
  const name = pending.pop();
  if (emitted.has(name)) continue;
  emitted.add(name);
  const definition = ast.definitions.find((item) => item.name?.value === name);
  if (!definition) continue; // GraphQL built-in scalars.
  definitions.push(definition);
  visit(definition, { NamedType(node) { if (!emitted.has(node.name.value)) pending.push(node.name.value); } });
}
writeFileSync(resolve(root, 'src/api/schema-extensions/loans.graphql'), '# Generated from the Payroll service SDL by generate-loans-client.mjs.\n' + print({ kind: Kind.DOCUMENT, definitions: [...definitions, ...roots] }) + '\n');
await generate({
  schema: text, documents: source,
  generates: { [resolve(root, 'src/api/loans') + '/']: {
    preset, presetConfig: { fragmentMasking: false, gqlTagName: 'loansGraphql' },
    config: { onlyOperationTypes: true, useTypeImports: true, scalars: { JSON: 'unknown', DateTime: 'string', NaiveDate: 'string' } },
  } },
}, true);
