import { spawn } from 'node:child_process';
import { renameSync } from 'node:fs';
import ffmpeg from 'ffmpeg-static';

import { DemoError, parseSceneWindows, requireDemo, scenesForExport } from './contracts.mjs';

function execute(args, acceptProbeExit = false) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpeg, args, { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
    let diagnostic = '';
    child.stderr.on('data', data => { diagnostic = (diagnostic + data).slice(-16000); });
    child.on('error', () => reject(new DemoError('FFMPEG_UNAVAILABLE', 'FFmpeg could not start. Reinstall the recorder dependencies.', 'failed')));
    child.on('close', code => {
      if (code === 0 || (acceptProbeExit && code === 1)) resolve(diagnostic);
      else reject(new DemoError('VIDEO_EXPORT_FAILED', 'FFmpeg could not export this video. Its raw recording has been retained.', 'failed'));
    });
  });
}

export async function probeVideo(file) {
  const output = await execute(['-hide_banner', '-i', file], true);
  const match = /Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/.exec(output);
  const size = /Video:.*?\b(\d{3,5})x(\d{3,5})\b/.exec(output);
  requireDemo(match && size, 'VIDEO_INVALID', 'The recording has no readable duration or dimensions.');
  return { duration: Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]), width: Number(size[1]), height: Number(size[2]) };
}

export async function detectSceneWindows(raw, legacyCaptionProbe = false) {
  const filter = legacyCaptionProbe
    ? 'crop=8:8:iw/2:ih-42,format=gray,blackdetect=d=0.08:pix_th=0.2:pic_th=0.95'
    : 'crop=12:12:iw-12:ih-12,format=rgba,colorkey=0x00FF00:0.2:0,alphaextract,blackdetect=d=0.08:pix_th=0.1:pic_th=0.95';
  return parseSceneWindows(await execute(['-hide_banner', '-nostats', '-i', raw, '-vf', filter, '-an', '-f', 'null', '-']));
}

export async function exportVideo(raw, output, scenes, config) {
  const input = await probeVideo(raw);
  const windows = await detectSceneWindows(raw, config.legacyCaptionProbe === true);
  if (!config.legacyCaptionProbe) requireDemo(windows.length === scenes.length, 'SCENE_COUNT_MISMATCH', 'The encoded recording does not contain every expected complete scene.');
  const timeline = scenesForExport(windows, config.maxSeconds, input.duration);
  const filters = timeline.windows.map(({ start, end }, index) => `[0:v]trim=start=${start.toFixed(3)}:end=${end.toFixed(3)},setpts=PTS-STARTPTS[v${index}]`);
  const mask = config.legacyCaptionProbe ? '' : ',drawbox=x=iw-16:y=ih-16:w=16:h=16:color=0xf1f5f9:t=fill';
  filters.push(`${timeline.windows.map((_, index) => `[v${index}]`).join('')}concat=n=${timeline.windows.length}:v=1:a=0,fps=30${mask},format=yuv420p[out]`);
  const partial = output.replace(/\.mp4$/, '.partial.mp4');
  await execute(['-hide_banner', '-loglevel', 'error', '-y', '-i', raw, '-filter_complex', filters.join(';'), '-map', '[out]', '-an', '-c:v', 'libx264', '-preset', 'faster', '-crf', '20', '-movflags', '+faststart', partial]);
  const result = await probeVideo(partial);
  requireDemo(result.duration <= config.maxSeconds && result.duration > 0 && result.width === config.viewport.width && result.height === config.viewport.height, 'VIDEO_CONTRACT_FAILED', 'Exported video duration or dimensions do not meet the recording contract.');
  renameSync(partial, output);
  return result;
}

export async function extractFrame(file, output, seconds) {
  await execute(['-hide_banner', '-loglevel', 'error', '-y', '-ss', String(seconds), '-i', file, '-frames:v', '1', output]);
}
