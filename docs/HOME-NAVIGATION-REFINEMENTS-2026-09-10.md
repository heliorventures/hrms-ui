# Home and navigation refinements - 2026-09-10

Implemented in the normal `hrms-ui` checkout. Changes are uncommitted; no deployment performed.

## Behavior

- `AppLayout.tsx` and `PageTools.tsx`: Notifications and Information now sit in a dedicated right-edge rail beside the scrolling page. Header retains global search and profile.
- `NotificationPreviewItem.tsx`: notification summaries expand to reveal full messages; a separate Open item action retains existing authorization and read handling.
- `Sidebar.tsx`, `SidebarHeader.tsx`, and `NavigationLogoToggle.tsx`: desktop collapse removes the sidebar completely. The header logo exposes expansion on hover/focus; the sidebar logo exposes collapse. Mobile retains its focus-trapped drawer.
- `SidebarNavigation.tsx` and `SidebarSection.tsx`: removed duplicate filter and flyout titles/chevrons. Parent links use the first authorized destination. Mouse hover opens flyouts without moving focus; keyboard arrows open and Escape dismisses. Touch input switches to inline destinations, including touchscreen desktops.
- `LeaveBalanceCard.tsx`, `LeaveBalanceMeter.tsx`, and `leaveBalanceFormat.ts`: circular meters without an internal scrollbar; fractional values preserved and trailing decimal zeros removed. Zero/invalid entitlement uses a neutral ring; negative balances remain visible.
- `AttendanceSummaryDetails.tsx`: compact empty-state message.
- Home remains the display name; existing `/dashboard` links remain compatible.

## Validation

- Targeted regression suite: **71 tests passed in 12 files**, covering layout route focus, notification authorization/actions/expansion, sidebar permissions and interaction, leave balance edge cases, shared popovers, information panel, and drawer behavior.
- Final helper-extraction follow-up: **19 tests passed in 2 files** (sidebar and shared popover); sidebar lint exited successfully.
- Production build: **passed** (TypeScript and Vite); existing Browserslist age and large-chunk warnings remain.
- Changed-file lint: existing findings remain in `AppLayout.tsx` and its two tests. Baseline `AppLayout.tsx` was checked via ESLint stdin and has the same six rule findings; its existing function-length violation increased with the new rail. Test findings occur in existing test bodies. Other changed files pass after sidebar helper extraction.
- Read-only independent review found hover Escape and hybrid touch gaps; both were addressed and regression tests passed.
- Browser tool reported **No browser is available**. Signed-in visual/interactive acceptance is pending, including desktop/mobile sizing, logo hover, right-rail drawers, and long leave/notification content.

## Review boundaries

`public/config.json` changed concurrently and was not edited as part of this task. Preserve and review it separately. No commit, deployment, backend, migration, or production-data changes were made.

Validation logs are under `D:\work\heliorventures\.codex-tmp\navigation-*`; final sidebar lint is `sidebar-lint.log`.
