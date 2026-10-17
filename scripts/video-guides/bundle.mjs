import { randomUUID } from 'node:crypto';
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { parseVideoGuideCatalog } from '../../src/modules/video-guides/catalog.mjs';

import { ffmpegPath, hashFile, probeMp4 } from './media.mjs';

export async function buildBundle(root) {
  const catalogPath = path.join(root, 'public/video-guides/catalog.json');
  const catalog = parseVideoGuideCatalog(JSON.parse(await readFile(catalogPath, 'utf8')));
  if (!catalog.videos.length) throw new Error('Add at least one video before uploading.');
  const ffmpeg = ffmpegPath(root);
  for (const video of catalog.videos) {
    const duration = probeMp4(path.join(root, 'public', video.src), ffmpeg);
    if (Math.abs(duration - video.durationSeconds) > 0.02) {
      throw new Error(
        `The duration metadata for ${video.id} differs from its MP4. Replace or re-import the guide.`
      );
    }
  }
  const buildRoot = path.join(root, '.video-guides-build');
  const id = randomUUID();
  const stage = path.join(buildRoot, `stage-${id}`);
  const archive = path.join(buildRoot, `video-guides-${id}.tar.gz`);
  await mkdir(path.join(stage, 'assets'), { recursive: true });
  try {
    await copyFile(catalogPath, path.join(stage, 'catalog.json'));
    const files = [
      ...new Set(catalog.videos.flatMap((video) => [video.src, video.poster].filter(Boolean))),
    ];
    const assets = [];
    for (const url of files) {
      const name = path.basename(url);
      const file = path.join(root, 'public/video-guides/assets', name);
      const sha256 = await hashFile(file);
      if (name.split('.')[0] !== sha256) throw new Error(`Media integrity failed: ${name}`);
      await copyFile(file, path.join(stage, 'assets', name));
      assets.push({ file: `assets/${name}`, sha256 });
    }
    await writeFile(
      path.join(stage, 'bundle.json'),
      JSON.stringify({ schemaVersion: 1, catalogSha256: await hashFile(catalogPath), assets })
    );
    const result = spawnSync(
      'tar',
      ['-czf', archive, '-C', stage, 'catalog.json', 'bundle.json', 'assets'],
      { windowsHide: true, stdio: 'inherit' }
    );
    if (result.error || result.status !== 0)
      throw new Error('Creating the upload archive failed. tar must be on PATH.');
    return { archive, sha256: await hashFile(archive), videos: catalog.videos.length };
  } finally {
    const relative = path.relative(buildRoot, stage);
    if (relative.startsWith('..') || path.isAbsolute(relative) || !relative.startsWith('stage-'))
      throw new Error('Refused unsafe staging cleanup.');
    await rm(stage, { recursive: true, force: true });
  }
}
