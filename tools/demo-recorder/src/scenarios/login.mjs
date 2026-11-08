import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { credentials, toolRoot } from '../config.mjs';
import { DemoError, requireDemo } from '../contracts.mjs';
import { anchor, closeTour } from '../navigation.mjs';

async function approvedChallenge(ctx) {
  const challengeId = randomUUID();
  const folder = path.join(toolRoot, '.cache', 'approvals');
  mkdirSync(folder, { recursive: true });
  const file = path.join(folder, `${challengeId}.json`);
  writeFileSync(file, JSON.stringify({ challengeId, decision: 'pending' }), { mode: 0o600 });
  console.log(JSON.stringify({ event: 'captcha-confirmation-required', challengeId, approvalFile: path.relative(toolRoot, file), message: 'Approve completing this currently open demo sign-in verification challenge.' }));
  await ctx.page.screenshot({ path: path.join(ctx.runDir, '01-login-verification.png') });
  const deadline = Date.now() + 300000;
  while (Date.now() < deadline) {
    const signal = JSON.parse(readFileSync(file, 'utf8'));
    requireDemo(signal.challengeId === challengeId, 'CAPTCHA_CONFIRMATION_INVALID', 'The verification approval belongs to a different browser challenge.');
    if (signal.decision === 'denied') throw new DemoError('CAPTCHA_DENIED', 'The login verification challenge was not approved.');
    if (signal.decision === 'approved' && !signal.consumed) {
      writeFileSync(file, JSON.stringify({ challengeId, decision: 'approved', consumed: true }), { mode: 0o600 });
      return;
    }
    await ctx.page.waitForTimeout(500);
  }
  throw new DemoError('CAPTCHA_CONFIRMATION_REQUIRED', 'The login video needs approval to complete the currently displayed verification challenge. Other videos can run with API-established sessions.');
}

export async function recordLogin(ctx) {
  const { page, presenter: p, config } = ctx;
  const account = credentials('employee');
  requireDemo(account.username && account.password, 'CREDENTIALS_REQUIRED', 'The sign-in walkthrough requires locally configured demo employee credentials.');
  await page.goto(`${config.baseUrl}/login`, { waitUntil: 'domcontentloaded' });
  const username = page.getByRole('textbox', { name: 'Email, mobile number, or unique name', exact: true });
  await username.waitFor({ state: 'visible' });
  await p.show('Open your organization’s HRMS sign-in page.', page.getByRole('heading', { name: 'Sign In', exact: true }));
  await p.fill(username, account.username, 'Enter your email, mobile number or unique name.');
  await p.fill(page.getByLabel('Password', { exact: true }), account.password, 'Enter your password. Keep it private.', true);
  const verification = page.getByLabel('Verification code', { exact: true });
  if (await verification.isVisible()) {
    await approvedChallenge(ctx);
    const code = await page.getByRole('button', { name: 'Refresh verification code', exact: true }).locator('..').locator('span').innerText();
    requireDemo(/^[A-Z2-9]{5}$/.test(code.trim()), 'VERIFICATION_CHANGED', 'The displayed verification challenge no longer matches the expected demo form.');
    await p.fill(verification, code.trim(), 'Enter the verification code shown above.');
  }
  const responsePromise = page.waitForResponse(response => response.url() === `${ctx.runtime.authUrl}/auth/client/login` && response.request().method() === 'POST').catch(() => null);
  await p.click(page.getByRole('button', { name: 'Sign in', exact: true }), 'Select Sign in to open your workspace.');
  const response = await responsePromise;
  requireDemo(response?.ok(), 'LOGIN_UNCONFIRMED', 'The demo sign-in result was not confirmed.');
  const pair = await response.json();
  requireDemo(pair.tenantId === ctx.runtime.tenantId && !pair.mustChangePassword, 'LOGIN_UNCONFIRMED', 'The sign-in did not open the expected demo workspace.');
  await page.waitForURL('**/dashboard');
  await anchor(page, 'dashboard-attendance-summary').waitFor({ state: 'visible' });
  await closeTour(page);
  await p.show('You are signed in. Use Home and the workspace menu to get started.', page.getByRole('heading').first());
  ctx.loginSession = { role: 'employee', owned: true, storageState: await page.context().storageState() };
}
