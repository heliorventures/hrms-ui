# Client Session Expiry Design

## Problem

After a successful tenant login, the dashboard renders authenticated user state, but the first GraphQL requests can be sent without an access token. The attendance widget then displays `Your session has expired. Sign in again.` Refreshing the browser exposes the missing session and sends the user back through login.

The immediate cause is the client-session startup cleanup in `AuthContext`. The effect depends on `refreshClientSession`; that callback depends on `clearClientState`; and `clearClientState` depends on the authenticated `tenantId`. Login changes `tenantId`, which recreates those callbacks and reruns the startup effect. The effect calls `clearClientSession` and removes the access and refresh tokens without clearing the React user state.

The application also lacks one central handler for an authoritative unauthenticated GraphQL response. Individual screens currently translate the response into an inline message, leaving the protected application shell visible.

## Desired Behavior

- Successful login keeps the newly issued tenant-bound access and refresh tokens.
- A valid session continues to refresh proactively before JWT expiry and when the browser resumes near expiry.
- An authoritative client authentication failure clears the complete tenant session and redirects to `/login`.
- The login screen displays `Your session expired. Sign in again.` after an expiry redirect.
- Manual logout does not display the expiry message.
- Authorization failures such as `FORBIDDEN` do not end the session.
- Tenant-session expiration does not clear the operator-console session.

## Design

### Startup lifecycle

Make tenant startup cleanup depend only on tenant resolution inputs and stable operator-session helpers. It must not depend on callbacks whose identity changes when a tenant user logs in. Guard the cleanup so it runs once for a resolved tenant during the provider lifecycle. This retains the existing security rule that a fresh application load cannot silently restore a tenant session and must pass the captcha gate again.

### Authoritative expiry detection

The client GraphQL boundary will classify authentication failures using structured response data:

- HTTP status `401` from the GraphQL endpoint.
- GraphQL error extension code `UNAUTHENTICATED`.

HTTP `403` or GraphQL `FORBIDDEN` remains an authorization error and must not end the session. The refresh endpoint retains its existing, endpoint-specific behavior where `401` or `403` means that the refresh session is no longer usable. Raw error-message text is not an authentication control signal.

The detection applies only to the tenant/client GraphQL plane. Operator requests retain their independent session lifecycle.

### Session transition

Expose a stable client-session-expired action from `AuthContext` and provide it to the tenant GraphQL client through `useGraphClient`. When the GraphQL boundary detects an unauthenticated response, it invokes that action. The action performs one atomic logical transition:

1. Clear the in-memory client access token.
2. Remove the refresh token for the authenticated tenant only.
3. Clear tenant user, tenant ID, role, and parsed session state.
4. Set the authentication error to `Your session expired. Sign in again.`

The existing protected route guard reacts to the cleared user state and navigates to `/login` with replacement semantics. `LoginPage` renders the authentication error already exposed by `AuthContext`.

Successful login and manual logout clear the expiry message. Duplicate unauthenticated responses are idempotent because clearing an already-cleared session has no additional effect.

### Retry policy

Do not automatically replay the rejected GraphQL operation. The existing timer and focus/visibility handling remain responsible for refreshing a valid session before access-token expiry. Replaying mutations at the transport boundary could duplicate business actions when the server completed work but the client received an authentication-shaped error.

## Alternatives Considered

1. Handle `UNAUTHENTICATED` in every page or widget. Rejected because it duplicates security behavior and inevitably leaves some screens in inconsistent authenticated state.
2. Redirect with `window.location.reload()` from the GraphQL client. Rejected because it bypasses the React authentication state transition, makes the message lifecycle brittle, and couples the transport layer directly to routing.
3. Use the centralized AuthContext transition described above. Selected because it preserves one source of truth, keeps routing declarative, and separates tenant and operator sessions.

## Regression Coverage

- A successful login does not trigger startup cleanup of the new tokens.
- Client GraphQL `UNAUTHENTICATED` clears tenant authentication state and sets the expiry notice.
- GraphQL HTTP `401` follows the same transition.
- GraphQL `FORBIDDEN` remains a page-level authorization error and does not clear the session.
- Manual logout clears state without the expiry notice.
- Operator requests and operator tokens are unaffected by tenant-session expiry.
- Existing tenant-ID matching and tenant-scoped refresh-token tests remain green.

## Verification

Run focused Vitest coverage for authentication/session behavior, followed by the full UI test suite, TypeScript/Vite build, ESLint, and `git diff --check`. No Dart or Flutter command is part of this work. Browser verification remains pending unless an in-app browser session becomes available.
