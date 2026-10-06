// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { GraphQLClient } from 'graphql-request';
import { afterEach, expect, it, vi } from 'vitest';

import { PAYSLIP_SETTINGS_CHANGED } from '../payslipTemplates';

import { usePayrollComplianceSave } from './usePayrollComplianceSave';

afterEach(cleanup);
const form = {
  payslipTemplateInput: 'TABLE' as const,
  employerTanInput: '',
  employerLegalNameInput: '',
  baseComponentInput: 'BASIC',
  arrearComponentInput: 'ARREAR',
  payslipHeaderInput: '',
  payslipLogoIdInput: '',
};

it.each([
  { enabled: false, complianceReady: true },
  { enabled: true, complianceReady: false },
])('blocks saving without authorization or loaded settings: %j', async (guard) => {
  const client = new GraphQLClient('https://example.invalid/graphql');
  const request = vi.fn();
  Object.defineProperty(client, 'request', { value: request });
  const { result } = renderHook(() =>
    usePayrollComplianceSave({
      client,
      ...guard,
      ownerKey: 'a',
      complianceForm: form,
      reload: vi.fn(),
    })
  );
  await act(async () => result.current.savePayrollCompliance());
  expect(request).not.toHaveBeenCalled();
});

it('ignores an old company save completion and prevents duplicate in-flight saves', async () => {
  let resolveSave: () => void = () => {
    throw new Error('Request not started');
  };
  const request = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        resolveSave = resolve;
      })
  );
  const client = new GraphQLClient('https://example.invalid/graphql');
  Object.defineProperty(client, 'request', { value: request });
  const reload = vi.fn();
  const refresh = vi.fn();
  window.addEventListener(PAYSLIP_SETTINGS_CHANGED, refresh);
  try {
    const { result, rerender } = renderHook(
      ({ ownerKey }) =>
        usePayrollComplianceSave({
          client,
          enabled: true,
          complianceReady: true,
          ownerKey,
          complianceForm: form,
          reload,
        }),
      { initialProps: { ownerKey: 'a' } }
    );
    let first: Promise<void> = Promise.resolve();
    act(() => {
      first = result.current.savePayrollCompliance();
    });
    await act(async () => result.current.savePayrollCompliance());
    expect(request).toHaveBeenCalledOnce();
    rerender({ ownerKey: 'b' });
    await act(async () => {
      resolveSave();
      await first;
    });
    expect(reload).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
    expect(result.current.complianceSaveOk).toBeNull();
    expect(result.current.complianceSaveBusy).toBe(false);
  } finally {
    window.removeEventListener(PAYSLIP_SETTINGS_CHANGED, refresh);
  }
});
