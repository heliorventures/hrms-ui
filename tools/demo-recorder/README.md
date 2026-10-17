# HRMS demo recording agent

Automates nine HRMS walkthroughs in a dedicated Chromium browser. It adds field spotlights, a visible pointer and English captions, verifies outcomes, and exports silent H.264 MP4 videos at 1920×1080 with a hard 60-second limit. OBS and manual click-through are not required.

The app source and business behavior are unchanged. The tool has its own dependencies and lockfile.

## Current recordings

Open `output/deliverables/index.html` for the video gallery. It contains numbered MP4 files and a `catalog.json` with durations and data modes. Raw captures and run evidence remain under `output/<run>/`.

Eight walkthroughs use the authorized demo site. The salary/payslip/tax video uses explicit browser-only sample responses because the inspected demo accounts have no configured salary structure/finalized payslip/tax projection. Its persistent badge says **SAMPLE PAYROLL DATA**. It creates no payroll records or payments.

## One-time setup

Use Node 22.18 or later. Commands run from this directory in PowerShell:

```powershell
npm.cmd ci
npm.cmd run install:browser
Copy-Item .env.example .env.local
Copy-Item demo.example.json demo.local.json
```

Skip the copy commands when local files already exist. Enter demo passwords directly in `.env.local`. These files, auth states, downloaded browser binaries, attachments and outputs are Git-ignored. Never send passwords through command arguments or put auth state in Git.

Set the target origin, verified API origins, role, valid dates, exact leave/category labels, positive amounts and attachment paths in `demo.local.json`. Blank or invalid business values stop their scenario. The provided local setup uses the explicitly authorized demo tenant and named fake accounts.

## Run the agent

```powershell
npm.cmd run discover
npm.cmd run check
npm.cmd run record
npm.cmd run package:videos
```

`discover` uses TypeScript AST parsing on a narrow list of relevant files, recording actual route paths, labels, tour anchors, capabilities and source hashes. Review source changes before regenerating a baseline; the recorder rejects drift. The scenario scripts implement the verified workflows. AST discovery is not a guarantee that arbitrary future business changes can be inferred safely.

`check` logs into the configured demo roles and inspects their screens without business submissions. Runtime API destinations are verified against the explicit API allowlist. Other than the login film, role sessions are established through the site's existing auth endpoint and tenant-keyed refresh contract; no CAPTCHA bypass or auth weakening is added to the app.

`record` handles all clicks, typing, attachments, pauses, capture and export. It detects scene markers in the **encoded video frames**, trims preparation/loading gaps and retains complete action and outcome scenes; the marker is removed from the finished frame. It refuses over-budget clips rather than chopping off their outcome. The output manifest distinguishes completed, blocked and failed clips; no automatic write retries are made.

For a local capability check without site access:

```powershell
npm.cmd run preview
npm.cmd test
```

The preview is a clearly labeled synthetic fixture, not evidence that an HRMS workflow passed.

## Scenarios and selective reruns

| ID | Video | Required role/data |
| --- | --- | --- |
| `login` | Sign in | Employee credentials; current challenge approval |
| `punch` | Punch in/out | Employee; no existing open punch |
| `attendance` | My attendance | Employee; optional month/year |
| `leave-apply` | Apply for leave | Employee; eligible leave type/dates/balance |
| `leave-approve` | Approve leave | Approver assigned to the exact submitted request |
| `payroll` | Payslip, CTC and tax | Current salary, finalized payslip and tax data, or explicitly configured sample mode |
| `expense-submit` | Submit expense | Employee; active category, positive amount, receipt |
| `travel-submit` | Request travel | Employee; valid trip details and supporting file |
| `expense-travel-approve` | Approve expense/travel | Approver assigned to both exact submitted requests |

```powershell
npm.cmd run record -- --only attendance,payroll
npm.cmd run record -- --only leave-approve --resume output/<run>/manifest.json
```

Approval targets use IDs saved from confirmed submissions and unique demo markers. A network guard rejects an approval if the UI tries to send a different request ID. A `PENDING` response after approval is described as a recorded step awaiting another approver, not final approval.

Before rerunning any submission with an `uncertain` write in its manifest, reconcile the demo records. A timeout is not evidence of cancellation. Use an existing manifest for approvals; never substitute an unrelated pending request.

The punch walkthrough requires `attendance.recordGps: true` and keeps the GPS checkbox checked for both punches. Configure `attendance.geolocation` with `mode: "simulated-demo"`, numeric `latitude`, `longitude` and `accuracy`. The recorder grants location access only to the configured demo site, supplies these simulated coordinates, and checks that both punch responses include them. A persistent `DEMO · SIMULATED GPS` badge identifies the simulation. Captions instruct employees to keep GPS enabled and allow browser location access. This recording setting does not change the application's attendance policy or prevent employees from changing their browser permissions.

## Login verification

The live sign-in page contains a CAPTCHA. When recording login, the agent pauses **before** completing it and emits `captcha-confirmation-required` with a one-use challenge ID and approval-file path. The controlling agent requests action-time approval, then sets that exact file's decision to `approved` or `denied`. Approval is consumed once and cannot authorize a later challenge. The wait is excluded from the finished video. Other eight scenarios can run unattended through their role sessions.

## Sample payroll mode

Set `payroll.dataMode` to `sample` and `payroll.payPeriodLabel` to `September 2026` for the bundled illustrative fixture. Known payroll **read** operations are intercepted inside this browser context; financial mutations are rejected. The payroll video displays a sample-data badge, and its manifest records `sample-payroll`. Set `dataMode` to `live` once the demo employee has proper payroll configuration.

## Limits of verification

Source facts prove what the inspected code contains. Focused Node checks prove recorder invariants. The synthetic preview proves browser capture/overlay/export. A completed live-demo clip additionally requires successful expected responses and its outcome view. Sample payroll proves the actual UI walkthrough with fixtures, not backend payroll or tax calculation correctness. A source hash does not prove the deployed bundle is identical; live selectors/outcomes still need checking.

Use the supplied agent runbook for future recording requests. No automatic commits are made.
