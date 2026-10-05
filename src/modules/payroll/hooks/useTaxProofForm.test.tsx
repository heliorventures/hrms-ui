// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { GraphQLClient } from 'graphql-request';
import { afterEach, expect, it, vi } from 'vitest';

import { uploadTenantFile } from '../../../utils/tenantFileUpload';
import type * as TenantFileUpload from '../../../utils/tenantFileUpload';
import type { TaxSubmissionContext } from '../taxSubmissionContext';

import { useTaxProofForm } from './useTaxProofForm';

vi.mock('../../../utils/tenantFileUpload', async (importOriginal) => {
  const original = await importOriginal<typeof TenantFileUpload>();
  return { ...original, uploadTenantFile: vi.fn() };
});
afterEach(cleanup);
it('does not submit a proof when HR changes the displayed regime while its upload is pending', async () => {
  let resolveUpload: (id: string) => void = () => undefined;
  const upload = new Promise<string>((resolve) => {
    resolveUpload = resolve;
  });
  vi.mocked(uploadTenantFile).mockReturnValueOnce(upload);
  const request = vi.fn();
  const client = new GraphQLClient('https://example.invalid/graphql');
  Object.defineProperty(client, 'request', { value: request });
  const context: TaxSubmissionContext = {
    fiscal_year: 2026,
    settings: { regime: 'OLD', method: 'ANNUAL_PROJECTION', effective_from: '2026-10-01' },
    declaration: null,
  };
  const { result, rerender } = renderHook(
    ({ value }) => useTaxProofForm(client, value, 'employee-1:2026', true, [], vi.fn()),
    { initialProps: { value: context } }
  );
  act(() => {
    result.current.setProofSectionCode('80C');
    result.current.setProofDeclared('1000');
    result.current.setProofFile(new File(['proof'], 'proof.pdf', { type: 'application/pdf' }));
  });
  let pending: Promise<void> = Promise.resolve();
  act(() => {
    pending = result.current.handleProofSubmit({
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent);
  });
  expect(uploadTenantFile).toHaveBeenCalledTimes(1);
  rerender({
    value: {
      ...context,
      settings: { regime: 'NEW', method: 'ANNUAL_PROJECTION', effective_from: '2026-10-01' },
    },
  });
  await act(async () => {
    resolveUpload('uploaded-file');
    await pending;
  });
  expect(request).not.toHaveBeenCalled();
  expect(result.current.proofBusy).toBe(false);
});
