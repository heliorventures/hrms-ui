import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const graphqlPath = join(__dirname, '../src/api/graphql/graphql.ts');
let s = readFileSync(graphqlPath, 'utf8');

function readJson(name) {
  return readFileSync(join(__dirname, `out-${name}.json`), 'utf8');
}

function replaceExport(name, queryVar, typePair, jsonFile) {
  const endMarker = ` as unknown as DocumentNode<${typePair}>;`;
  const start = s.indexOf(`export const ${name} = `);
  if (start === -1) {
    throw new Error(`Missing ${name}`);
  }
  const end = s.indexOf(endMarker, start);
  if (end === -1) {
    throw new Error(`Missing end for ${name}`);
  }
  const after = end + endMarker.length;
  const body = readJson(jsonFile);
  s = s.slice(0, start) + `export const ${name} = ${body}` + endMarker + s.slice(after);
}

replaceExport('AdminWorkflowsDataDocument', null, 'AdminWorkflowsDataQuery, AdminWorkflowsDataQueryVariables', 'AdminWorkflowsDataDocument');

{
  if (!s.includes('export const AdminWorkflowsStepsDataDocument = ')) {
    const insertAfter = ' as unknown as DocumentNode<AdminWorkflowsDataQuery, AdminWorkflowsDataQueryVariables>;';
    const pos = s.indexOf('export const AdminWorkflowsDataDocument = ');
    if (pos === -1) throw new Error('AdminWorkflowsDataDocument');
    const insertPos = s.indexOf(insertAfter, pos);
    if (insertPos === -1) throw new Error('insert anchor');
    const afterPos = insertPos + insertAfter.length;
    const jSteps = readJson('AdminWorkflowsStepsDataDocument');
    const jArr = readJson('PayrollArrearsListDocument');
    const block = `\nexport const AdminWorkflowsStepsDataDocument = ${jSteps} as unknown as DocumentNode<AdminWorkflowsStepsDataQuery, AdminWorkflowsStepsDataQueryVariables>;\nexport const PayrollArrearsListDocument = ${jArr} as unknown as DocumentNode<PayrollArrearsListQuery, PayrollArrearsListQueryVariables>;`;
    s = s.slice(0, afterPos) + block + s.slice(afterPos);
  }
}

replaceExport('SubmitExpenseDocument', null, 'SubmitExpenseMutation, SubmitExpenseMutationVariables', 'SubmitExpenseDocument');
replaceExport('ExpenseBoardDocument', null, 'ExpenseBoardQuery, ExpenseBoardQueryVariables', 'ExpenseBoardDocument');
replaceExport('PayrollBoardDocument', null, 'PayrollBoardQuery, PayrollBoardQueryVariables', 'PayrollBoardDocument');

writeFileSync(graphqlPath, s);
console.log('patched', graphqlPath);
