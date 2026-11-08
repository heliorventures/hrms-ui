import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { randomUUID } from 'node:crypto';

import { createRoleSession, resolveRuntime, revokeRoleSession } from './auth.mjs';
import { toolRoot, validateScenarioData } from './config.mjs';
import { requireDemo, safeFailure } from './contracts.mjs';
import { verifySourceContract } from './discover.mjs';
import { installPresentation, Presenter } from './presentation.mjs';
import { exportVideo, extractFrame } from './video.mjs';
import { prepareDemoAttachment } from './assets.mjs';
import { demoGeolocation } from './gps.mjs';

export async function runStories(config, stories, { resume } = {}) {
  verifySourceContract();
  const runTag = `${new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14)}-${randomUUID().slice(0, 4)}`;
  const runDir = path.join(toolRoot, 'output', runTag);
  mkdirSync(path.join(runDir, 'raw'), { recursive: true });
  const state = { schemaVersion: 1, runTag, baseUrl: config.baseUrl, startedAt: new Date().toISOString(), status: 'running', resources: {}, writes: [], clips: [] };
  const checkpoint = () => writeFileSync(path.join(runDir, 'manifest.json'), `${JSON.stringify(state, null, 2)}\n`);
  checkpoint();
  const { chromium, request } = await import('playwright');
  const api = await request.newContext({ timeout: config.timeoutMs });
  let browser;
  let runtime;
  const sessions = new Map();
  try {
    runtime = await resolveRuntime(config, api);
    state.tenantId = runtime.tenantId;
    if (resume) {
      const previous = JSON.parse(readFileSync(path.resolve(toolRoot, resume), 'utf8'));
      requireDemo(previous.schemaVersion === 1 && previous.baseUrl === config.baseUrl && previous.tenantId === runtime.tenantId, 'RESUME_MISMATCH', 'The supplied run manifest belongs to a different demo site or tenant.');
      state.resources = previous.resources;
      state.resumedFrom = path.relative(toolRoot, path.resolve(toolRoot, resume));
    }
    browser = await chromium.launch({ headless: config.headless !== false });
    if (stories.some(story => ['expense-submit', 'travel-submit'].includes(story.id))) await prepareDemoAttachment(browser);
    for (const story of stories) {
      const clip = { id: story.id, title: story.title, status: 'running' };
      state.clips.push(clip);
      checkpoint();
      let context;
      let page;
      let session;
      try {
        validateScenarioData(story.id, config);
        for (const resource of story.requires ?? []) requireDemo(state.resources[resource]?.id, 'DEPENDENCY_REQUIRED', `This walkthrough needs its exact submitted ${resource} request from this run or a supplied manifest.`);
        const role = story.role === 'approver' ? config.approvalRole : story.id === 'payroll' ? config.payroll?.role ?? 'employee' : story.role;
        if (role !== 'anonymous') {
          if (!sessions.has(role)) sessions.set(role, await createRoleSession(role, runtime, api));
          session = sessions.get(role);
        }
        context = await browser.newContext({
          viewport: config.viewport, locale: 'en-IN', timezoneId: runtime.timezone || 'Asia/Kolkata',
          storageState: session?.storageState, recordVideo: { dir: path.join(runDir, 'raw'), size: config.viewport },
          ...(story.id === 'punch' ? { geolocation: demoGeolocation(config.attendance) } : {}),
        });
        if (story.id === 'punch') {
          await context.grantPermissions(['geolocation'], { origin: config.baseUrl });
          clip.geolocationMode = 'simulated-demo';
        }
        await installPresentation(context);
        const startedAt = performance.now();
        page = await context.newPage();
        page.setDefaultTimeout(config.timeoutMs);
        page.setDefaultNavigationTimeout(config.timeoutMs);
        const presenter = new Presenter(page, config, story.title, startedAt);
        const ctx = { page, presenter, config, runtime, state, checkpoint, runDir, api };
        console.log(JSON.stringify({ event: 'recording', id: story.id }));
        await story.run(ctx);
        clip.dataMode = ctx.dataMode ?? 'live-demo';
        if (ctx.loginSession) sessions.set('login', ctx.loginSession);
        requireDemo(presenter.scenes.length > 0, 'EMPTY_VIDEO', 'This walkthrough produced no complete scenes.');
        await page.screenshot({ path: path.join(runDir, `${story.file}-outcome.png`) });
        const video = page.video();
        if (session) session.storageState = await context.storageState();
        const captureElapsed = presenter.elapsed();
        const timeline = { captureElapsed, scenes: presenter.scenes, viewport: config.viewport, maxSeconds: config.maxSeconds };
        writeFileSync(path.join(runDir, `${story.file}-timeline.json`), JSON.stringify(timeline, null, 2));
        clip.workflowVerified = true;
        checkpoint();
        await context.close();
        context = null;
        const rawPath = path.join(runDir, 'raw', `${story.file}.webm`);
        renameSync(await video.path(), rawPath);
        const target = path.join(runDir, `${story.file}.mp4`);
        const metadata = await exportVideo(rawPath, target, presenter.scenes, config);
        await extractFrame(target, path.join(runDir, `${story.file}-preview.png`), Math.min(2, metadata.duration / 2));
        Object.assign(clip, { status: 'complete', file: path.relative(toolRoot, target), ...metadata, captions: presenter.scenes.map(s => s.caption) });
        console.log(JSON.stringify({ event: 'complete', id: story.id, duration: metadata.duration, file: clip.file }));
      } catch (error) {
        Object.assign(clip, safeFailure(error));
        if (context && page) {
          if (session) session.storageState = await context.storageState().catch(() => session.storageState);
          await page.screenshot({ path: path.join(runDir, `${story.file}-blocked.png`) }).catch(() => undefined);
          await context.close().catch(() => undefined);
        }
        console.log(JSON.stringify({ event: clip.status, id: story.id, code: clip.code, message: clip.message }));
      }
      checkpoint();
    }
    state.status = state.clips.every(clip => clip.status === 'complete') ? 'complete' : 'incomplete';
  } catch (error) {
    state.status = 'blocked';
    state.failure = safeFailure(error);
    console.error(JSON.stringify(state.failure));
  } finally {
    for (const session of sessions.values()) if (runtime) await revokeRoleSession(session, runtime, api);
    if (browser) await browser.close();
    await api.dispose();
    state.finishedAt = new Date().toISOString();
    checkpoint();
  }
  console.log(JSON.stringify({ event: 'finished', status: state.status, manifest: path.relative(toolRoot, path.join(runDir, 'manifest.json')) }));
  return state;
}
