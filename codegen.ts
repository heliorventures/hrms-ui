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

const config: CodegenConfig = {
  schema: schemaUrl,
  documents: ['src/**/*.graphql', 'src/**/*.{ts,tsx}'],
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
