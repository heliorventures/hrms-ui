import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { loadConfig, toolRoot } from './config.mjs';
import { createRoleSession, resolveRuntime, revokeRoleSession } from './auth.mjs';
import { safeFailure } from './contracts.mjs';
import { closeTour } from './navigation.mjs';

const config = loadConfig();
const { chromium, request } = await import('playwright');
const api = await request.newContext({ timeout: config.timeoutMs });
let browser;
let runtime;
const sessions = [];
const output = path.join(toolRoot, 'output', 'inspection');
mkdirSync(output, { recursive: true });
try {
  runtime = await resolveRuntime(config, api);
  browser = await chromium.launch({ headless: true });
  const summary = [];
  for (const role of process.argv.includes('--hr') ? ['hr'] : ['employee', config.approvalRole]) {
    const session = await createRoleSession(role, runtime, api);
    sessions.push(session);
    const context = await browser.newContext({ storageState: session.storageState, viewport: config.viewport });
    const page = await context.newPage();
    page.setDefaultTimeout(config.timeoutMs);
    const views = [];
    for (const route of role === 'hr' ? ['/payroll/payslips'] : role === 'employee' ? ['/dashboard', '/attendance', '/leave', '/payroll/payslips', '/expenses'] : ['/hr/leaves', '/expenses']) {
      await page.goto(`${config.baseUrl}${route}`, { waitUntil: 'domcontentloaded' });
      await page.locator('h1').filter({ hasNotText: 'Opening page' }).first().waitFor({ state: 'visible' }).catch(() => undefined);
      await closeTour(page);
      await page.waitForTimeout(7000);
      await closeTour(page);
      views.push(await page.evaluate(() => ({
        path: location.pathname,
        headings: [...document.querySelectorAll('h1,h2,h3')].map(e => e.textContent.trim()),
        anchors: [...document.querySelectorAll('[data-tour-anchor]')].map(e => e.getAttribute('data-tour-anchor')),
        fields: [...document.querySelectorAll('input,select,textarea')].map(e => ({ tag: e.tagName, name: e.name, label: e.getAttribute('aria-label'), type: e.type, options: e.tagName === 'SELECT' ? [...e.options].map(o => ({ value: o.value, text: o.text })) : undefined })),
        buttons: [...document.querySelectorAll('button')].map(e => ({ text: e.textContent.trim(), disabled: e.disabled })),
      })));
      await page.screenshot({ path: path.join(output, `${role}-${route.replaceAll('/', '_')}.png`) });
      if (process.argv.includes('--forms') && role === 'employee' && ['/leave', '/expenses'].includes(route)) {
        const button = route === '/leave' ? page.getByRole('button', { name: 'Apply for leave', exact: true }) : page.getByRole('button', { name: 'Submit Expense', exact: true });
        await button.click();
        const dialog = page.getByRole('dialog');
        await dialog.waitFor({ state: 'visible' });
        await page.waitForTimeout(1500);
        views.push({ path: `${route}:form`, fields: await dialog.locator('select').evaluateAll(elements => elements.map(e => ({ name: e.name, options: [...e.options].map(o => ({ value: o.value, text: o.text })) }))) });
        await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
      }
      if (role === 'hr') {
        for (const name of ['Payslip', 'Income Tax']) {
          await page.getByRole('button', { name, exact: true }).click();
          await page.waitForTimeout(5000);
          views.push({ path: `${route}:${name}`, text: await page.locator('main').innerText().catch(() => '') });
          await page.screenshot({ path: path.join(output, `hr-${name.replaceAll(' ', '-')}.png`) });
        }
      }
    }
    session.storageState = await context.storageState();
    await context.close();
    summary.push({ role, views });
  }
  writeFileSync(path.join(output, 'views.json'), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify({ status: 'inspected', path: 'output/inspection/views.json', roles: summary.map(s => s.role) }));
} catch (error) {
  console.error(JSON.stringify(safeFailure(error)));
  process.exitCode = 1;
} finally {
  for (const session of sessions) if (runtime) await revokeRoleSession(session, runtime, api);
  if (browser) await browser.close();
  await api.dispose();
}
