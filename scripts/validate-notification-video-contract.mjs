import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildSchema, parse, validate } from 'graphql';

if (!process.argv[2]) throw new Error('Pass the exported notification SDL path.');
const schema = buildSchema(readFileSync(process.argv[2], 'utf8').replace(/^\uFEFF/, ''));
const root = new URL('../src/modules/notifications/', import.meta.url);
let failed = false;
for (const file of ['videoDocuments.ts', 'notificationQueries.ts']) {
  const source = readFileSync(fileURLToPath(new URL(file, root)), 'utf8');
  for (const match of source.matchAll(/export const (\w+) = `([\s\S]*?)`;/g)) {
    if (match[1] === 'AdminNotificationsConsoleSafeDocument') continue; // Also queries employee subgraph.
    const errors = validate(schema, parse(match[2]));
    console.log(`${match[1]}: ${errors.length ? errors.map((error) => error.message).join('; ') : 'valid'}`);
    failed ||= errors.length > 0;
  }
}
process.exitCode = failed ? 1 : 0;
