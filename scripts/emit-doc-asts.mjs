import { parse } from 'graphql';
import { writeFileSync } from 'node:fs';

function stripLoc(node) {
  if (Array.isArray(node)) {
    return node.map(stripLoc);
  }
  if (node && typeof node === 'object') {
    const { loc: _l, ...rest } = node;
    const out = {};
    for (const [k, v] of Object.entries(rest)) {
      out[k] = stripLoc(v);
    }
    return out;
  }
  return node;
}

const adminBase = `query AdminWorkflowsData($wl: Int! = 30, $il: Int! = 50) {
  workflows(limit: $wl) { id name entityType isActive }
  workflowInstances(limit: $il) { id status entityType entityId }
}`;
const adminSteps = `query AdminWorkflowsStepsData($wl: Int! = 30) {
  workflowsWithSteps(limit: $wl) {
    workflow { id name entityType isActive }
    steps { id sequenceOrder stepName approverType canSkip slaHours }
  }
}`;
const arrears = `query PayrollArrearsList($limit: Int! = 100) {
  payrollArrears(limit: $limit) { id employeeId amount reason status createdAt }
}`;
const payrollBoard = `query PayrollBoard($limit: Int! = 20) {
  salaryComponents(limit: $limit) { id name code componentType isTaxable isFixed isActive }
  payrollCycles(limit: $limit) { id name month year status paymentDate }
}`;

const submitExpense = `mutation SubmitExpense($input: SubmitExpenseInput!) {
  submitExpense(input: $input) {
    id
    status
    amount
    title
  }
}`;

const expenseBoard = `query ExpenseBoard($limit: Int! = 20) {
  expenseCategories(limit: $limit) { id name code maxAmountPerClaim }
  expenses(limit: $limit) {
    id
    employeeId
    expenseCategoryId
    amount
    currency
    expenseDate
    title
    status
    pendingApprovalStage
    viewerMayApprove
    submittedAt
  }
  travelRequests(limit: $limit) {
    id
    employeeId
    originLocation
    destinationLocation
    fromDate
    toDate
    purpose
    estimatedAmount
    currency
    status
    pendingApprovalStage
    viewerMayApprove
    submittedAt
  }
}`;

const out = {
  AdminWorkflowsDataDocument: stripLoc(parse(adminBase)),
  AdminWorkflowsStepsDataDocument: stripLoc(parse(adminSteps)),
  PayrollArrearsListDocument: stripLoc(parse(arrears)),
  PayrollBoardDocument: stripLoc(parse(payrollBoard)),
  ExpenseBoardDocument: stripLoc(parse(expenseBoard)),
  SubmitExpenseDocument: stripLoc(parse(submitExpense)),
};

for (const [k, v] of Object.entries(out)) {
  const json = JSON.stringify(v);
  writeFileSync(
    new URL(`./out-${k}.json`, import.meta.url),
    json,
  );
  console.log(k, json.length);
}
