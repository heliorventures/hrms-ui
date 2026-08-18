# Client Session Expiry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep newly issued tenant tokens after login and centrally terminate genuinely expired tenant sessions with a redirect to login and the message `Your session expired. Sign in again.`

**Architecture:** A small tenant-bootstrap claim helper makes startup cleanup idempotent across React effect reruns. The GraphQL boundary classifies structured unauthenticated responses and invokes an explicit AuthContext expiry action; route guards continue to own navigation after authentication state is cleared.

**Tech Stack:** React 18, TypeScript, graphql-request 6, React Router 6, Vitest

## Global Constraints

- Do not run Dart or Flutter commands.
- Do not commit changes; the user will commit after review.
- Preserve all unrelated modified and untracked files.
- Do not replay failed GraphQL operations automatically.
- HTTP `403` and GraphQL `FORBIDDEN` must not end a tenant session.
- Tenant expiration must not clear operator tokens or operator state.

---

### Task 1: Make tenant startup cleanup idempotent

**Files:**
- Modify: `src/auth/tenantSession.ts`
- Modify: `src/auth/tenantSession.test.ts`
- Modify: `src/contexts/AuthContext.tsx`

**Interfaces:**
- Produces: `claimClientSessionBootstrap(state: { current: string | null }, tenantId: string): boolean`
- Consumes: the resolved tenant ID from `TenantContext`

- [ ] **Step 1: Write the failing bootstrap regression test**

Add a test that calls `claimClientSessionBootstrap` twice with the same resolved tenant. Assert that the first call returns `true`, the second returns `false`, and a different tenant returns `true`. This catches the login-triggered effect rerun that currently clears freshly issued tokens.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- src/auth/tenantSession.test.ts`

Expected: FAIL because `claimClientSessionBootstrap` is not exported.

- [ ] **Step 3: Implement the bootstrap claim**

Add the helper to `tenantSession.ts`. It must update `state.current` before returning `true` so React StrictMode effect replay cannot claim the same tenant twice.

- [ ] **Step 4: Use the claim at the startup boundary**

In `AuthContext`, add a ref initialized to `{ current: null }`. Split tenant client cleanup from operator restore. The client cleanup effect must:

```ts
if (resolutionStatus !== 'resolved' || !currentTenant.id) return;
if (!claimClientSessionBootstrap(clientBootstrapRef.current, currentTenant.id)) return;
clearLegacyClientRefreshToken();
clearClientSession(currentTenant.id);
```

It must depend only on `currentTenant.id` and `resolutionStatus`; it must not depend on `refreshClientSession`, `clearClientState`, or authenticated `tenantId`.

- [ ] **Step 5: Run the focused test and verify GREEN**

Run: `npm test -- src/auth/tenantSession.test.ts`

Expected: PASS.

### Task 2: Classify tenant GraphQL authentication failures centrally

**Files:**
- Create: `src/auth/sessionExpiry.ts`
- Create: `src/auth/sessionExpiry.test.ts`
- Modify: `src/api/client.ts`

**Interfaces:**
- Produces: `CLIENT_SESSION_EXPIRED_MESSAGE`
- Produces: `isUnauthenticatedGraphResponse(response: GraphQLClientResponse<unknown> | Error): boolean`
- Produces: `handleGraphResponse(plane: HeliorGraphPlane, response: GraphQLClientResponse<unknown> | Error, onUnauthenticated?: () => void): void`
- Produces: `endExpiredClientSession(tenantId: string | null, clearSession: (tenantId: string) => void, reportError: (message: string) => void): boolean`
- Extends: `GraphClientOptions` with `onUnauthenticated?: () => void`

- [ ] **Step 1: Write failing response-classification tests**

Use real `ClientError` instances and literal response fixtures. Cover:

- GraphQL `UNAUTHENTICATED` at status `200` returns `true`.
- HTTP `401` returns `true`.
- GraphQL `FORBIDDEN`/HTTP `403` returns `false`.
- An ordinary network `Error` returns `false`.
- `handleGraphResponse` invokes the callback for client-plane expiry but not for operator-plane responses.
- `endExpiredClientSession` clears an authenticated tenant and reports the exact expiry message.
- `endExpiredClientSession` makes no transition when no tenant is authenticated.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- src/auth/sessionExpiry.test.ts`

Expected: FAIL because the session-expiry module does not exist.

- [ ] **Step 3: Implement structured classification**

For `ClientError`, inspect `error.response`; for successful middleware responses, inspect the response directly. Return true only for status `401` or an error extension whose string code uppercases to `UNAUTHENTICATED`. Do not inspect raw message text.

Implement `endExpiredClientSession` as the single orchestration boundary for clearing tenant state and recording `CLIENT_SESSION_EXPIRED_MESSAGE`. Return `false` without calling either dependency when `tenantId` is null; otherwise perform both operations and return `true`.

- [ ] **Step 4: Connect classification to graphql-request**

Pass a `responseMiddleware` when creating the GraphQL client. It must call `handleGraphResponse(plane, response, opts.onUnauthenticated)` and leave error propagation unchanged.

- [ ] **Step 5: Run the focused test and verify GREEN**

Run: `npm test -- src/auth/sessionExpiry.test.ts`

Expected: PASS.

### Task 3: Perform the complete AuthContext expiry transition

**Files:**
- Modify: `src/contexts/AuthContext.tsx`
- Modify: `src/hooks/useGraphClient.ts`

**Interfaces:**
- Extends `AuthContextType` with `expireClientSession: () => void`
- `useGraphClient` consumes `expireClientSession` and supplies it as `onUnauthenticated` only for the client plane

- [ ] **Step 1: Add the expiry action using the tested transition**

Add `expireClientSession` to `AuthContext`. It must call `endExpiredClientSession(tenantId, clearClientState, setError)`. Repeated calls must remain safe. Successful login and manual logout continue to clear the error.

- [ ] **Step 2: Inject the action at the client GraphQL boundary**

Update `useGraphClient` to read `expireClientSession` from `useAuth` and provide it only when `plane === 'client'`. Include the callback in the memo dependency list. Operator clients must receive no tenant expiry callback.

- [ ] **Step 3: Run all focused authentication tests**

Run: `npm test -- src/auth/tenantSession.test.ts src/auth/sessionExpiry.test.ts src/auth/tokenStore.test.ts src/utils/graphqlUserMessage.test.ts`

Expected: PASS with zero failures.

### Task 4: Verify the complete UI change

**Files:**
- Review only: all files changed by Tasks 1-3

- [ ] **Step 1: Run the complete Vitest suite**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 2: Run TypeScript and Vite build**

Run: `npm run build`

Expected: exit code 0.

- [ ] **Step 3: Run ESLint**

Run: `npm run lint`

Expected: exit code 0 with zero warnings.

- [ ] **Step 4: Review scope and whitespace**

Run: `git diff --check`

Run: `git status --short`

Confirm that only the approved authentication files, tests, plan, and spec were added or modified by this work; preserve pre-existing employee-profile and generated GraphQL changes.

- [ ] **Step 5: Record runtime limitation**

If no in-app browser session is available, report browser login/redirect verification as unrun rather than claiming runtime proof.
