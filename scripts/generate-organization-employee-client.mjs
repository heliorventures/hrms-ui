// Generate canonical employee reporting presentation from the Employee service export.
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { generate } from '@graphql-codegen/cli';
import { preset } from '@graphql-codegen/client-preset';
import { buildSchema, parse, validate } from 'graphql';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const argument = process.argv.indexOf('--schema-path');
if (argument === -1 || !process.argv[argument + 1])
  throw new Error('Pass --schema-path with the Employee export_schema SDL.');
const schemaText = readFileSync(resolve(process.argv[argument + 1]), 'utf8');
const source = resolve(root, 'src/api/documents/organizationEmployee.graphql');
const errors = validate(buildSchema(schemaText), parse(readFileSync(source, 'utf8')));
if (errors.length) throw new Error(errors.map((error) => error.message).join('\n'));
await generate(
  {
    schema: schemaText,
    documents: source,
    generates: {
      [resolve(root, 'src/api/organization-employee') + '/']: {
        preset,
        presetConfig: { fragmentMasking: false, gqlTagName: 'organizationEmployeeGraphql' },
        config: {
          onlyOperationTypes: true,
          useTypeImports: true,
          scalars: {
            JSON: 'unknown',
            UUID: 'string',
            ID: 'string',
            NaiveDate: 'string',
            DateTime: 'string',
          },
        },
      },
    },
  },
  true
);
