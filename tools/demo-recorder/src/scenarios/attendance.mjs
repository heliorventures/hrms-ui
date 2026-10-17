import { requireDemo } from '../contracts.mjs';
import { captureMutation, enabled } from '../mutations.mjs';
import { anchor, openView, settled } from '../navigation.mjs';
import { demoGeolocation, requireRecordedLocation } from '../gps.mjs';

export async function recordPunch(ctx) {
  const { page, presenter: p, config } = ctx;
  const location = demoGeolocation(config.attendance);
  p.simulatedGps = true;
  await openView(page, config, '/dashboard', 'dashboard-attendance-summary');
  const action = anchor(page, 'dashboard-punch-action');
  await enabled(action, config.timeoutMs);
  requireDemo((await action.innerText()).trim() === 'Punch In', 'OPEN_PUNCH_EXISTS', 'The demo employee already has an open punch. Close or reconcile it before recording a new punch-in/out walkthrough.');
  await p.show('From Home, review Today’s attendance.', page.getByRole('heading', { name: 'Today’s attendance', exact: true }));
  const gps = page.getByRole('checkbox', { name: 'Record GPS location with this punch', exact: true });
  await p.show('Keep GPS enabled. Allow location access when your browser asks.', gps.locator('..'), () => gps.check());
  requireDemo(await gps.isChecked(), 'GPS_REQUIRED', 'The GPS checkbox must remain enabled for both punches.');
  const first = await captureMutation(ctx, {
    field: 'punchToday', resource: 'punch', marker: ctx.state.runTag,
    click: () => p.click(action, 'Select Punch In when you start your work.'),
  });
  requireRecordedLocation(first, 'checkIn', location);
  await page.getByRole('button', { name: 'Punch Out', exact: true }).waitFor({ state: 'visible' });
  await p.show('Your punch-in is recorded. The next action becomes Punch Out.', anchor(page, 'dashboard-attendance-summary'));
  requireDemo(await gps.isChecked(), 'GPS_REQUIRED', 'The GPS checkbox must remain enabled for both punches.');
  const second = await captureMutation(ctx, {
    field: 'punchToday', expectedId: first.id,
    click: () => p.click(action, 'At the end of your work, select Punch Out.'),
  });
  requireRecordedLocation(second, 'checkOut', location);
  requireDemo(second.checkOutAt || second.checkOutTime, 'PUNCH_OUT_UNCONFIRMED', 'The attendance response did not contain a punch-out time.');
  await page.getByRole('button', { name: 'Punch In', exact: true }).waitFor({ state: 'visible' });
  await p.show('Both punch times are recorded. Review your daily total.', anchor(page, 'dashboard-attendance-summary'));
}

export async function recordAttendance(ctx) {
  const { page, presenter: p, config } = ctx;
  await openView(page, config, '/attendance', 'attendance.records');
  await settled(anchor(page, 'attendance.records'));
  await p.show('Open Attendance to review your own records.', anchor(page, 'attendance.month-controls'));
  if (config.attendance?.year) await p.select(page.getByLabel('Year', { exact: true }), String(config.attendance.year), 'Choose the year you want to review.');
  if (config.attendance?.month) {
    const label = new Date(2020, config.attendance.month - 1, 1).toLocaleString('en-IN', { month: 'long' });
    await p.select(page.getByLabel('Month', { exact: true }), label, 'Choose an attendance month.');
  }
  await settled(anchor(page, 'attendance.records'));
  await settled(anchor(page, 'attendance.month-summary'));
  await p.show('Review completed workdays, total time and incomplete punches.', anchor(page, 'attendance.month-summary'));
  await p.show('Check each day’s punch times, duration and attendance status.', anchor(page, 'attendance.records'));
}
