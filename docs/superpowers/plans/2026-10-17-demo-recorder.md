# Automated HRMS Demo Recorder Implementation Plan

> For agentic workers: execute inline using superpowers:executing-plans. No automatic commits or subagent delegation.

**Goal:** Produce repeatable, highlighted HRMS training videos, at most 60 seconds each, without manual click-through or OBS.

**Approved specification:** The user approved a standalone Playwright/FFmpeg recorder and the nine previously agreed employee and approval walkthroughs. The named target, https://heliorprd.heliorsoft.com, is explicitly a disposable demo/test environment. Employee, manager, HR, and tenant-admin demo accounts exist; credentials remain local.

**Architecture:** Keep an independent Node tool in `tools/demo-recorder`, outside the application bundle. TypeScript AST discovery records source routes, labels, tour anchors, validation and workflow references. Authenticated role contexts run deterministic scenarios; a presentation layer adds highlights and captions. An exporter trims preparation/loading gaps, preserves the outcome, and refuses oversize or unverified clips. A run manifest distinguishes successful, blocked, and failed recordings.

**Tech stack:** Node 22.18+, Playwright Chromium, TypeScript compiler API, FFmpeg.

## Constraints and review focus

- Nine numbered MP4 clips, 1920x1080 by default, hard maximum 60 seconds. English captions; no synthesized narration requested.
- No application authentication weakening, source business behavior changes, automatic commits, Dart, Flutter, or broad application test runs.
- Site origin allowlist and explicit demo environment marker required before network access.
- Blank/invalid business configuration must fail; no arbitrary leave type, category, amount, date, or approver fallback.
- Role credentials/auth state stay Git-ignored and out of logs. API session setup uses the existing auth endpoint and tenant-keyed refresh contract.
- Live login CAPTCHA cannot be silently solved or bypassed. Other scenarios can use API-established or saved authenticated sessions. A login recording needing a challenge must be reported blocked until action-time approval/response is provided.
- Verify request IDs from successful mutations and target those exact requests during approval. Never approve an unrelated pending record. Pending after one workflow approval must be described as an intermediate state.
- Never automatically retry a write. Record its result before considering resumption; uncertain commit outcomes are blocked for reconciliation.
- Missing data, role access, unreachable services, and source drift must be visible in the manifest, not presented as successful clips.
- Synthetic browser proof must be labeled fixture/preview; it does not prove the deployed HRMS workflows.

## Task 1: Configuration, source discovery, and role sessions

Files: `package.json`, `.gitignore`, `.env.example`, `demo.example.json`, `src/config.mjs`, `src/discover.mjs`, `src/auth.mjs`.

- [x] Validate allowed target, bounded rendering options, named scenario configuration, attachment paths, positive monetary values, and date ranges.
- [x] Extract relevant routes/JSX labels/tour steps using TypeScript AST and record source hashes.
- [x] Build isolated role session setup from runtime `config.json`, tenant resolution, existing auth REST and refresh-storage contracts.
- [x] Verify rejected target origins, missing secrets, mismatched tenant, and source drift with focused tool checks.

## Task 2: Presentation and verified recordings

Files: `src/presentation.mjs`, `src/video.mjs`, `src/runner.mjs`, `src/cli.mjs`.

- [x] Add browser-local captions, field spotlight, and pointer animation without changing app source.
- [x] Record scene windows and verify mutation responses before recording outcome scenes.
- [x] Export complete scenes to H.264 MP4; inspect duration; publish only verified clips at or below the cap.
- [x] Keep failure artifacts separate and emit a manifest with accurate states.
- [x] Verify exporter duration/scene budget and browser recording using a clearly labeled synthetic fixture pilot.

## Task 3: All nine source-grounded walkthroughs

Files: `src/scenarios/login.mjs`, `attendance.mjs`, `leave.mjs`, `payroll.mjs`, `expenses.mjs`, `index.mjs`.

- [x] Sign in; punch in/out; self attendance; apply leave; approve exact created leave.
- [x] Salary/CTC, finalized payslip, financial-year tax projection in one readable clip.
- [x] Submit expense with receipt; submit travel with supporting file; approve exact created expense/travel and report final/intermediate workflow outcomes accurately.
- [x] Check prerequisites before writes, persist request IDs after success, and provide resumable approval input via a previous run manifest.
- [x] Supply one-time credential/configuration instructions and record the available live flows when inputs are ready.

## Verification and handoff

Use focused Node tests for configuration, source contracts, timeline limits, secret-safe failure reports, and exact request identity. Use the fixture browser pilot to prove capture/overlay/MP4 export. Run live preflight and authorized demo scenarios once credentials/configuration exist. Report actual videos and runtime gaps separately. Preserve unrelated work; leave changes uncommitted.

## Execution evidence

- Implemented the standalone recorder and source discovery across 41 relevant files. Application source was unchanged; no commit was created.
- 13 focused Node checks passed. A real local Chromium check blocked a mismatched approval ID before API transmission and confirmed the correct ID with its intermediate workflow status.
- Recorded nine MP4 clips at 1920x1080, all below 60 seconds. Eight use the live demo; payroll uses explicitly labeled browser-only sample responses because the demo accounts have no complete payroll setup.
- Live login verification used one action-time approval. All other browser steps, capture and export were automated.
- Initial GPS-enabled punch did not produce a confirmed request; a fresh summary had no open punch. An intermediate recording disabled the optional GPS checkbox; this was superseded by the GPS-enabled recording below. Initial leave date was a holiday; the approved demo example used an eligible date.
- Ruling: scene boundaries are detected in encoded frames instead of estimated from host-clock time. This preserves the last highlight and caption; initial footage was re-exported without repeating submissions.
- Reviewed action/outcome contact sheets and final payroll sample labeling. Re-recorded attendance after the live punch so its table contains an example.
- An accidental app-folder test invocation stopped before running tests because sandbox esbuild spawning returned EPERM. Only focused recorder checks were subsequently run; no app-wide test or build success is claimed.

### GPS video correction (2026-10-17)

- User requested keeping GPS enabled and clarified that only the demo video should change.
- The recorder now requires GPS enabled, grants geolocation permission only for the demo origin, and supplies explicitly configured simulated Pune coordinates (18.5204, 73.8567; accuracy 10m). A persistent `DEMO · SIMULATED GPS` badge identifies these coordinates as simulated.
- Run `20261017074231-01ef` completed both GPS-enabled punch events and confirmed the configured coordinates in both API responses. It produced an 11.6-second punch video and refreshed the 9.6-second attendance video.
- Visually reviewed the exported GPS highlight frame: checkbox remains checked, location instruction and simulation badge are readable. No application attendance policy changes were made.
