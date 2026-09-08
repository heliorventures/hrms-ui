import { readFileSync } from 'node:fs';
import { buildSchema, parse, validate } from 'graphql';

if (!process.argv[2]) throw new Error('Pass the exported analytics SDL path.');
const schema = buildSchema(readFileSync(process.argv[2], 'utf8').replace(/^\uFEFF/, ''));
const source = readFileSync(new URL('../src/modules/reports/reportDocuments.ts', import.meta.url), 'utf8');
let count = 0;
for (const match of source.matchAll(/export const (\w+) = `([\s\S]*?)`;/g)) {
  const errors = validate(schema, parse(match[2]));
  if (errors.length) throw new Error(`${match[1]}: ${errors.map((error) => error.message).join('; ')}`);
  console.log(`${match[1]}: valid`);
  count += 1;
}
if (count !== 3) throw new Error(`Expected three report operations, found ${count}.`);
