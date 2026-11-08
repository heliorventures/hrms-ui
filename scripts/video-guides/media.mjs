import { createHash } from 'node:crypto';
import { createReadStream, existsSync } from 'node:fs';
import { copyFile, mkdir, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

export async function hashFile(file) {
  const digest = createHash('sha256');
  for await (const chunk of createReadStream(file)) digest.update(chunk);
  return digest.digest('hex');
}

export function ffmpegPath(root) {
  if (process.env.VIDEO_GUIDES_FFMPEG) return process.env.VIDEO_GUIDES_FFMPEG;
  try {
    const require = createRequire(path.join(root, 'tools/demo-recorder/package.json'));
    const bundled = require('ffmpeg-static');
    if (bundled && existsSync(bundled)) return bundled;
  } catch {
    /* A native FFmpeg installation is also supported. */
  }
  return 'ffmpeg';
}

export function probeMp4(file, ffmpeg) {
  const result = spawnSync(ffmpeg, ['-hide_banner', '-i', file], {
    encoding: 'utf8',
    windowsHide: true,
  });
  if (result.error)
    throw new Error(
      'FFmpeg is required. Install the demo recorder dependencies, put ffmpeg on PATH, or set VIDEO_GUIDES_FFMPEG.'
    );
  const duration = result.stderr.match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
  if (
    !duration ||
    !/Video:\s*h264\b/.test(result.stderr) ||
    !/Input #0, .*mp4/.test(result.stderr)
  ) {
    throw new Error('Use a valid MP4 video encoded as H.264.');
  }
  const seconds = Number(duration[1]) * 3600 + Number(duration[2]) * 60 + Number(duration[3]);
  if (!(seconds > 0 && seconds <= 60))
    throw new Error('Each video must be longer than zero and at most 60 seconds.');
  return seconds;
}

export async function storeAsset(file, directory, extension) {
  const metadata = await stat(file);
  if (!metadata.isFile() || metadata.size === 0 || metadata.size > 100 * 1024 * 1024)
    throw new Error('Each media file must be non-empty and at most 100 MiB.');
  const digest = await hashFile(file);
  const name = `${digest}.${extension}`;
  await mkdir(directory, { recursive: true });
  const target = path.join(directory, name);
  if (existsSync(target)) {
    if ((await hashFile(target)) !== digest)
      throw new Error('A stored media asset failed its integrity check.');
  } else await copyFile(file, target);
  return `/video-guides/assets/${name}`;
}

export function makePoster(file, target, ffmpeg) {
  const result = spawnSync(
    ffmpeg,
    [
      '-hide_banner',
      '-loglevel',
      'error',
      '-y',
      '-i',
      file,
      '-frames:v',
      '1',
      '-vf',
      'scale=960:-2',
      target,
    ],
    { encoding: 'utf8', windowsHide: true }
  );
  if (result.error || result.status !== 0)
    throw new Error(
      'Could not generate the video poster. Provide a PNG, JPG or WebP poster explicitly.'
    );
}
