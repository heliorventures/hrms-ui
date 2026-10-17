import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import { parseVideoGuideCatalog } from '../../src/modules/video-guides/catalog.mjs';

import { buildBundle } from './bundle.mjs';
import { ffmpegPath, makePoster, probeMp4, storeAsset } from './media.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const catalogPath = path.join(root, 'public/video-guides/catalog.json');
const assetsPath = path.join(root, 'public/video-guides/assets');
const now = () => new Date().toISOString();

const DETAILS = {
  login: [
    'Getting started',
    'Sign in with your demo account and complete verification.',
    ['login', 'sign in', 'password', 'verification'],
  ],
  punch: [
    'Attendance',
    'Keep GPS enabled and record your punch in and punch out.',
    ['punch in', 'punch out', 'gps', 'location', 'check in'],
  ],
  attendance: [
    'Attendance',
    'Choose a month and review your own attendance records.',
    ['self attendance', 'attendance history', 'hours', 'month'],
  ],
  'leave-apply': [
    'Leave',
    'Choose a leave type and dates, then submit your request.',
    ['apply leave', 'leave request', 'holiday'],
  ],
  'leave-approve': [
    'Leave',
    'Review and approve a leave request as a manager or HR.',
    ['approve leave', 'manager', 'hr', 'approval'],
  ],
  payroll: [
    'Payroll',
    'View your payslip, salary CTC and projected income tax.',
    ['payslip', 'pay slip', 'ctc', 'salary', 'tax', 'tds'],
  ],
  'expense-submit': [
    'Expenses & travel',
    'Add an expense claim and attach its receipt.',
    ['expense', 'claim', 'receipt', 'reimbursement'],
  ],
  'travel-submit': [
    'Expenses & travel',
    'Enter your travel details and submit a request.',
    ['travel', 'trip', 'journey', 'request'],
  ],
  'expense-travel-approve': [
    'Expenses & travel',
    'Review expense and travel requests and record your approval step.',
    ['approve expense', 'approve travel', 'manager', 'hr', 'approval'],
  ],
};

async function loadCatalog() {
  if (!existsSync(catalogPath)) return { schemaVersion: 1, updatedAt: now(), videos: [] };
  return parseVideoGuideCatalog(JSON.parse(await readFile(catalogPath, 'utf8')));
}

async function saveCatalog(catalog) {
  catalog.updatedAt = now();
  parseVideoGuideCatalog(catalog);
  await mkdir(path.dirname(catalogPath), { recursive: true });
  const temporary = `${catalogPath}.${randomUUID()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(catalog, null, 2)}\n`);
  await rename(temporary, catalogPath);
}

async function media(file, poster) {
  const absolute = path.resolve(file);
  const ffmpeg = ffmpegPath(root);
  const durationSeconds = probeMp4(absolute, ffmpeg);
  const src = await storeAsset(absolute, assetsPath, 'mp4');
  if (poster) {
    return {
      src,
      durationSeconds,
      poster: await posterAsset(poster),
    };
  }
  const temporary = path.join(root, '.video-guides-build', `${randomUUID()}.png`);
  await mkdir(path.dirname(temporary), { recursive: true });
  try {
    makePoster(absolute, temporary, ffmpeg);
    return { src, durationSeconds, poster: await storeAsset(temporary, assetsPath, 'png') };
  } finally {
    if (existsSync(temporary)) await unlink(temporary);
  }
}

async function posterAsset(file) {
  const extension = path.extname(file).toLowerCase().slice(1);
  if (!['png', 'jpg', 'webp'].includes(extension))
    throw new Error('Posters must be PNG, JPG or WebP.');
  return storeAsset(path.resolve(file), assetsPath, extension);
}

async function importRecorder(source, catalog) {
  const sourcePath = path.resolve(source);
  const recording = JSON.parse(await readFile(sourcePath, 'utf8'));
  if (!Array.isArray(recording.clips) || !recording.clips.length)
    throw new Error('The recorder catalog contains no clips.');
  for (const clip of recording.clips) {
    if (!DETAILS[clip.id])
      throw new Error(`Choose feature metadata manually for unknown recorder clip: ${clip.id}`);
    for (const name of [clip.file, clip.poster]) {
      if (typeof name !== 'string' || path.basename(name) !== name || /[\\/]/.test(name))
        throw new Error('The recorder catalog contains an unsafe media path.');
    }
    const [feature, description, keywords] = DETAILS[clip.id];
    const guide = {
      id: clip.id,
      title: clip.title,
      feature,
      description,
      keywords,
      ...(await media(
        path.join(path.dirname(sourcePath), clip.file),
        path.join(path.dirname(sourcePath), clip.poster)
      )),
      disclosure:
        clip.dataMode === 'sample-payroll'
          ? 'sample-payroll'
          : clip.geolocationMode === 'simulated-demo'
            ? 'simulated-gps'
            : 'demo',
      updatedAt: now(),
    };
    const index = catalog.videos.findIndex((video) => video.id === guide.id);
    if (index === -1) catalog.videos.push(guide);
    else catalog.videos[index] = guide;
  }
}

async function edit(command, options, catalog) {
  const existing = catalog.videos.find((video) => video.id === options.id);
  if (command === 'add' && existing)
    throw new Error('That video ID exists. Use replace to update it.');
  if (command === 'replace' && !existing)
    throw new Error('That video ID does not exist. Use add for a new guide.');
  if (!options.file && !existing) throw new Error('A video file is required.');
  const guide = {
    ...existing,
    id: options.id,
    title: options.title || existing?.title,
    feature: options.feature || existing?.feature,
    description: options.description || existing?.description,
    keywords: options.keywords
      ? options.keywords
          .split(',')
          .map((word) => word.trim())
          .filter(Boolean)
      : (existing?.keywords ?? []),
    disclosure: options.disclosure || existing?.disclosure || 'demo',
    updatedAt: now(),
    ...(options.file ? await media(options.file, options.poster) : {}),
  };
  if (!options.file && options.poster) guide.poster = await posterAsset(options.poster);
  parseVideoGuideCatalog({ schemaVersion: 1, updatedAt: now(), videos: [guide] });
  if (existing) catalog.videos[catalog.videos.indexOf(existing)] = guide;
  else catalog.videos.push(guide);
}

try {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: Object.fromEntries(
      [
        'source',
        'id',
        'file',
        'poster',
        'title',
        'feature',
        'description',
        'keywords',
        'disclosure',
      ].map((key) => [key, { type: 'string' }])
    ),
  });
  const [command] = positionals;
  if (command === 'package') {
    console.log(JSON.stringify(await buildBundle(root)));
  } else {
    const catalog = await loadCatalog();
    if (command === 'import')
      await importRecorder(
        values.source || path.join(root, 'tools/demo-recorder/output/deliverables/catalog.json'),
        catalog
      );
    else if (['add', 'replace'].includes(command)) await edit(command, values, catalog);
    else throw new Error('Choose import, add, replace or package.');
    await saveCatalog(catalog);
    console.log(
      JSON.stringify({ status: 'prepared', videos: catalog.videos.length, catalog: catalogPath })
    );
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : 'The video guide operation failed.');
  process.exitCode = 1;
}
