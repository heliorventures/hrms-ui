# Navigation shell refinements

## Implemented scope

- Removed the shared top header from AppLayout; content starts at the top.
- Expanded sidebar contains product/company identity, Search, and a separate visible collapse control.
- Collapsed desktop navigation is a 72px icon rail. Permission filtering is shared with the expanded menu. Group icons open the existing destination flyouts; search and profile remain available.
- Mobile uses the existing modal sidebar, opened from a floating bottom-left button.
- The profile menu shows company identity, including when the sidebar is collapsed.
- Floating Notifications uses amber, Information uses blue, with dark-mode colors and the unread badge retained.
- Static module titles remain semantic h1 headings but are visually hidden. Shared PageHeader uses CompactPageContext inside the application shell, preserving actions and information registration. Contextual report/workflow headings explicitly retain their visible titles. Public/authentication, operations, and employee-record headings are preserved.

## Validation boundaries

- Browser connection was attempted but returned "No browser is available". Desktop/mobile rendering, zoom, and signed-in interaction need visual acceptance.
- The current checkout contains concurrent HR leave/attendance work. The production build encountered missing leave-queue/graphql and unresolved HR leave-page references; those changes were not made by this navigation task.
- Final build also reported an employeeId union-type error in HrAttendanceManagementPage.tsx. No navigation or menu TypeScript errors were reported.
- Focused sidebar and shared page-heading tests passed (20 tests); account-menu, profile, route-focus, submenu, and notification checks also passed during implementation. Existing AppLayout function-length, complexity, and enum-comparison lint findings remain outside this layout change.
- Existing unrelated dirty work was preserved. Nothing was committed.
