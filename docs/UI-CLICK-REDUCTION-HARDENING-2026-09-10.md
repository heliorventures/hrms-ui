# UI click reduction hardening — 2026-09-10

This record supersedes the remaining implementation gaps in `UI-CLICK-REDUCTION-IMPLEMENTATION-2026-09-10.md`. Scope is the six approved click-reduction changes and their supporting code. Code hardening is implemented; production acceptance still requires signed-in browser checks and rollout. This is not a claim of zero debt across the entire HRMS.

## Completed implementation

- [x] Approval queue: batched exact workflow authority, bounded candidate processing, consistent read snapshot, regression and scaling coverage.
- [x] HR queue UI: independent holiday loading, timeout/cancellation/retry, distinct failure states, and smaller components/hooks.
- [x] Leave forms and attendance: remove scoped complexity/lint debt and preserve historical-row creation, concurrency checks, and direct leave entry.
- [x] Private state ownership: invalidate drafts, attachment uploads, editor targets, focus callbacks, and mutation callbacks across client/user/employee/authorization changes, including A ? B ? A.
- [x] Integration: generated schema compatibility, production build, gateway contract guard, and real disposable-database migration execution.
- [x] Independent review: resolve authority, timeout ownership, draft isolation, and attendance editor findings.
- [ ] Signed-in employee/manager/HR browser acceptance and production rollout.

### Approval query and database

The GraphQL contract is unchanged. A read-only REPEATABLE READ transaction covers permission scope, candidates, exact action authority, totals, labels, attachments, and workflow stages. Authority lookup is batched; prepared scope sets avoid repeated linear membership checks. Only selected-page DTOs are built, and their nested action/stage fields use seeded caches. The internal candidate batch is 1,000; the public page limit remains 200.

Authority remains identical to mutation-time rules: exact permission and scope, reporting-manager relationship, tenant/entity/workflow/current-step association, active employee checks, and self-approval denial. Legacy unsupported authority fails closed. Display-stage fallback does not broaden action authority.

Migration `0081_leave_approval_queue_index` adds a concurrent partial index on `(tenant_id, applied_at DESC, id DESC)` for non-deleted leave requests. Tuple cursor comparison makes PostgreSQL seek into that index; the earlier OR predicate still filtered prior rows. The migration runs outside a transaction and includes concurrent rollback. It intentionally does not hide an invalid interrupted index with `IF NOT EXISTS`; inspect and remove an invalid index before retrying a failed deployment.

Gateway startup now requires `Query.leaveApprovalQueue`, preventing an old leave schema from satisfying the client contract.

### UI behavior and ownership

The approval queue no longer waits for holidays. Leave application loads holidays on demand, deduplicates requests, caches successful data for five minutes, and offers retry after failure or a 30-second timeout. Each request owns its timer and abort controller. Submission stays disabled while holiday data is unavailable.

Leave application remounts private draft state on an owner change. Upload ownership is checked after file encoding and before upload/mutation. Stale completion and focus callbacks cannot act on a replacement form. Personal leave data requests and actions reject obsolete owner/query responses. Attendance editor selections are owner-tagged and unmount immediately when their owner changes; old save/close callbacks cannot refresh or close a new editor.

Personal attendance, personal leave, HR queue, managed attendance, and shared leave forms are separated into cohesive presentation and state units without lint-rule suppression. Existing direct links, remembered non-sensitive filters, compact mobile rows, historical Add segment context, expected workflow step, and expected attendance update checks are preserved.

## Verification

- UI TypeScript and Vite production build passed. Existing build notices remain for outdated Browserslist data and a shared bundle above 500 kB; no repository-wide bundle/dependency cleanup is claimed.
- UI regression: 118 tests passed across 22 files (105 in the final combined run, plus 13 personal-leave tests rerun after their test-only lint corrections). Scoped ESLint passed across all 72 changed UI source/test files with zero errors and zero warnings. Diff whitespace checks passed.
- Rust common library: 65 tests passed. Leave binary: 54 passed, one opt-in PostgreSQL test ignored by the ordinary command; that integration test passed separately against the disposable database.
- PostgreSQL integration exercised actual queue loading, authority parity, tenant/scope denial, self/legacy/association cases, multi-batch pagination, stage fallback, and concurrent changes to status, workflow steps, reporting relationships, and labels under the consistent snapshot.
- Gateway: 7 tests and TypeScript passed, including an observed failing contract regression before the fix.
- Leave schema export and client generation/validation passed with no generated contract change. Export SHA-256: `794BD50660D03C857296916C818808464A57B069AF5C526390CF538F66C32C76`.
- Liquibase 4.28 validation passed; SQL-block checks passed (5 tests). Migration update and rollback both passed through the actual bundled Liquibase runner on a fresh synthetic schema.
- Rust formatting could not be checked with rustfmt: the installed toolchain manifest reports the component but its executable is missing. The component repair attempt also failed. Changed Rust was manually reviewed; no formatter success is claimed. Six existing dead-code warnings in leave administration remain outside the queue changes.

### Measured performance

| Local synthetic check | Before | After |
| --- | --- | --- |
| Full queue loader, 10,000 candidates, offset 0 | 304 SELECTs / 3,539 ms | 64 SELECTs / 917 ms |
| Full queue loader, 10,000 candidates, offset 9,800 | 304 SELECTs / 2,566 ms | 64 SELECTs / 890 ms |
| Candidate page query, 50,000 seeded rows, actual Liquibase index run | 12.646 ms | 0.306 ms |

The index test returned 200 rows, removed the sort, verified an actual composite cursor index condition, and verified rollback. Full loader runs checked exact totals and page IDs. Timings are local Docker/debug-build observations, not production SLOs; the 10,000-row fixture used one active subject and a permission workflow. Exact counts still require examining the matching candidate range, with bounded memory and batched queries.

## Release acceptance still required

No connected browser was available (`agent.browsers.list()` returned `[]`). A non-production URL and signed-in test session were requested. UI port 5173 was listening, but gateway 4009 and leave service 4014 were not. Therefore real session integration, keyboard/focus behavior, responsive layouts, click counts, and deployed tenant behavior remain unverified.

Before production sign-off:

1. Apply migration 0081 through the normal tenant migration process and verify the index is valid.
2. Release the leave service, then the strict gateway and matching UI. Verify gateway schema readiness before accepting traffic.
3. Use employee, manager, and HR sessions to check direct Request leave, dirty dismissal, holiday failure/retry, historical attendance creation, queue filtering/pagination, approval/rejection, and owner/session changes. Confirm server denial for unauthorized and self-approval attempts.
4. Measure the deployed queue against representative tenant volumes and workflow distributions.

The disposable container `codex-leave-queue-hardening-20260910` was stopped and removed after testing. Normal local PostgreSQL and live tenant data were untouched. No deployment, commit, or push command was issued by this agent. Concurrent activity committed gateway changes as `f8b42e6`, the initial database changes as `b1ed79c`, and Liquibase test support as `490c83f`; UI work remains available for manual review. Unrelated UI configuration, performance/survey, and import-script changes were preserved.

## Repeatable database verification

Create only the named disposable fixture:

```powershell
docker run --rm -d --name codex-leave-queue-hardening-20260910 -p 127.0.0.1:15439:5432 -e POSTGRES_USER=queue_test -e POSTGRES_PASSWORD=queue_test_local_only -e POSTGRES_DB=leave_queue_test postgres:16-alpine -c shared_preload_libraries=pg_stat_statements -c pg_stat_statements.track=all
```

After PostgreSQL is ready, from `hrms-database`:

```powershell
py -3 scripts/test-leave-queue-index.py --liquibase
```

From `hrms-svc`:

```powershell
$env:KABIPAY_QUEUE_TEST_DATABASE_URL = 'postgresql://queue_test:queue_test_local_only@127.0.0.1:15439/leave_queue_test'
cargo test --offline -p kabipay-leave --bin kabipay-leave postgres_queue_authority_parity_scaling_and_snapshot -- --ignored --nocapture
```

Stop the fixture after verification:

```powershell
docker stop codex-leave-queue-hardening-20260910
```

Local detailed evidence is in `.codex-tmp/hardening-ui-final-tests.json`, `.codex-tmp/hardening-ui-final-lint.json`, and `.codex-tmp/leave-queue-index-liquibase-plan.json`; these local artifacts are not deployment prerequisites.
