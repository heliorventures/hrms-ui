import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

import { toolRoot } from './config.mjs';

export async function prepareDemoAttachment(browser) {
  const file = path.join(toolRoot, '.cache', 'demo-receipt.png');
  if (existsSync(file)) return;
  mkdirSync(path.dirname(file), { recursive: true });
  const context = await browser.newContext({ viewport: { width: 960, height: 640 } });
  try {
    const page = await context.newPage();
    await page.setContent(`<html><body style="margin:0;padding:65px;background:#f1f5f9;font:20px Segoe UI;color:#0f172a;box-sizing:border-box"><div style="background:white;border:2px solid #cbd5e1;border-radius:20px;padding:40px"><p style="color:#4338ca;font-weight:700;letter-spacing:3px">HRMS DEMO TRAINING</p><h1>Sample supporting document</h1><p>Illustrative attachment for expense and travel walkthroughs.</p><hr style="border:0;border-top:1px solid #cbd5e1;margin:30px 0"><p>Demo employee · Training scenario</p><p>No purchase or travel booking was made.</p><p style="color:#b45309;font-weight:700;margin-top:35px">NOT A REAL RECEIPT OR INVOICE</p></div></body></html>`);
    await page.screenshot({ path: file });
  } finally { await context.close(); }
}
