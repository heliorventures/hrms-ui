# Generated GraphQL Document Caller Cleanup

## Goal

Make the generated GraphQL documents the single source of truth for the manual-attendance update and tenant-file upload mutations.

## Design

- Import `UpdateManualAttendanceSegmentDocument` beside the existing generated attendance document and remove the local mutation string.
- Import `UploadTenantFileDocument` directly from the generated GraphQL module and remove the local mutation string.
- Let `graphql-request` infer the upload result and variables from the generated typed document; keep the helper's public return type as `Promise<string>`.
- Do not change schemas, source `.graphql` operations, generated output, request variables, UI behavior, or error handling.

## Alternatives Considered

1. Direct generated imports: selected because it matches current UI imports and limits the change to the two stale callers.
2. Export generated documents through the GraphQL barrel: rejected because it widens an unrelated public module surface.
3. Keep handwritten strings or call the generated `gql()` lookup: rejected because either option retains operation text at the caller and can drift from codegen.

## Verification

- Confirm both handwritten mutation constants are absent.
- Confirm both callers reference the generated documents.
- Inspect the focused diff and run `git diff --check`.
- Unit tests will not be run, following the repository instruction; the user can run the project verification and share the output.
