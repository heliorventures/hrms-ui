import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import ffmpeg from 'ffmpeg-static';

import { toolRoot } from './config.mjs';
import { safeFailure, requireDemo } from './contracts.mjs';

const folder = path.join(toolRoot, 'output', 'deliverables');
const { clips } = JSON.parse(readFileSync(path.join(folder, 'catalog.json'), 'utf8'));
requireDemo(clips.length === 9, 'VIDEO_MISSING', 'Visual QA expects all nine clips.');

function sheet(files, output) {
  return new Promise((resolve, reject) => {
    const filters = files.map((_, i) => `[${i}:v]scale=640:360[v${i}]`);
    filters.push(`${files.map((_, i) => `[v${i}]`).join('')}xstack=inputs=9:layout=0_0|640_0|1280_0|0_360|640_360|1280_360|0_720|640_720|1280_720[out]`);
    const args = ['-hide_banner', '-loglevel', 'error', '-y', ...files.flatMap(file => ['-i', file]), '-filter_complex', filters.join(';'), '-map', '[out]', '-frames:v', '1', output];
    const child = spawn(ffmpeg, args, { windowsHide: true, stdio: 'ignore' });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(new Error('Contact sheet failed.')));
  });
}

try {
  await sheet(clips.map(clip => path.join(folder, clip.poster)), path.join(folder, 'qa-actions.png'));
  await sheet(clips.map(clip => path.join(folder, clip.file.replace('.mp4', '-last.png'))), path.join(folder, 'qa-outcomes.png'));
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
    await page.goto(new URL(`file:///${path.join(folder, 'index.html').replaceAll('\\', '/')}`).href);
    await page.screenshot({ path: path.join(folder, 'gallery-preview.png'), fullPage: true });
  } finally { await browser.close(); }
  console.log(JSON.stringify({ status: 'complete', actionSheet: 'output/deliverables/qa-actions.png', outcomeSheet: 'output/deliverables/qa-outcomes.png', gallery: 'output/deliverables/gallery-preview.png' }));
} catch (error) { console.error(JSON.stringify(safeFailure(error))); process.exitCode = 1; }
