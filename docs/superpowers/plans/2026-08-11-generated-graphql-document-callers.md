# Generated GraphQL Document Callers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove two handwritten GraphQL mutation documents and make their callers use the generated typed documents.

**Architecture:** Keep GraphQL operation ownership in `clientOperations.graphql` and its generated TypeScript output. The two callers import generated `TypedDocumentNode` values directly, following the existing UI pattern, without changing their public interfaces or control flow.

**Tech Stack:** React, TypeScript, graphql-request, GraphQL Code Generator

## Global Constraints

- Do not modify the source GraphQL operations, schema, or generated output during this cleanup.
- Preserve unrelated staged and unstaged worktree changes, including the untracked `.env` file.
- Do not run unit tests or create commits; the user will run verification and commit after review.

---

### Task 1: Use the generated manual-attendance update document

**Files:**
- Modify: `src/modules/attendance/components/ManualAttendanceModal.tsx`

**Interfaces:**
- Consumes: `UpdateManualAttendanceSegmentDocument` from `src/api/graphql/graphql.ts`.
- Produces: The existing modal behavior, with its edit request typed from the generated operation.

- [x] **Step 1: Extend the generated-document import**

```ts
import {
  AddManualAttendanceSegmentDocument,
  UpdateManualAttendanceSegmentDocument,
} from '../../../api/graphql/graphql';
```

- [x] **Step 2: Remove the local mutation document**

Delete `UPDATE_MANUAL_ATTENDANCE_SEGMENT_DOCUMENT` and its template string.

- [x] **Step 3: Use the generated document at the request call**

```ts
await client.request(UpdateManualAttendanceSegmentDocument, {
  input: {
    id: editingSegmentId,
    ...input,
  },
});
```

### Task 2: Use the generated tenant-file upload document

**Files:**
- Modify: `src/utils/tenantFileUpload.ts`

**Interfaces:**
- Consumes: `UploadTenantFileDocument` from `src/api/graphql/graphql.ts`.
- Produces: `uploadTenantFile(client: GraphQLClient, file: File): Promise<string>` unchanged.

- [x] **Step 1: Import the generated document**

```ts
import { UploadTenantFileDocument } from '../api/graphql/graphql';
```

- [x] **Step 2: Remove the local mutation document**

Delete the handwritten `UploadTenantFileDocument` template string.

- [x] **Step 3: Let the generated document drive request typing**

```ts
const result = await client.request(UploadTenantFileDocument, {
  input: {
    fileName: encoded.name,
    mimeType: encoded.mime,
    contentBase64: encoded.b64,
  },
});
```

Keep `return result.uploadTenantFile.id;` unchanged.

### Task 3: Static verification

**Files:**
- Verify: `src/modules/attendance/components/ManualAttendanceModal.tsx`
- Verify: `src/utils/tenantFileUpload.ts`

**Interfaces:**
- Consumes: The two completed caller changes.
- Produces: Static evidence that no handwritten copies remain and the focused diff is well formed.

- [x] **Step 1: Confirm handwritten constants are absent and generated documents are referenced**

Run:

```powershell
rg -n 'UPDATE_MANUAL_ATTENDANCE_SEGMENT_DOCUMENT|const UploadTenantFileDocument' src/modules/attendance/components/ManualAttendanceModal.tsx src/utils/tenantFileUpload.ts
rg -n 'UpdateManualAttendanceSegmentDocument|UploadTenantFileDocument' src/modules/attendance/components/ManualAttendanceModal.tsx src/utils/tenantFileUpload.ts
```

Expected: the first command has no matches; the second shows imports and request calls in both files.

- [x] **Step 2: Inspect only the intended caller diff**

Run:

```powershell
git diff -- src/modules/attendance/components/ManualAttendanceModal.tsx src/utils/tenantFileUpload.ts
```

Expected: only import, local-document removal, request-document replacement, and redundant result-generic removal.

- [x] **Step 3: Check diff formatting**

Run:

```powershell
git diff --check
```

Expected: exit code 0. Unit tests and builds remain for the user to run.
