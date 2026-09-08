import { readFileSync, writeFileSync } from 'node:fs';
import { buildSchema, Kind, parse, print, validate } from 'graphql';

if (!process.argv[2]) throw new Error('Pass the exported employee SDL path.');
const sdl = readFileSync(process.argv[2], 'utf8').replace(/^\uFEFF/, '');
const schema = buildSchema(sdl);
const source = [
  '../src/modules/prejoining/admin/prejoiningAdminDocuments.ts',
  '../src/modules/prejoining/PrejoiningPipelineExport.tsx',
].map((path) => readFileSync(new URL(path, import.meta.url), 'utf8')).join('\n');
let count = 0;
for (const match of source.matchAll(/export const (\w+) =\s*`([\s\S]*?)`;/g)) {
  const errors = validate(schema, parse(match[2]));
  if (errors.length) throw new Error(`${match[1]}: ${errors.map((error) => error.message).join('; ')}`);
  console.log(`${match[1]}: valid`);
  count += 1;
}
if (count < 10) throw new Error(`Expected at least ten pre-joining operations, found ${count}.`);

if (process.argv.includes('--write-extension')) {
  const definitions = [];
  for (const definition of parse(sdl).definitions) {
    const name = definition.name?.value ?? '';
    if (name.startsWith('Prejoining') || name === 'ConfirmPrejoiningInput') {
      definitions.push(definition);
    } else if (name === 'QueryRoot' || name === 'MutationRoot') {
      const fields = definition.fields.filter((field) => /prejoining/i.test(field.name.value));
      if (fields.length) definitions.push({ ...definition, kind: Kind.OBJECT_TYPE_EXTENSION, name: { ...definition.name, value: name.replace('Root', '') }, fields });
    }
  }
  writeFileSync(new URL('../src/api/schema-extensions/prejoining.graphql', import.meta.url), print({ kind: Kind.DOCUMENT, definitions }) + '\n');
  console.log('Local pre-joining schema extension refreshed from actual SDL.');
}
