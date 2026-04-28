import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CodegenConfig } from '@graphql-codegen/cli';

const __dirname = dirname(fileURLToPath(import.meta.url));

function gatewayUrlFromPublicConfig(): string {
  const path = join(__dirname, 'public', 'config.json');
  const raw = readFileSync(path, 'utf8');
  const j = JSON.parse(raw) as { gatewayUrl?: string };
  const u = j.gatewayUrl?.trim();
  if (!u) {
    throw new Error(`public/config.json must define a non-empty "gatewayUrl" (read from ${path})`);
  }
  return u.replace(/\/$/, '');
}

/** Optional override when running codegen without the same tree (e.g. CI). */
const schemaUrl = process.env.CODEGEN_SCHEMA_URL ?? gatewayUrlFromPublicConfig();

/** Local extensions (e.g. new mutations before gateway is restarted) merged with gateway schema. */
const schema: CodegenConfig['schema'] = [
  schemaUrl,
  join(__dirname, 'src', 'api', 'schema-extensions', 'payroll-run.graphql'),
  join(__dirname, 'src', 'api', 'schema-extensions', 'backlog-catchup.graphql'),
];

const config: CodegenConfig = {
  schema,
  // `opsGraph.ts` targets operator-gateway fields that may be absent from the client-stitched schema;
  // validating it breaks `npm run codegen` for mainline UI. Ops pages import it at runtime only.
  documents: [
    'src/**/*.graphql',
    'src/**/*.{ts,tsx}',
    '!src/modules/ops/opsGraph.ts',
  ],
  ignoreNoDocuments: true,
  generates: {
    'src/api/graphql/': {
      preset: 'client',
      presetConfig: {
        gqlTagName: 'graphql',
      },
    },
  },
};

export default config;
