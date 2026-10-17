import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { toolRoot } from './config.mjs';
import { requireDemo, safeFailure } from './contracts.mjs';
import { stories } from './scenarios/index.mjs';
import { probeVideo, extractFrame } from './video.mjs';

const escapeHtml = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const output = path.join(toolRoot, 'output');
const destination = path.join(output, 'deliverables');

try {
  mkdirSync(destination, { recursive: true });
  const manifests = readdirSync(output, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && /^\d{14}(?:-[a-f0-9]{4})?$/.test(entry.name))
    .map(entry => JSON.parse(readFileSync(path.join(output, entry.name, 'manifest.json'), 'utf8')))
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const catalog = [];
  for (const story of stories) {
    const run = manifests.find(manifest => manifest.clips.some(clip => clip.id === story.id && clip.status === 'complete'));
    requireDemo(run, 'VIDEO_MISSING', `No verified completed recording exists for ${story.id}.`);
    const clip = run.clips.find(item => item.id === story.id && item.status === 'complete');
    const source = path.resolve(toolRoot, clip.file);
    const relative = path.relative(output, source);
    requireDemo(!relative.startsWith('..') && !path.isAbsolute(relative) && existsSync(source), 'INVALID_VIDEO_PATH', 'A run manifest points outside the recording output folder or to a missing file.');
    const metadata = await probeVideo(source);
    requireDemo(metadata.duration > 0 && metadata.duration <= 60 && metadata.width === 1920 && metadata.height === 1080, 'VIDEO_CONTRACT_FAILED', 'A completed clip does not meet the 1080p/60-second delivery contract.');
    const file = `${story.file}.mp4`;
    copyFileSync(source, path.join(destination, file));
    const poster = `${story.file}.png`;
    await extractFrame(source, path.join(destination, poster), Math.min(2, metadata.duration / 2));
    await extractFrame(source, path.join(destination, `${story.file}-last.png`), Math.max(0, metadata.duration - 0.6));
    catalog.push({ id: story.id, title: story.title, file, poster, dataMode: clip.dataMode ?? 'live-demo', ...(clip.geolocationMode ? { geolocationMode: clip.geolocationMode } : {}), ...metadata, sourceRun: run.runTag, captions: clip.captions });
  }
  writeFileSync(path.join(destination, 'catalog.json'), JSON.stringify({ generatedAt: new Date().toISOString(), clips: catalog }, null, 2));
  const cards = catalog.map((clip, index) => `<article><div class="card-top"><span>${String(index + 1).padStart(2, '0')}</span><span class="badge ${clip.dataMode === 'sample-payroll' ? 'sample' : ''}">${clip.dataMode === 'sample-payroll' ? 'Illustrative payroll data' : 'Demo site'} · ${clip.duration.toFixed(1)}s</span></div><h2>${escapeHtml(clip.title)}</h2><video controls preload="none" playsinline poster="${clip.poster}" src="${clip.file}"></video><a href="${clip.file}" download>Download MP4</a></article>`).join('\n');
  writeFileSync(path.join(destination, 'index.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Helior HRMS — Feature walkthroughs</title><style>*{box-sizing:border-box}body{margin:0;background:#f1f5f9;color:#0f172a;font-family:Inter,Segoe UI,Arial,sans-serif}header,main{max-width:1440px;margin:auto;padding:32px}header{padding-top:50px}header p{color:#475569;max-width:900px;line-height:1.6}h1{font-size:36px;margin:12px 0}h2{font-size:20px;margin:18px 0}.eyebrow{font-size:13px;color:#4f46e5;font-weight:700;letter-spacing:2px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(350px,1fr));gap:24px}article{background:white;border:1px solid #e2e8f0;border-radius:20px;padding:22px;box-shadow:0 8px 24px #0f172a06}video{width:100%;aspect-ratio:16/9;border-radius:12px;background:#0f172a}.card-top{display:flex;align-items:center;justify-content:space-between;font-size:15px;color:#64748b}.badge{font-size:12px;background:#ecfdf5;color:#047857;border-radius:999px;padding:6px 10px}.sample{background:#fff7ed;color:#9a3412}a{display:inline-block;margin-top:16px;color:#4338ca;font-weight:600;text-decoration:none}a:focus-visible,video:focus-visible{outline:3px solid #6366f1;outline-offset:5px}footer{padding:0 32px 40px;text-align:center;color:#64748b;font-size:13px}@media(max-width:600px){header,main{padding:22px}.grid{grid-template-columns:1fr}h1{font-size:28px}}</style></head><body><header><span class="eyebrow">HELIOR HRMS · DEMO TRAINING</span><h1>Learn one task at a time.</h1><p>Nine short walkthroughs with field highlights and captions. All clips are 1080p and under one minute. Payroll uses clearly labeled illustrative figures; the other clips were recorded on the authorized demo site. Approval can represent one step in a longer workflow.</p></header><main class="grid">${cards}</main><footer>English captions · Silent videos · Fake training records · No production payroll changes</footer></body></html>`);
  console.log(JSON.stringify({ status: 'complete', clips: catalog.length, gallery: path.join(destination, 'index.html'), durations: catalog.map(clip => ({ id: clip.id, seconds: clip.duration, dataMode: clip.dataMode })) }));
} catch (error) {
  console.error(JSON.stringify(safeFailure(error)));
  process.exitCode = 1;
}
