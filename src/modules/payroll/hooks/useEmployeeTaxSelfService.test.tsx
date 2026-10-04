// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { GraphQLClient } from 'graphql-request';
import { afterEach, expect, it, vi } from 'vitest';

import { UpsertTaxComputationDocument } from '../../../api/graphql/graphql';
import { taxSubmissionContextQuery } from '../taxSubmissionContext';

import { useEmployeeTaxSelfService } from './useEmployeeTaxSelfService';

afterEach(cleanup);
it('submits using assigned employee FY and regime without a manually enabled global tax configuration', async () => {
  const request = vi.fn((document: unknown) => {
    if (document === UpsertTaxComputationDocument)
      return Promise.resolve({ upsertTaxComputation: { id: 'declaration' } });
    return Promise.resolve({
      employeeTaxSubmissionContext: {
        fiscal_year: 2026,
        settings: { regime: 'NEW', method: 'ANNUAL_PROJECTION', effective_from: '2026-10-01' },
        declaration: null,
      },
      taxComputations: [],
      taxProofLines: [],
      taxSectionDefinitions: [],
    });
  });
  const client = new GraphQLClient('https://example.invalid/graphql');
  Object.defineProperty(client, 'request', { value: request });
  const { result } = renderHook(() =>
    useEmployeeTaxSelfService(client, {
      enabled: true,
      canSubmit: true,
      ownerKey: 'employee-1',
      fiscalYear: 2026,
    })
  );
  await waitFor(() => expect(result.current.loadingEmployeeTax).toBe(false));
  await act(async () =>
    result.current.handleDeclUpsert({ preventDefault: vi.fn() } as unknown as React.FormEvent)
  );
  expect(request).toHaveBeenCalledWith(UpsertTaxComputationDocument, {
    input: { fiscalYear: 2026, taxRegimeChosen: 'NEW', grossIncome: null, totalDeductions: null },
  });
  expect(result.current.declMsg).toBe('Saved your estimated declaration.');
});

it('discards late context from the previous financial year and submits only the new assigned regime', async () => {
  let resolvePrevious: (value: unknown) => void = () => undefined;
  const previous = new Promise((resolve) => {
    resolvePrevious = resolve;
  });
  const request = vi.fn((document: unknown, variables: { fiscalYear?: number }) => {
    if (document === taxSubmissionContextQuery && variables.fiscalYear === 2026) return previous;
    return Promise.resolve({
      employeeTaxSubmissionContext: {
        fiscal_year: 2027,
        settings: { regime: 'OLD', method: 'ANNUAL_PROJECTION', effective_from: '2027-04-01' },
        declaration: null,
      },
      taxComputations: [],
      taxProofLines: [],
      taxSectionDefinitions: [],
    });
  });
  const client = new GraphQLClient('https://example.invalid/graphql');
  Object.defineProperty(client, 'request', { value: request });
  const { result, rerender } = renderHook(
    ({ fiscalYear }) =>
      useEmployeeTaxSelfService(client, {
        enabled: true,
        canSubmit: true,
        ownerKey: 'employee-1',
        fiscalYear,
      }),
    { initialProps: { fiscalYear: 2026 } }
  );
  rerender({ fiscalYear: 2027 });
  await waitFor(() => expect(result.current.declRegime).toBe('OLD'));
  await act(async () => {
    resolvePrevious({
      employeeTaxSubmissionContext: {
        fiscal_year: 2026,
        settings: { regime: 'NEW' },
        declaration: null,
      },
    });
    await previous;
  });
  expect(result.current.declFy).toBe('2027');
  expect(result.current.declRegime).toBe('OLD');
  await act(async () =>
    result.current.handleDeclUpsert({ preventDefault: vi.fn() } as unknown as React.FormEvent)
  );
  expect(request).toHaveBeenCalledWith(UpsertTaxComputationDocument, {
    input: { fiscalYear: 2027, taxRegimeChosen: 'OLD', grossIncome: null, totalDeductions: null },
  });
});

it('clears the previous employee context and rejects submission after permission is revoked', async () => {
  const request = vi.fn(() =>
    Promise.resolve({
      employeeTaxSubmissionContext: {
        fiscal_year: 2026,
        settings: { regime: 'NEW', method: 'ANNUAL_PROJECTION', effective_from: '2026-10-01' },
        declaration: null,
      },
      taxComputations: [],
      taxProofLines: [],
      taxSectionDefinitions: [],
    })
  );
  const client = new GraphQLClient('https://example.invalid/graphql');
  Object.defineProperty(client, 'request', { value: request });
  const { result, rerender } = renderHook(
    ({ enabled, canSubmit, ownerKey }) =>
      useEmployeeTaxSelfService(client, { enabled, canSubmit, ownerKey, fiscalYear: 2026 }),
    { initialProps: { enabled: true, canSubmit: true, ownerKey: 'employee-1' } }
  );
  await waitFor(() => expect(result.current.submissionContext).not.toBeNull());
  rerender({ enabled: false, canSubmit: false, ownerKey: 'employee-2' });
  expect(result.current.submissionContext).toBeNull();
  await act(async () =>
    result.current.handleDeclUpsert({ preventDefault: vi.fn() } as unknown as React.FormEvent)
  );
  expect(request).not.toHaveBeenCalledWith(UpsertTaxComputationDocument, expect.anything());
});
