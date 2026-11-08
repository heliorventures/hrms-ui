import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

import { repoRoot, toolRoot } from './config.mjs';
import { requireDemo } from './contracts.mjs';

export const sourceFiles = [
  'src/routes/appRouteConfig.tsx', 'src/modules/auth/LoginPage.tsx',
  'src/auth/authClient.ts', 'src/auth/tokenStore.ts', 'src/contexts/TenantContext.tsx',
  'src/modules/dashboard/components/PunchInOut.tsx',
  'src/modules/attendance/AttendancePage.tsx', 'src/modules/attendance/guidance/AttendancePageTour.ts',
  'src/modules/attendance/components/AttendanceMonthControls.tsx',
  'src/modules/leave/guidance/LeavePageTour.ts',
  'src/modules/leave/components/ApplyLeaveFormFields.tsx', 'src/modules/leave/components/ApplyLeaveDialogContent.tsx',
  'src/modules/leave/components/LeaveRequestsTableSection.tsx',
  'src/modules/hr/guidance/HrLeavesPageTour.ts', 'src/modules/hr/components/LeaveApprovalReview.tsx',
  'src/modules/hr/components/HrLeaveQueueSection.tsx',
  'src/modules/payroll/PayrollPayPage.tsx', 'src/modules/payroll/components/PayrollPayslipTab.tsx',
  'src/modules/payroll/components/PayrollSalaryTab.tsx', 'src/modules/payroll/components/TaxProjectionSummary.tsx',
  'src/modules/payroll/guidance/PayrollPayPageTour.ts',
  'src/modules/expenses/ExpensesPage.tsx', 'src/modules/expenses/guidance/ExpensesPageTour.ts',
  'src/modules/expenses/components/ExpenseClaimFields.tsx', 'src/modules/expenses/components/SubmitTravelModal.tsx',
  'src/modules/expenses/components/TravelRouteFields.tsx', 'src/modules/expenses/components/ExpensesHeader.tsx',
  'src/modules/expenses/components/ApproveExpenseModal.tsx', 'src/modules/expenses/components/ExpenseClaimsTable.tsx',
  'src/modules/expenses/components/TravelRequestsTable.tsx',
  'src/modules/expenses/hooks/useExpenseSubmission.ts', 'src/modules/expenses/hooks/useTravelSubmission.ts',
  'src/modules/leave/components/useApplyLeaveForm.ts', 'src/modules/leave/components/useLeaveDatePreview.ts',
  'src/modules/payroll/hooks/useEmployeePayRecords.ts', 'src/modules/payroll/payslipPresentation.ts',
  'src/modules/payroll/projectionViewTypes.ts',
  'src/api/documents/clientOperations.graphql', 'src/api/documents/importSalaryPreview.graphql',
  'src/api/documents/payslipOperations.graphql', 'src/api/documents/taxProjection.graphql',
];

const literal = node => ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) ? node.text : undefined;
const property = (node, name) => node.properties.find(p => ts.isPropertyAssignment(p) && p.name.getText().replaceAll(/['"]/g, '') === name)?.initializer;

export function extractSource(file, source) {
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const facts = { attributes: [], routes: [], guidance: [], capabilities: [] };
  function visit(node) {
    const line = tree.getLineAndCharacterOfPosition(node.getStart()).line + 1;
    if (ts.isJsxAttribute(node) && ['label', 'title', 'aria-label', 'data-tour-anchor'].includes(node.name.getText())) {
      const initializer = node.initializer;
      const value = initializer && (ts.isJsxExpression(initializer) ? initializer.expression && literal(initializer.expression) : literal(initializer));
      if (value) facts.attributes.push({ attribute: node.name.getText(), value, line });
    }
    if (ts.isObjectLiteralExpression(node)) {
      const route = property(node, 'path');
      const anchor = property(node, 'anchor');
      if (route && literal(route)) facts.routes.push({ path: literal(route), title: property(node, 'title') && literal(property(node, 'title')), line });
      if (anchor && literal(anchor)) facts.guidance.push({ anchor: literal(anchor), title: property(node, 'title') && literal(property(node, 'title')), body: property(node, 'body') && literal(property(node, 'body')), line });
    }
    if (ts.isCallExpression(node) && /canCapability|canScopedPermission/.test(node.expression.getText())) {
      const value = node.arguments[0] && literal(node.arguments[0]);
      if (value) facts.capabilities.push({ value, line });
    }
    ts.forEachChild(node, visit);
  }
  visit(tree);
  return facts;
}

export function discoverSources() {
  return { schemaVersion: 1, files: sourceFiles.map(file => {
    const source = readFileSync(path.join(repoRoot, file), 'utf8');
    return { file, sha256: createHash('sha256').update(source).digest('hex'), ...(file.endsWith('.graphql') ? { contract: 'GraphQL operation definitions' } : extractSource(file, source)) };
  }) };
}

export function writeSourceContract() {
  const contract = discoverSources();
  writeFileSync(path.join(toolRoot, 'source-contracts.json'), `${JSON.stringify(contract, null, 2)}\n`);
  return contract;
}

export function verifySourceContract() {
  const baseline = JSON.parse(readFileSync(path.join(toolRoot, 'source-contracts.json'), 'utf8'));
  const current = discoverSources();
  for (const entry of current.files) {
    requireDemo(baseline.files.find(file => file.file === entry.file)?.sha256 === entry.sha256, 'SOURCE_CHANGED', `Source changed: ${entry.file}. Review this workflow and regenerate its discovery contract.`);
  }
  return current;
}
