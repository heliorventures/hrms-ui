import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildSchema, parse, validate } from 'graphql';

if (!process.argv[2]) throw new Error('Pass the SDL file exported by kabipay-leave --example export_schema.');
const schema = buildSchema(readFileSync(resolve(process.argv[2]), 'utf8'));
const source = readFileSync(new URL('../src/modules/leave/compOffDocuments.ts', import.meta.url), 'utf8');
const operations = [...source.matchAll(/export const (\w+) = `([\s\S]*?)`;/g)];
if (operations.length < 7) throw new Error('Missing comp-off operations.');
for (const [, name, operation] of operations) {
  const errors = validate(schema, parse(operation));
  if (errors.length) throw new Error(`${name}: ${errors.map((error) => error.message).join('; ')}`);
  console.log(`${name}: valid`);
}
