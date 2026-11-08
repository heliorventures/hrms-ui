import { attachment } from '../config.mjs';
import { approvalOutcome, requireDemo } from '../contracts.mjs';
import { captureMutation, enabled } from '../mutations.mjs';
import { anchor, openView, settled, uniqueRow } from '../navigation.mjs';

export async function recordLeaveApply(ctx) {
  const { page, presenter: p, config } = ctx;
  const data = config.leave;
  const marker = `${data.reason} [${ctx.state.runTag}]`;
  await openView(page, config, '/leave', 'leave.balances');
  await settled(anchor(page, 'leave.balances'));
  await p.show('Review your leave balance before applying.', anchor(page, 'leave.balances'));
  const trigger = anchor(page, 'leave.apply-trigger');
  await enabled(trigger, config.timeoutMs);
  await p.click(trigger, 'Select Apply for leave.');
  const dialog = page.getByRole('dialog', { name: 'Apply For Leave', exact: true });
  await dialog.waitFor({ state: 'visible' });
  await p.select(dialog.getByLabel('Leave type', { exact: true }), data.typeLabel, 'Choose the leave type for your request.');
  await p.fill(dialog.getByLabel('From', { exact: true }), data.fromDate, 'Choose the first leave date.');
  await p.fill(dialog.getByLabel('To', { exact: true }), data.toDate, 'Choose the last leave date.');
  await p.fill(dialog.getByLabel('Reason', { exact: true }), marker, 'Enter a short reason for your leave.');
  const evidence = dialog.getByLabel('Supporting document', { exact: true });
  if (await evidence.isVisible()) {
    requireDemo(data.supportingFile, 'ATTACHMENT_REQUIRED', 'This leave type requires a supporting document. Configure a demo attachment.');
    await p.show('Attach the supporting document required for this leave type.', evidence, () => evidence.setInputFiles(attachment(data.supportingFile)));
  }
  const submit = dialog.getByRole('button', { name: 'Submit Application', exact: true });
  await enabled(submit, config.timeoutMs);
  const result = await captureMutation(ctx, {
    field: 'submitLeaveRequest', resource: 'leave', marker,
    click: () => p.click(submit, 'Review the calculated leave days, then submit your application.'),
  });
  requireDemo(result.status, 'REQUEST_UNCONFIRMED', 'The leave request has no confirmed status.');
  await dialog.waitFor({ state: 'hidden' });
  await settled(anchor(page, 'leave.requests'));
  const row = await uniqueRow(page, marker);
  await p.show('Your submitted leave appears here with its current status.', row);
}

export async function recordLeaveApprove(ctx) {
  const { page, presenter: p, config } = ctx;
  const resource = ctx.state.resources.leave;
  await openView(page, config, '/hr/leaves', 'hr-leaves.queue');
  await settled(anchor(page, 'hr-leaves.queue'));
  await p.show('As a manager or HR approver, open Leave approvals.', anchor(page, 'hr-leaves.queue'));
  const table = page.getByRole('group', { name: 'Request view', exact: true }).getByRole('button', { name: 'Table', exact: true });
  await p.click(table, 'Use the request table to review the submitted application.');
  const row = await uniqueRow(page, resource.marker);
  await p.show('Review the employee, leave dates, reason and current status.', row);
  const approve = row.getByRole('button', { name: 'Approve', exact: true });
  await enabled(approve, config.timeoutMs);
  const result = await captureMutation(ctx, {
    field: 'approveLeaveRequest', expectedId: resource.id, idVariable: 'leaveRequestId',
    click: () => p.click(approve, 'Select Approve for the request assigned to you.'),
  });
  const outcome = approvalOutcome(result.status);
  resource.status = result.status;
  resource.approvalFinal = outcome.final;
  ctx.checkpoint();
  await settled(anchor(page, 'hr-leaves.queue'));
  await p.show(outcome.caption, anchor(page, 'hr-leaves.queue'));
}
