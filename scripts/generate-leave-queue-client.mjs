// Validate/generate against the leave service, without requiring a running gateway.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generate } from '@graphql-codegen/cli';
import { preset } from '@graphql-codegen/client-preset';
import { buildSchema, parse, validate } from 'graphql';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'src/api/documents/leave-queue.graphql');
const index = process.argv.indexOf('--schema-path');
if (index !== -1 && !process.argv[index + 1])
  throw new Error('--schema-path requires a leave SDL file');
const schema =
  index !== -1
    ? readFileSync(resolve(process.argv[index + 1]), 'utf8')
    : execFileSync(
        'cargo',
        ['run', '--quiet', '--offline', '-p', 'kabipay-leave', '--example', 'export_schema'],
        {
          cwd: resolve(root, '../hrms-svc'),
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'inherit'],
          maxBuffer: 16 * 1024 * 1024,
        }
      );
const errors = validate(buildSchema(schema), parse(readFileSync(source, 'utf8')));
if (errors.length) throw new Error(errors.map((error) => error.message).join('\n'));
await generate(
  {
    schema,
    documents: source,
    generates: {
      [resolve(root, 'src/api/leave-queue') + '/']: {
        preset,
        presetConfig: { fragmentMasking: false, gqlTagName: 'leaveQueueGraphql' },
        config: {
          onlyOperationTypes: true,
          useTypeImports: true,
          scalars: { DateTime: 'string', NaiveDate: 'string', UUID: 'string' },
        },
      },
    },
  },
  true
);
