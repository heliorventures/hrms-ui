# Home UI handoff — 2026-09-10

## Implemented

- Navigation, page title, and return links say **Home**. `/dashboard` remains the route; command search still accepts “dashboard.”
- `src/modules/dashboard/Dashboard.tsx` uses a responsive two-column layout for attendance/leave and people away/holidays. Permission-aware shortcuts open Leave and My Tasks.
- `LeaveBalanceCard.tsx` and `LeaveBalanceMeter.tsx` show exact remaining, used, and pending balances. The remaining-entitlement bar handles negative/adjusted balances and omits invalid or nonpositive entitlement denominators.
- `PunchInOut.tsx` retains recording, GPS, permission, stale-summary, and duplicate-submit safeguards. Presentation lives in `AttendanceSummaryDetails.tsx`: hours/minutes, session timeline, expandable additional sessions and location details. An old-day summary cannot enable punching.
- People away and holidays show three preview entries with full-page links and truthful source-cap messages. Holiday date tiles use calendar dates without local-timezone date shifts. Leave end dates remain end dates; no return-to-work date is inferred.
- `src/components/layout/NotificationDropdown.tsx` uses the shared right-side Drawer. Personal notifications keep unread-count polling, on-open preview loading, read handling, and authorized destinations. Internal action URLs are no longer printed.
- `NotificationDropdownPanel.tsx` separates personal alerts from announcements. `AnnouncementDrawerContent.tsx` fetches three announcements on demand; posts expand and attachments retain their existing actions. The subtree is keyed by `useNotificationOwnerKey()` to clear retained posts/attachments when tenant or authorization changes.

## Validation

- Independent source review identified the announcement authorization reset and corrupted punctuation; both were corrected. A same-tenant permission-change regression verifies immediate removal of retained announcement content.
- ESLint passes for the changed Home/notification files and other affected files except the three below. Comparing baseline and current rule/message findings showed **no new errors**:
  - `src/modules/leave/LeaveHolidaysPage.tsx`: 6 existing errors remain.
  - `src/routes/AppRoutes.test.tsx`: 6 existing errors remain.
  - `src/routes/RouteGuards.test.tsx`: 2 existing errors remain.
- Final regression suite: **129 tests passed across 13 files**, with `--maxWorkers=2 --minWorkers=1`. Covers Home, card states, punch safeguards, drawer interactions/authorization, sidebar/search, route guards, and the route registry. The initial unrestricted-worker run stalled and was stopped; the final constrained run completed in 141.48 seconds.
- Final `npm run build`: **passed** (TypeScript and Vite). Vite retains its warning about chunks exceeding 500 kB. `git diff --check` passed.
- Supporting local logs: `D:\work\heliorventures\.codex-tmp\home-tests-final.log`, `home-build-final.log`, `home-lint-final.log`, and `home-lint-baseline.log`.

## Runtime acceptance still needed

The Browser skill connected to its runtime but reported no available browsers. Desktop/mobile rendering, dark mode, zoom, signed-in notification navigation, attachments, and live punch interaction were not browser-verified. Tests use mocked service responses; no production deployment or live-data acceptance is claimed.

No commit or deployment was performed by this task. Existing workspace work was preserved.
