import { mkdirSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';

import { toolRoot } from './config.mjs';
import { safeFailure } from './contracts.mjs';
import { installPresentation, Presenter } from './presentation.mjs';
import { exportVideo, extractFrame } from './video.mjs';

const config = { viewport: { width: 1920, height: 1080 }, maxSeconds: 60, paceMs: 1200 };
const folder = path.join(toolRoot, 'output', 'preview');
mkdirSync(path.join(folder, 'raw'), { recursive: true });
const { chromium } = await import('playwright');
let browser;
let context;
try {
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext({ viewport: config.viewport, recordVideo: { dir: path.join(folder, 'raw'), size: config.viewport } });
  await installPresentation(context);
  const startedAt = performance.now();
  const page = await context.newPage();
  await page.goto('about:blank');
  await page.setContent(`<html><body style="margin:0;background:#f1f5f9;font:22px Segoe UI;color:#0f172a"><aside style="position:fixed;inset:0 auto 0 0;width:240px;background:#0f172a;color:white;padding:32px;box-sizing:border-box">HRMS<br><p style="margin-top:70px">Home</p><p>Attendance</p><p>Leave</p><p>My pay</p></aside><main style="margin-left:290px;padding:80px 80px"><h1>Recorder capability preview</h1><p>This synthetic fixture proves recording and highlighting. It is not a live HRMS walkthrough.</p><section style="background:white;border:1px solid #cbd5e1;border-radius:20px;padding:40px;margin-top:40px;width:800px"><h2>Today’s attendance</h2><label for="user">Demo employee</label><input id="user" style="display:block;padding:16px;margin-top:10px;font:inherit;border-radius:8px;border:1px solid #94a3b8"><button id="punch" style="margin-top:30px;background:#4f46e5;color:white;border:0;border-radius:10px;padding:18px 30px;font:inherit">Punch In</button><p id="result">No punch recorded in this fixture.</p></section></main><script>document.querySelector('#punch').onclick=()=>{document.querySelector('#result').textContent='Fixture punch-in recorded successfully.';document.querySelector('#punch').textContent='Punch Out';};</script></body></html>`);
  // setContent does not rerun init scripts, so install the already-defined overlay on this document.
  const p = new Presenter(page, config, 'Automated recording and field highlights', startedAt, true);
  await p.show('This is a synthetic recorder preview, using demo data.', page.getByRole('heading', { name: 'Recorder capability preview' }));
  await p.fill(page.getByLabel('Demo employee'), 'Demo Employee', 'Fields are highlighted as the recorder enters information.');
  await p.click(page.getByRole('button', { name: 'Punch In', exact: true }), 'The recorder performs the action automatically.');
  await page.getByRole('button', { name: 'Punch Out', exact: true }).waitFor({ state: 'visible' });
  await p.show('The result is checked before the outcome scene is included.', page.locator('#result'));
  const video = page.video();
  const captureElapsed = p.elapsed();
  writeFileSync(path.join(folder, 'timeline.json'), JSON.stringify({ captureElapsed, scenes: p.scenes }));
  await context.close();
  context = null;
  const raw = path.join(folder, 'raw', 'recorder-preview.webm');
  renameSync(await video.path(), raw);
  const file = path.join(folder, 'recorder-preview.mp4');
  const metadata = await exportVideo(raw, file, p.scenes, config);
  await extractFrame(file, path.join(folder, 'recorder-preview.png'), 4);
  writeFileSync(path.join(folder, 'manifest.json'), JSON.stringify({ dataMode: 'synthetic-fixture', file, ...metadata, scenes: p.scenes }, null, 2));
  console.log(JSON.stringify({ status: 'complete', dataMode: 'synthetic-fixture', file, ...metadata }));
} catch (error) {
  console.error(JSON.stringify(safeFailure(error)));
  process.exitCode = 1;
} finally {
  if (context) await context.close();
  if (browser) await browser.close();
}
