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

/**
 * Optional override when running codegen without the same tree (e.g. CI).
 * Use an empty/unset variable to always use `public/config.json` (PowerShell keeps env vars —
 * run `Remove-Item Env:CODEGEN_SCHEMA_URL` if a stale override breaks schema load).
 */
const schemaUrlOverride = process.env.CODEGEN_SCHEMA_URL?.trim();
const schemaUrl =
  schemaUrlOverride && schemaUrlOverride.length > 0
    ? schemaUrlOverride
    : gatewayUrlFromPublicConfig();
if (
  schemaUrlOverride &&
  schemaUrlOverride.length > 0 &&
  !/^https?:\/\//i.test(schemaUrlOverride)
) {
  throw new Error(
    `CODEGEN_SCHEMA_URL must start with http:// or https:// (got "${schemaUrlOverride}"). Remove it to use gatewayUrl from public/config.json.`,
  );
}

/** Local extensions (e.g. new mutations before gateway is restarted) merged with gateway schema. */
const schema: CodegenConfig['schema'] = [
  schemaUrl,
  join(__dirname, 'src', 'api', 'schema-extensions', 'payroll-run.graphql'),
  join(__dirname, 'src', 'api', 'schema-extensions', 'tax-admin.graphql'),
  join(__dirname, 'src', 'api', 'schema-extensions', 'backlog-catchup.graphql'),
  join(__dirname, 'src', 'api', 'schema-extensions', 'hrms-rbac.graphql'),
  join(__dirname, 'src', 'api', 'schema-extensions', 'hrms-timesheet-attendance.graphql'),
  join(__dirname, 'src', 'api', 'schema-extensions', 'hrms-expense.graphql'),
  join(__dirname, 'src', 'api', 'schema-extensions', 'hrms-notification.graphql'),
  join(__dirname, 'src', 'api', 'schema-extensions', 'hrms-employee-profile.graphql'),
  join(__dirname, 'src', 'api', 'schema-extensions', 'hrms-assets.graphql'),
];

const config: CodegenConfig = {
  schema,
  // Ops console uses hand-written `opsGraph.ts` (operator JWT) so tenant-only codegen runs stay simple.
  // The stitched gateway schema includes ops types; ops pages validate at runtime against the gateway.
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
