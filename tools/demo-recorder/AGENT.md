# Recording agent runbook

When asked to regenerate HRMS demo videos, work in this tool directory and use its existing scripts. The user already authorized the named demo/test site, sample submissions and approvals. Respect the user's current scope and credential policy.

1. Read `README.md` and the latest `output/<run>/manifest.json`. Inspect the Git diff. Preserve local credentials, existing data and unrelated changes.
2. Inspect only changed, relevant source contracts. Use the discovery AST output and the scenario's exact routes/labels/validators/mutation definitions to update the walkthrough. Do not blindly regenerate hashes to silence drift.
3. Read configuration and credential **presence**, never print credential values, auth headers, tokens or whole request objects. Use the existing Git-ignored `.env.local`. Ask only for missing inputs that cannot be obtained from authorized demo screens.
4. Run the relevant focused tool checks. Keep app-wide tests/builds outside this recording task; never run Dart or Flutter. Install only missing recorder dependencies/browser assets, inside the tool cache.
5. Launch `npm.cmd run record -- --only <ids>` with the required access to launch Chromium/connect to the allowlisted demo endpoints. All browser actions and MP4 capture are scripted.
6. On `captcha-confirmation-required`, request approval for that **currently open** challenge. After approval, update only the emitted one-use approval file with its existing challenge ID and `decision: approved`. Never grant standing CAPTCHA approval.
7. Monitor emitted events. Reconcile uncertain submissions before any resubmission. Use exact confirmed IDs from a manifest for approval reruns. Never approve arbitrary pending requests or invent configuration to hide invalid business data.
8. Inspect exported action/outcome frames. Confirm outcome status, captions, highlights, dimensions, duration and explicit sample-data labels. Fix recording problems without weakening product validation.
9. Package all completed clips using `npm.cmd run package:videos`. Give the user the gallery and MP4 bundle, with an explicit note about any sample/blocked flows. Do not call missing or unverified recordings complete. Leave code uncommitted.
