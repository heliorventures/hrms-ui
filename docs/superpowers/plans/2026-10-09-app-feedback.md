# Application feedback implementation plan

> Use superpowers:executing-plans to implement this approved migration inline.

**Goal:** Show save/update outcomes and displayed errors throughout HRMS as dismissible notifications that expire after five seconds.

**Architecture:** Add an authorization- and route-scoped notification host. Adapt legacy message displays and the existing toast component to that host. Preserve error state that controls submission, failed loading, and authorization; expiration affects presentation only. Route field error descriptions through notifications while retaining accessible field associations.

**Tech stack:** Existing React, TypeScript, Tailwind, and Vitest. No new dependencies.

**Spec:** User approval in this conversation on 2026-10-09 covers the full application migration and shared five-second toast behavior.

## Constraints

- Preserve unrelated dirty work, including loan/codegen changes and the design file.
- Do not commit, deploy, or run Dart/Flutter commands.
- Tests, lint, typechecks, and builds remain user-owned; report their commands and pending status.
- Use AST-selected display nodes, not global DOM observation or color-based runtime inference.
- Preserve retry controls, required validation state, and authorization boundaries.

## Tasks

- [x] Add notification types, context, provider, host, and lifecycle regression coverage. Cover concurrent notifications, repeated messages, expiry, retained-route ownership, modal accessibility, and feedback surviving dialog close. Authorization changes remount the provider using the existing authorization identity.
- [x] Add a declarative feedback adapter and a state-compatible notification hook for repeated scalar messages. Keep accessible field descriptions after visual expiry.
- [x] Route PageNotice errors/success and FlashToastBar through the shared host.
- [x] Migrate raw message banners across all application modules, including operator and public forms. Remove feedback-only Card wrappers; preserve business content and guards.
- [x] Audit remaining error/success render paths, source syntax, formatting, and whitespace. Document deferred validation commands.

## Execution ledger

- 2026-10-09: Approved scope confirmed. The current worktree contains unrelated loan/codegen changes; preserve them.
- Ruling: Work in the current checkout to preserve the already-reviewed header and document changes and avoid moving unrelated work.
- Ruling: Keep tests/builds/lint user-owned, overriding skill defaults that would run them automatically. Static checks do not establish runtime acceptance.
- Implementation: Five-second host notifications, manual dismissal, repeated-event renewal, per-source ownership, route generation guards, and modal-aware portals. Save flows that previously had no outcome now report success after their existing response/ownership checks.
- Review: Corrected duplicate import, delayed-route setter guards, legacy repeated-event expiry, shared-source callback provenance, setter dependencies, and notification deduplication during message changes. The fresh source review reported no remaining Critical or Important findings in the core lifecycle and selected flows.
- Recovery ruling: Error presentation expires; Retry, Reload, Download, and Back controls remain inline. Loading/empty/unavailable states and business metrics remain persistent.
- Static evidence: 228 selected source files formatted and parsed with zero syntax diagnostics; git diff --check passed. AST audit found no nested toast wrappers or expiring embedded recovery controls. No tests, lint, typecheck, build, browser, or deployment proof was obtained.
- Deferred validation from hrms-ui: `rtk npm test`, `rtk npm run lint`, `rtk npm run build`. Browser acceptance should cover successful and failed saves, repeated identical outcomes, route/account changes during requests, retry after expiration, and keyboard access inside modals.
