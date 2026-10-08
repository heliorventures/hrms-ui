# My Work and Performance implementation plan

**Goal:** Implement the approved My Work menu (My Tasks, Notifications, Completed / Archive), separate Performance navigation and role-scoped tabs, and action-specific loading.

**Approved design:** User approval in this conversation on 2026-09-09. Performance tabs: My Performance, Team Reviews, Setup, Process, Review. Personal task links open the corresponding form. Anonymous survey archives contain completion receipts, never identified answers.

**Architecture:** Reuse employee-scoped survey and appraisal APIs. Keep existing URLs working. Separate navigation destinations from page tabs. Preserve draft state across tabs and only refresh data affected by an operation. No database changes or commits; preserve unrelated work in the current UI feature checkout.

**Tech stack:** React 18, React Router, TypeScript, GraphQL request, Vitest.

- [x] Add regression tests for navigation grouping, permission-scoped personal tasks, completed submissions, and independent loading/duplicate submission protection.
- [x] Introduce My Work routes and personal task projection from availableSurveys and myPerformanceReviews. Surface query errors without claiming there are no tasks.
- [x] Add permission-controlled Performance tabs, separate personal/team/admin lanes, retain legacy catalogs under Setup, and support direct review links.
- [x] Replace shared busy state with keyed operations in performance and survey forms. Keep unrelated actions usable and retain entered answers on refresh.
- [x] Connect survey task links to respondent-only forms, retaining administrator survey access separately.
- [x] Run focused tests, TypeScript, affected-file lint, build, and review the final diff. Record browser/live acceptance separately.

