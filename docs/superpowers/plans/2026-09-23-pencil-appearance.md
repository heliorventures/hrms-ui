# Pencil appearance implementation plan

**Goal:** Implement the approved revision 3 Pencil design with compact defaults and personal browser preferences.
**Design:** `designs/ui-review.pen`, working screens and module 18 Appearance approved in this conversation.
**Architecture:** Extend the existing theme provider with validated versioned preferences. Apply semantic CSS variables and scoped shared component styles; preserve data queries, permissions, focus management and mobile navigation. Appearance is personal browser configuration, not tenant administration.
**Stack:** Existing React, TypeScript, Tailwind and Vitest. No backend/schema changes.

## Constraints

- No commits, deployment or builds. User runs tests, lint and typechecks.
- Preserve light/dark migration, permission-filtered navigation, unavailable metrics and real application data.
- Compact defaults: two-tone navigation, muted headings, inline search, readable tables; maintain touch targets on coarse pointers.
- Preferences preview without persistence; Save persists, Cancel/unmount restores saved values. Report unavailable storage honestly.
- System color scheme and reduced motion remain responsive to OS changes.

## Implementation

- [x] Add preference schema, safe persistence, theme integration and behavior tests (authored, not executed).
- [x] Add Appearance sections, preview, reset/cancel/save and authenticated entry point.
- [x] Apply shared typography, density, sidebar, headings, controls, search and table styles.
- [x] Update Home leave presentation, directory and analytics hierarchy using existing data.
- [x] Review diffs; supply focused validation commands and visual acceptance checklist.
- [ ] User-run tests, lint/typecheck and browser acceptance.

## Review focus

Corrupt or blocked storage; changing OS theme; cancelled previews; mobile/zoom/keyboard access; missing permission-filtered metrics; legacy theme and sidebar preference migration.
