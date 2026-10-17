import { attachment } from '../config.mjs';
import { approvalOutcome, requireDemo } from '../contracts.mjs';
import { captureMutation, enabled } from '../mutations.mjs';
import { anchor, openView, settled, uniqueRow } from '../navigation.mjs';

async function section(ctx, name) {
  await openView(ctx.page, ctx.config, '/expenses', 'expenses.sections');
  const tab = ctx.page.getByRole('tab', { name, exact: true });
  await ctx.presenter.click(tab, `Open ${name}.`);
}

export async function recordExpense(ctx) {
  const { page, presenter: p, config } = ctx;
  const data = config.expense;
  const marker = `${data.title} [${ctx.state.runTag}]`;
  await section(ctx, 'Expense Claims');
  await p.click(page.getByRole('button', { name: 'Submit Expense', exact: true }), 'Select Submit Expense to add your claim.');
  const dialog = page.getByRole('dialog', { name: 'Submit Expense Claim', exact: true });
  await dialog.waitFor({ state: 'visible' });
  await p.select(dialog.getByLabel('Category', { exact: true }), data.categoryLabel, 'Choose the expense category and review its policy limits.');
  await p.fill(dialog.getByLabel('Title', { exact: true }), marker, 'Describe the expense clearly.');
  await p.fill(dialog.getByLabel('Amount', { exact: true }), data.amount, 'Enter the amount shown on your receipt.');
  await p.fill(dialog.getByLabel('Currency', { exact: true }), data.currency, 'Check the currency.');
  await p.fill(dialog.getByLabel('Expense Date', { exact: true }), data.date, 'Choose the date the expense was incurred.');
  const receipt = dialog.locator('input[type="file"]');
  await p.show('Attach a receipt. It is required for every claim.', receipt, () => receipt.setInputFiles(attachment(data.receipt)));
  const submit = dialog.getByRole('button', { name: 'Submit', exact: true });
  await enabled(submit, config.timeoutMs);
  const result = await captureMutation(ctx, {
    field: 'submitExpense', resource: 'expense', marker,
    click: () => p.click(submit, 'Review the details and submit your claim.'),
  });
  requireDemo(result.status, 'REQUEST_UNCONFIRMED', 'The expense submission has no confirmed status.');
  await dialog.waitFor({ state: 'hidden' });
  const row = await uniqueRow(page, marker);
  await p.show('Track your claim’s status in Expense Claims.', row);
}

export async function recordTravel(ctx) {
  const { page, presenter: p, config } = ctx;
  const data = config.travel;
  const marker = `${data.toLocation} [${ctx.state.runTag}]`;
  await section(ctx, 'Travel Requests');
  await p.click(page.getByRole('button', { name: 'Request travel', exact: true }), 'Select Request travel to create a trip request.');
  const dialog = page.getByRole('dialog', { name: 'Submit Travel Request', exact: true });
  await dialog.waitFor({ state: 'visible' });
  await p.fill(dialog.getByLabel('From Location', { exact: true }), data.fromLocation, 'Enter your departure location.');
  await p.fill(dialog.getByLabel('To Location', { exact: true }), marker, 'Enter the destination.');
  await p.fill(dialog.getByLabel('From Date', { exact: true }), data.fromDate, 'Choose the trip start date.');
  await p.fill(dialog.getByLabel('To Date', { exact: true }), data.toDate, 'Choose the trip end date.');
  await p.fill(dialog.getByLabel('Estimated Cost (₹)', { exact: true }), data.estimatedCost, 'Enter the estimated travel cost.');
  await p.fill(dialog.getByLabel('Purpose of travel', { exact: true }), `${data.purpose} [${ctx.state.runTag}]`, 'Explain the business purpose of the trip.');
  const file = dialog.locator('input[type="file"]');
  await p.show('Attach your supporting travel document.', file, () => file.setInputFiles(attachment(data.supportingFile)));
  const submit = dialog.getByRole('button', { name: 'Submit Request', exact: true });
  await enabled(submit, config.timeoutMs);
  const result = await captureMutation(ctx, {
    field: 'submitTravelRequest', resource: 'travel', marker,
    click: () => p.click(submit, 'Review your trip details and submit the request.'),
  });
  requireDemo(result.status, 'REQUEST_UNCONFIRMED', 'The travel submission has no confirmed status.');
  await dialog.waitFor({ state: 'hidden' });
  await p.show('The request appears here with its approval status.', await uniqueRow(page, marker));
}

export async function recordExpenseTravelApprove(ctx) {
  const { page, presenter: p, config } = ctx;
  const expense = ctx.state.resources.expense;
  const travel = ctx.state.resources.travel;
  await section(ctx, 'Expense Claims');
  const claim = await uniqueRow(page, expense.marker);
  await p.show('Review the submitted expense amount and receipt.', claim);
  const approve = claim.getByRole('button', { name: 'Approve', exact: true });
  await enabled(approve, config.timeoutMs);
  await p.click(approve, 'Select Approve for the expense assigned to you.');
  const dialog = page.getByRole('dialog', { name: 'Approve Expense Claim', exact: true });
  await dialog.waitFor({ state: 'visible' });
  await p.show('Check the approved amount. Adjust it only for a partial approval.', dialog.getByLabel('Approve Amount', { exact: true }));
  const result = await captureMutation(ctx, {
    field: 'approveExpense', idVariable: 'expenseId', expectedId: expense.id,
    click: () => p.click(dialog.getByRole('button', { name: 'Submit Approval', exact: true }), 'Submit your expense approval.'),
  });
  const expenseOutcome = approvalOutcome(result.status);
  Object.assign(expense, { status: result.status, approvalFinal: expenseOutcome.final });
  ctx.checkpoint();
  await dialog.waitFor({ state: 'hidden' });
  await p.show(expenseOutcome.caption, await uniqueRow(page, expense.marker));
  await p.click(page.getByRole('tab', { name: 'Travel Requests', exact: true }), 'Switch to Travel Requests to review a trip.');
  const trip = await uniqueRow(page, travel.marker);
  await p.show('Review the travel dates, estimate and supporting document.', trip);
  const tripApprove = trip.getByRole('button', { name: 'Approve', exact: true });
  await enabled(tripApprove, config.timeoutMs);
  const tripResult = await captureMutation(ctx, {
    field: 'approveTravelRequest', idVariable: 'travelRequestId', expectedId: travel.id,
    click: () => p.click(tripApprove, 'Select Approve for the trip assigned to you.'),
  });
  const tripOutcome = approvalOutcome(tripResult.status);
  Object.assign(travel, { status: tripResult.status, approvalFinal: tripOutcome.final });
  ctx.checkpoint();
  await p.show(tripOutcome.caption, await uniqueRow(page, travel.marker));
}
