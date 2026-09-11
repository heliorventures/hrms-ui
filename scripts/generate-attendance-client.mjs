// Generate the attendance board from the Rust schema without a running gateway.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generate } from '@graphql-codegen/cli';
import { preset } from '@graphql-codegen/client-preset';
import { buildSchema, parse, validate } from 'graphql';

const uiRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const serviceRoot = resolve(uiRoot, '../hrms-svc');
const source = resolve(uiRoot, 'src/api/documents/attendance.graphql');
const destination = resolve(uiRoot, 'src/api/attendance') + '/';
const schemaPath = process.argv.indexOf('--schema-path');
if (schemaPath !== -1 && !process.argv[schemaPath + 1]) {
  throw new Error('--schema-path requires an SDL file exported from the attendance service.');
}
const schemaText =
  schemaPath !== -1
    ? readFileSync(resolve(process.argv[schemaPath + 1]), 'utf8')
    : execFileSync(
        'cargo',
        ['run', '--quiet', '--offline', '-p', 'kabipay-attendance', '--example', 'export_schema'],
        {
          cwd: serviceRoot,
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'inherit'],
          maxBuffer: 16 * 1024 * 1024,
        }
      );
const schema = buildSchema(schemaText);
const document = parse(readFileSync(source, 'utf8'));
const errors = validate(schema, document);
if (errors.length) throw new Error(errors.map((error) => error.message).join('\n'));
await generate(
  {
    schema: schemaText,
    documents: source,
    generates: {
      [destination]: {
        preset,
        presetConfig: { fragmentMasking: false, gqlTagName: 'attendanceGraphql' },
        config: {
          onlyOperationTypes: true,
          useTypeImports: true,
          scalars: {
            DateTime: 'string',
            NaiveDate: 'string',
            NaiveTime: 'string',
          },
        },
      },
    },
  },
  true
);
