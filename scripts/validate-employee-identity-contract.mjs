// Validate the real UI mutation against SDL exported by kabipay-employee.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { buildSchema, getVariableValues, Kind, parse, validate } from 'graphql';

if (!process.argv[2]) {
  throw new Error('Pass the SDL exported by kabipay-employee --example export_schema.');
}

const schema = buildSchema(readFileSync(resolve(process.argv[2]), 'utf8').replace(/^\uFEFF/, ''));
const source = parse(
  readFileSync(new URL('../src/api/documents/clientOperations.graphql', import.meta.url), 'utf8')
);
const mutation = source.definitions.find(
  (definition) =>
    definition.kind === Kind.OPERATION_DEFINITION && definition.name?.value === 'UpdateEmployee'
);
assert.ok(mutation, 'The employee edit mutation must exist');
const errors = validate(schema, { kind: Kind.DOCUMENT, definitions: [mutation] });
assert.deepEqual(
  errors.map((error) => error.message),
  [],
  'Employee edit mutation must match SDL'
);

const input = schema.getType('UpdateEmployeeInput');
assert.ok(input && 'getFields' in input, 'Employee update input must exist');
const fields = input.getFields();
for (const [name, type] of [
  ['employeeCode', 'String'],
  ['dateOfJoining', 'NaiveDate'],
]) {
  assert.equal(fields[name]?.type.toString(), type, `${name} must be optional ${type}`);
}

for (const corrections of [
  {},
  { employeeCode: 'EMP-002' },
  { dateOfJoining: '2026-02-15' },
  { employeeCode: 'EMP-002', dateOfJoining: '2026-02-15' },
]) {
  const result = getVariableValues(schema, mutation.variableDefinitions ?? [], {
    input: { id: '00000000-0000-0000-0000-000000000001', ...corrections },
  });
  assert.equal(result.errors, undefined, result.errors?.map((error) => error.message).join('\n'));
}

console.log(
  'Employee identity contract passed: actual UI mutation and optional correction variables match service SDL.'
);
