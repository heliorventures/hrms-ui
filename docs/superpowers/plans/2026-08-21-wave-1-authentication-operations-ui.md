# Wave 1 Authentication and Operations UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make tenant and operator authentication, tenant resolution, session-expiry recovery, and the operator shell clear, responsive, accessible, and non-technical without changing authentication or authorization contracts.

**Architecture:** Add a safe auth-message boundary, a bounded tenant-resolution lifecycle, plane-specific session-expiry callbacks, deterministic focus ownership on public auth surfaces, and a responsive operator shell composed from the Wave 0 overlay primitives. Preserve all route paths, credential payloads, permissions, and backend contracts.

**Tech Stack:** React 18, TypeScript, React Router, REST auth client, graphql-request, Tailwind CSS, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-20-all-module-ui-ux-modernization-design.md`

## Global Constraints

- Preserve all existing Wave 0 changes in the dirty `codex/ui-ux-modernization` worktree.
- Tenant usernames remain email, mobile number, or tenant-scoped unique name. Recovery copy must not assume email.
- Preserve the existing tenant and operator login request payloads, route paths, permission semantics, tenant/session matching, forced-password routing, and backend authorization.
- Do not remove or replace CAPTCHA, add bot mitigation/rate limits, alter refresh/session/token-storage policy, or implement password-reset delivery in this plan.
- The client-only CAPTCHA remains a Critical release blocker pending separately approved auth/backend design; this plan must not present it as proven server protection.
- Do not expose auth URLs, HTTP status, raw server messages, GraphQL terminology, or transport details to users.
- Public auth pages own their focus after mount, validation, remote failure, redirect, and session expiry; they do not depend on `AppLayout`.
- Reuse Wave 0 `Input`, `Button`, `PageNotice`, `Drawer`, `IconButton`, and overlay behavior without modifying their public contracts.
- TDD is mandatory. Do not commit, push, deploy, run codegen, or run Dart/Flutter commands.

---

### Task 1: Introduce Safe Auth Messaging

**Files:**

- Create: `src/auth/authUserMessage.ts`
- Create: `src/auth/authUserMessage.test.ts`
- Modify: `src/contexts/AuthContext.tsx`
- Modify: `src/contexts/TenantContext.tsx`

**Interfaces:**

```ts
export type AuthMessageContext = 'tenant-login' | 'operator-login' | 'tenant-resolution';

export function authUserMessage(error: unknown, context: AuthMessageContext): string;
```

Exact messages:

| Context | Condition | Message |
|---|---|---|
| Tenant login | `UNAUTHENTICATED` | `Username or password is incorrect.` |
| Operator login | `UNAUTHENTICATED` | `Email or password is incorrect.` |
| Tenant resolution | `TENANT_NOT_FOUND` or HTTP 404 | `We could not find this organization.` |
| Any | network failure or timeout | `The sign-in service is unavailable right now. Try again.` |
| Tenant/operator login | any other failure | `We could not sign you in. Try again.` |
| Tenant resolution | any other failure | `We could not open this organization right now. Try again.` |

- [ ] **Step 1: Write failing message tests**

Test `AuthError` codes, 404, `TypeError`, abort/timeout, unknown errors, and malicious/raw messages containing URLs, stack text, or service names. Assert output contains none of the raw input.

```ts
expect(authUserMessage(new TypeError('fetch https://auth.internal failed'), 'tenant-login'))
  .toBe('The sign-in service is unavailable right now. Try again.');
```

- [ ] **Step 2: Run RED verification**

Run `npx vitest run src/auth/authUserMessage.test.ts`.

Expected: FAIL because the safe boundary does not exist.

- [ ] **Step 3: Implement and adopt the boundary**

Replace the URL-bearing `TypeError` messages in `AuthContext` and `TenantContext`. Keep credential anti-enumeration behavior. Do not call `getAppConfig().authUrl` from user-facing error construction.

- [ ] **Step 4: Run GREEN verification**

Run the Step 2 command. Expected: PASS.

---

### Task 2: Bound Tenant Resolution and Separate Not-Found from Unavailable

**Files:**

- Create: `src/contexts/TenantContext.test.tsx`
- Modify: `src/auth/authClient.ts`
- Modify: `src/contexts/TenantContext.tsx`
- Modify/Test: `src/routes/AppRoutes.tsx`, `src/routes/AppRoutes.test.tsx`
- Modify/Test: `src/routes/RouteGuards.tsx`, `src/routes/RouteGuards.test.tsx`
- Modify/Test: `src/routes/RouteStatePage.tsx`, `src/routes/RouteStatePage.test.tsx`

**Interfaces:**

```ts
export async function resolveTenantBySlug(
  slug: string,
  options?: { signal?: AbortSignal }
): Promise<ResolvedTenant>;

export type TenantResolutionStatus =
  | 'marketing'
  | 'resolving'
  | 'resolved'
  | 'not-found'
  | 'error';

interface TenantContextType {
  retryTenantResolution: () => boolean;
  canRetryTenantResolution: boolean;
}
```

Use:

```ts
export const TENANT_RESOLUTION_TIMEOUT_MS = 10_000;
export const MAX_TENANT_RESOLUTION_ATTEMPTS = 3;
```

- [ ] **Step 1: Write failing auth-client and context tests**

Create tests proving the optional `AbortSignal` reaches `fetch`, 404 becomes `not-found`, timeout/network becomes `error`, Retry transitions through `resolving`, success clears the retry state, and no more than 3 attempts are started per mounted provider.

- [ ] **Step 2: Write failing route-state tests**

Assert:

1. `not-found` renders “Organization not found,” no retry loop, and tenant-aware safe guidance.
2. `error` renders “Organization unavailable” with Retry while budget remains.
3. Exhausted retry budget removes the Retry button and says to try again later.
4. Loading retains `role="status"`; failure states use an alert.
5. Route paths and tenant-prefixed canonicalization remain unchanged.

- [ ] **Step 3: Run RED verification**

Run:

```powershell
npx vitest run src/contexts/TenantContext.test.tsx src/routes/AppRoutes.test.tsx src/routes/RouteGuards.test.tsx src/routes/RouteStatePage.test.tsx
```

Expected: FAIL on missing timeout, retry contract, and separate route state.

- [ ] **Step 4: Add abortable auth GET support**

Pass `options?.signal` into the existing GET fetch. Preserve the one-argument `resolveTenantBySlug(slug)` caller contract.

- [ ] **Step 5: Implement bounded resolution**

For each attempt, create an `AbortController`, abort after 10 seconds, and clear the timer in `finally`. Track attempts per mounted tenant slug. `retryTenantResolution()` returns `false` without issuing a request when status is `not-found`, no slug exists, resolution is already running, or 3 attempts have been used.

- [ ] **Step 6: Split route presentation**

Keep `TenantNotFoundPage` for terminal not-found and add `TenantUnavailablePage` for transient/exhausted failure. Add `organization-not-found` to `RouteState`; keep existing `unavailable` compatibility for organization service failure.

- [ ] **Step 7: Run GREEN verification**

Run the Step 3 command. Expected: PASS.

---

### Task 3: Handle Operator Session Expiry Without Affecting Tenant State

**Files:**

- Modify/Test: `src/auth/sessionExpiry.ts`, `src/auth/sessionExpiry.test.ts`
- Modify/Test: `src/auth/tokenStore.test.ts`
- Create: `src/contexts/AuthContext.test.tsx`
- Create: `src/hooks/useGraphClient.test.tsx`
- Modify: `src/contexts/AuthContext.tsx`
- Modify: `src/hooks/useGraphClient.ts`
- Modify/Test: `src/routes/RouteGuards.tsx`, `src/routes/RouteGuards.test.tsx`

**Interfaces:**

```ts
export const OPERATOR_SESSION_EXPIRED_MESSAGE = 'Your operator session expired. Sign in again.';

export function endExpiredOperatorSession(
  clearSession: () => void,
  reportError: (message: string) => void
): void;

// Add to AuthContextType
expireOpsSession: () => void;
```

Preserve:

```ts
handleGraphResponse(
  plane: 'client' | 'operator',
  response: GraphResponseLike | Error,
  onUnauthenticated?: () => void
): void;
```

- [ ] **Step 1: Replace the operator-ignore regression with failing expected behavior**

Change the existing test to assert that `handleGraphResponse('operator', unauthenticated, notify)` invokes the supplied operator callback. Keep forbidden/network non-expiry cases.

- [ ] **Step 2: Write isolation tests**

In `AuthContext.test.tsx`, seed both tenant and operator sessions. Invoke `expireOpsSession` and assert:

```text
operator access/refresh cleared
opsUser cleared
opsError equals OPERATOR_SESSION_EXPIRED_MESSAGE
tenant user, clientSession, tenant ID, client access/refresh, and tenant error unchanged
```

In `useGraphClient.test.tsx`, assert client plane receives `expireClientSession` and operator plane receives `expireOpsSession`.

- [ ] **Step 3: Run RED verification**

Run:

```powershell
npx vitest run src/auth/sessionExpiry.test.ts src/auth/tokenStore.test.ts src/contexts/AuthContext.test.tsx src/hooks/useGraphClient.test.tsx src/routes/RouteGuards.test.tsx
```

Expected: FAIL because operator unauthenticated responses are ignored.

- [ ] **Step 4: Implement plane-specific expiry callbacks**

`handleGraphResponse` invokes the supplied callback for an unauthenticated response on either plane. `useGraphClient` selects the callback by plane. `expireOpsSession` performs local expiry cleanup only; it must not call the logout/revoke API after an already-expired request.

- [ ] **Step 5: Preserve safe redirect behavior**

`OpsProtectedLayout` continues redirecting unauthenticated operators to `/ops/login`. `opsError` survives local expiry long enough for Ops Login to display and focus it; an explicit logout and a successful login clear it.

- [ ] **Step 6: Run GREEN verification**

Run the Step 3 command. Expected: PASS.

---

### Task 4: Add Deterministic Auth Focus and Semantic Public Pages

**Files:**

- Create: `src/modules/auth/authFocus.ts`
- Create: `src/modules/auth/authFocus.test.ts`
- Create: `src/modules/auth/LoginPage.test.tsx`
- Create: `src/modules/ops/OpsLoginPage.test.tsx`
- Modify: `src/modules/auth/LoginPage.tsx`
- Modify: `src/modules/ops/OpsLoginPage.tsx`

**Interfaces:**

```ts
export function focusFirstInvalidField<T extends string>(
  errors: Partial<Record<T, string>>,
  order: readonly T[],
  refs: Readonly<Record<T, React.RefObject<HTMLInputElement>>>
): T | null;
```

- [ ] **Step 1: Write failing focus-helper tests**

Assert the helper focuses the first field in explicit order, skips fields without errors, and returns `null` without focus when no errors exist.

- [ ] **Step 2: Write failing tenant/ops login tests**

Assert:

1. Each page has one `<main>` and one visible `<h1>`.
2. Tenant validation order is username, password, verification code.
3. Ops validation order is email, password, verification code.
4. Remote failure focuses the `PageNotice` alert and preserves credential values.
5. Inputs have stable `name`, correct `autocomplete`, and `spellCheck={false}` for username/email.
6. Tenant login says “Email, mobile number, or unique name”; it does not require email.
7. No user-visible text contains the configured auth URL or raw server message.

- [ ] **Step 3: Run RED verification**

Run:

```powershell
npx vitest run src/modules/auth/authFocus.test.ts src/modules/auth/LoginPage.test.tsx src/modules/ops/OpsLoginPage.test.tsx
```

Expected: FAIL on semantics, focus, and metadata.

- [ ] **Step 4: Implement focus ownership**

Use `Input` refs for credential and verification controls. After `setErrors`, schedule focus after commit with a focused effect keyed by validation attempt rather than an arbitrary timeout. Render auth failures with `PageNotice variant="error" focusOnMount`; its existing focus contract owns alert focus when `authError`/`opsError` changes.

- [ ] **Step 5: Add semantic metadata**

Tenant fields use `name="username"`, `autoComplete="username"`, `spellCheck={false}`. Ops email uses `name="email"`, `type="email"`, `inputMode="email"`, `autoComplete="username"`, `spellCheck={false}`. Password fields use `name="password"` and `autoComplete="current-password"`. Do not block paste.

- [ ] **Step 6: Keep CAPTCHA behavior unchanged**

Do not change generation, comparison, refresh, request payload, or token/session policy. Add existing verification input to focus ordering only. Record the Critical backend/auth blocker in final evidence.

- [ ] **Step 7: Run GREEN verification**

Run the Step 3 command. Expected: PASS.

---

### Task 5: Make Recovery Tenant-Aware Without Adding Email Recovery

**Files:**

- Create: `src/modules/auth/ForgotPasswordPage.test.tsx`
- Modify: `src/modules/auth/ForgotPasswordPage.tsx`

**Interfaces:** Use existing `useTenant()`; add no API call or form.

- [ ] **Step 1: Write failing recovery tests**

Assert the page:

1. displays the resolved organization name;
2. has one main landmark and heading;
3. contains no textbox and submits no request;
4. says an administrator or HR team can reset the sign-in;
5. does not say an email was sent or require an email address;
6. offers a normal link back to tenant sign-in.

- [ ] **Step 2: Run RED verification**

Run `npx vitest run src/modules/auth/ForgotPasswordPage.test.tsx`.

Expected: FAIL on missing tenant identity/landmark.

- [ ] **Step 3: Implement tenant context and safe copy**

Use `currentTenant.name` with the product fallback. Keep recovery informational. Do not render `user.email`, collect an identifier, or imply self-service delivery.

- [ ] **Step 4: Run GREEN verification**

Run the Step 2 command. Expected: PASS.

---

### Task 6: Complete Forced-Password and Public Route Focus Handoff

**Files:**

- Create: `src/modules/profile/components/SecurityTab.test.tsx`
- Modify/Test: `src/routes/RouteStatePage.tsx`, `src/routes/RouteStatePage.test.tsx`
- Modify/Test: `src/routes/RouteGuards.tsx`, `src/routes/RouteGuards.test.tsx`
- Modify: `src/modules/profile/ProfileSettingsPage.tsx`
- Modify: `src/modules/profile/components/SecurityTab.tsx`

**Interfaces:**

- Extend `SecurityTab` compatibly:

```ts
interface SecurityTabProps {
  forced?: boolean;
  onPasswordChanged?: () => void | Promise<void>;
  initialFocus?: boolean;
}
```

- [ ] **Step 1: Write failing route/focus tests**

Assert:

1. `RouteStatePage` focuses its heading when a non-loading state commits outside `AppLayout`.
2. Protected redirect to Login results in Login heading focus.
3. Forced password redirect preserves `/profile/settings?tab=security` and focuses Current Password.
4. Auth/session redirect does not focus hidden or stale shell content.
5. Existing denied-route lazy-loader protection remains unchanged.

- [ ] **Step 2: Run RED verification**

Run:

```powershell
npx vitest run src/routes/RouteStatePage.test.tsx src/routes/RouteGuards.test.tsx src/modules/profile/components/SecurityTab.test.tsx
```

Expected: FAIL on missing public-state and forced-field focus.

- [ ] **Step 3: Implement page-owned focus**

Give route-state headings `tabIndex={-1}` and focus on terminal state/location commit. `SecurityTab` focuses Current Password on first forced render only; it must not steal focus after user interaction or ordinary settings navigation.

- [ ] **Step 4: Run GREEN verification**

Run the Step 2 command. Expected: PASS.

---

### Task 7: Build a Responsive and Keyboard-Complete Operator Shell

**Files:**

- Create: `src/modules/ops/OpsLayout.test.tsx`
- Modify: `src/modules/ops/OpsLayout.tsx`

**Interfaces:** Reuse existing `Drawer`, `IconButton`, `NavLink`, and `Outlet`; preserve all ops routes and `handleSignOut` behavior.

- [ ] **Step 1: Write failing operator-shell tests**

Assert:

1. a focus-visible skip link targets `#ops-main-content`;
2. main has `tabIndex={-1}` and a stable accessible label;
3. mobile menu trigger opens a left Drawer and restores trigger focus on Escape/close;
4. selecting a navigation link closes the Drawer;
5. desktop navigation remains present with active-link state;
6. shell uses `min-h-[100dvh]`, safe-area padding, responsive gutters, and no fixed 224px mobile content squeeze;
7. sign-out remains keyboard accessible and routes to `/ops/login`.

- [ ] **Step 2: Run RED verification**

Run `npx vitest run src/modules/ops/OpsLayout.test.tsx`.

Expected: FAIL because the current shell has only a persistent sidebar.

- [ ] **Step 3: Extract one reusable navigation body inside the file**

Use the same navigation data for desktop and Drawer rendering. Do not duplicate route labels/paths. Keep the component below 400 lines.

- [ ] **Step 4: Implement responsive layout**

Desktop (`md` and above) keeps a persistent sidebar. Mobile uses a top header and labelled menu trigger. The Drawer uses `side="left"`, closes on route selection, and relies on the shared overlay stack for Tab containment, Escape, inert background, scroll lock, and restoration.

- [ ] **Step 5: Add shell focus and layout contracts**

Use `min-h-[100dvh]`, safe-area-aware top/bottom padding, `min-w-0`, responsive `p-4 md:p-6`, and a skip link matching the tenant shell behavior.

- [ ] **Step 6: Run GREEN verification**

Run the Step 2 command. Expected: PASS.

---

### Task 8: Integrated Wave 1 Verification

**Files:** All Wave 1 files.

- [ ] **Step 1: Run focused Wave 1 tests**

```powershell
npx vitest run src/auth/authUserMessage.test.ts src/auth/sessionExpiry.test.ts src/auth/tokenStore.test.ts src/contexts/TenantContext.test.tsx src/contexts/AuthContext.test.tsx src/hooks/useGraphClient.test.tsx src/routes/AppRoutes.test.tsx src/routes/RouteGuards.test.tsx src/routes/RouteStatePage.test.tsx src/modules/auth/authFocus.test.ts src/modules/auth/LoginPage.test.tsx src/modules/auth/ForgotPasswordPage.test.tsx src/modules/ops/OpsLoginPage.test.tsx src/modules/profile/components/SecurityTab.test.tsx src/modules/ops/OpsLayout.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Run authorization/session regression tests**

Run existing tenant-session, route-registry, App, and layout tests covering tenant mismatch, forced-password routing, lazy authorization, and tenant switching. Expected: PASS.

- [ ] **Step 3: Run scoped lint and production compilation**

Run targeted ESLint for changed files and `npm run build`. Record known repository-baseline lint debt separately; no new scoped lint or TypeScript error is accepted.

- [ ] **Step 4: Run static safety scans**

```powershell
rg -n "authUrl|Cannot reach the authentication service|API|GraphQL|request rejected" src/modules/auth src/modules/ops/OpsLoginPage.tsx src/contexts/AuthContext.tsx src/contexts/TenantContext.tsx
rg -n "user-scalable=no|maximum-scale=1|transition-all|outline-none(?!.*focus-visible)" src/modules/auth src/modules/ops src/routes --pcre2
git diff --check
git status --short
```

Explain every match and verify no technical value reaches user copy.

- [ ] **Step 5: Browser verification**

Exercise tenant login, ops login, forgot password, known tenant, nonexistent tenant, offline/timeout/retry/exhaustion, direct protected URL, forced password, tenant expiry, operator expiry, 320px Ops navigation, keyboard-only navigation, focus visibility/restoration, dark mode, 200% zoom, reduced motion, and password-manager filling. Verify operator expiry does not change tenant state.

- [ ] **Step 6: Final independent review and blocker statement**

Resolve all Critical/Important findings in this UI-only scope. Record that CAPTCHA/server abuse controls and tenant refresh/session policy remain separately approved Critical work, so Wave 1 cannot be declared fully release-ready from this plan alone.

- [ ] **Step 7: Do not commit**

Provide the changed-file manifest, test/build evidence, browser evidence, and remaining backend blockers to the user. Do not commit, push, or deploy.

## Execution and Parallelization Boundaries

| Producer | Consumer/shared file | Required ordering |
|---|---|---|
| Task 1 safe messages | `AuthContext.tsx` and `TenantContext.tsx` | Complete before Tasks 2–5 consume the safe-message behavior. |
| Task 2 tenant lifecycle | `TenantContext.tsx`, `AppRoutes.tsx`, `RouteGuards.tsx`, `RouteStatePage.tsx` | One owner completes Task 2 before Task 6 revisits route focus. |
| Task 3 operator expiry | `AuthContext.tsx`, `useGraphClient.ts`, `RouteGuards.tsx` | Starts after Tasks 1 and 2; no concurrent route/auth edits. |
| Task 4 auth-page focus | Login page files | May run beside Task 7 after Task 1; it does not edit route or operator-shell files. |
| Task 5 recovery page | `ForgotPasswordPage.tsx` | May run beside Tasks 4 and 7 after Task 1. |
| Task 6 route/forced focus | Route files and profile security files | Starts after Tasks 2 and 4 so it consumes stable focus and route contracts. |
| Task 7 operator shell | `OpsLayout.tsx` | May run beside Tasks 4 and 5; it only consumes Wave 0 primitives. |
| Tasks 1–7 | Task 8 integration | All task reviews are clean before integrated verification. |

`LoginPage.tsx`, `OpsLoginPage.tsx`, `AppRoutes.tsx`, and `RouteGuards.tsx` already contain Wave 0 changes. They are single-owner files during their respective tasks; agents preserve surrounding work and do not broadly format them.

## Separately Approved Work Required for Full Wave 1 Closure

- Replace the browser-only CAPTCHA with accessible, server-enforced abuse protection or remove it under an approved risk decision.
- Define rate limiting, challenge escalation, observability, and lockout behavior.
- Decide tenant refresh restoration, rotation, storage, expiry, and secure-cookie policy.
- Add self-service password recovery only if a tenant-scoped, non-enumerating backend contract is approved; email must remain optional.

These dependencies are documented only. This plan does not authorize their implementation.
