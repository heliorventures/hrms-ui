import { DemoError } from './contracts.mjs';

export const anchor = (page, name) => page.locator(`[data-tour-anchor="${name}"]`);

export async function closeTour(page) {
  const close = page.getByRole('button', { name: 'Close tour', exact: true });
  if (await close.isVisible()) await close.click();
}

export async function openView(page, config, route, readyAnchor) {
  await page.goto(`${config.baseUrl}${route}`, { waitUntil: 'domcontentloaded' });
  try {
    await page.locator('h1').filter({ hasNotText: 'Opening page' }).first().waitFor({ state: 'visible' });
    await closeTour(page);
    if (readyAnchor) await anchor(page, readyAnchor).waitFor({ state: 'visible' });
  } catch {
    throw new DemoError('VIEW_UNAVAILABLE', `The ${route} screen did not become available. Check role access and the deployed UI.`);
  }
}

export async function settled(locator) {
  await locator.waitFor({ state: 'visible' });
  await locator.page().waitForFunction(element => !/loading|refreshing|opening page/i.test(element.textContent), await locator.elementHandle());
}

export async function uniqueRow(page, marker) {
  const row = page.getByRole('row').filter({ hasText: marker });
  await row.waitFor({ state: 'visible' }).catch(() => {
    throw new DemoError('REQUEST_NOT_VISIBLE', 'The exact demo request is not visible in this approver queue. No other request will be approved.');
  });
  if (await row.count() !== 1) throw new DemoError('REQUEST_AMBIGUOUS', 'More than one request matches the demo marker. No approval was attempted.');
  return row;
}
