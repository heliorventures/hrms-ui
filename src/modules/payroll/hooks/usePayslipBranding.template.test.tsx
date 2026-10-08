// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { GraphQLClient } from 'graphql-request';
import { afterEach, expect, it, vi } from 'vitest';

import { PayrollComplianceSettingDocument } from '../../../api/graphql/graphql';
import { tenantCalendarPeriod } from '../../../utils/tenantCalendar';
import { PayslipLogoSignedReadUrlDocument } from '../documents';
import { PAYSLIP_SETTINGS_CHANGED } from '../payslipTemplates';

import { useEmployeePayslips } from './useEmployeePayRecords';

afterEach(cleanup);

it('keeps branding pending until company settings and the configured logo finish loading', async () => {
  let resolveLogo: (value: { payslipLogoSignedReadUrl: string }) => void = () => {
    throw new Error('Logo request not started');
  };
  const request = vi.fn((document: unknown) => {
    if (document === PayrollComplianceSettingDocument)
      return Promise.resolve({
        payrollComplianceSetting: {
          payslipHeaderTitle: 'Company',
          payslipLogoFileStorageId: 'logo-one',
        },
      });
    if (document === PayslipLogoSignedReadUrlDocument)
      return new Promise<{ payslipLogoSignedReadUrl: string }>((resolve) => {
        resolveLogo = resolve;
      });
    return Promise.resolve({ payslips: [] });
  });
  const client = new GraphQLClient('https://example.invalid/graphql');
  Object.defineProperty(client, 'request', { value: request });
  const period = tenantCalendarPeriod(new Date('2026-10-06T00:00:00Z'), 'Asia/Kolkata');
  const { result } = renderHook(() => useEmployeePayslips(client, 'company-a', true, true, period));
  await waitFor(() =>
    expect(request).toHaveBeenCalledWith(PayslipLogoSignedReadUrlDocument, {
      fileStorageId: 'logo-one',
    })
  );
  expect(result.current.payslipBrandingLoading).toBe(true);
  act(() => {
    resolveLogo({ payslipLogoSignedReadUrl: 'https://example.invalid/logo.png' });
  });
  await waitFor(() => expect(result.current.payslipBrandingLoading).toBe(false));
});

it('exposes settings errors and retries without silently treating the failure as absent branding', async () => {
  const request = vi.fn(
    (document: unknown): Promise<unknown> =>
      document === PayrollComplianceSettingDocument
        ? Promise.reject(new Error('Company settings unavailable'))
        : Promise.resolve({ payslips: [] })
  );
  const client = new GraphQLClient('https://example.invalid/graphql');
  Object.defineProperty(client, 'request', { value: request });
  const period = tenantCalendarPeriod(new Date('2026-10-06T00:00:00Z'), 'Asia/Kolkata');
  const { result } = renderHook(() => useEmployeePayslips(client, 'company-a', true, true, period));
  await waitFor(() => expect(result.current.payslipBrandingError).toBeTruthy());
  request.mockImplementation(() => Promise.resolve({ payrollComplianceSetting: null }));
  act(() => {
    result.current.retryPayslipBranding();
  });
  await waitFor(() => expect(result.current.payslipBrandingError).toBeNull());
  expect(result.current.payslipBrandingLoading).toBe(false);
});

it('refreshes company branding and clears a removed logo after settings are saved', async () => {
  let updated = false;
  const request = vi.fn((document: unknown) => {
    if (document === PayrollComplianceSettingDocument)
      return Promise.resolve({
        payrollComplianceSetting: {
          payslipHeaderTitle: updated ? 'New company header' : 'Old company header',
          payslipCompanyAddress: updated ? null : 'Old company address',
          payslipLogoFileStorageId: updated ? null : 'logo-one',
        },
      });
    if (document === PayslipLogoSignedReadUrlDocument)
      return Promise.resolve({ payslipLogoSignedReadUrl: 'https://example.invalid/logo.png' });
    return Promise.resolve({ payslips: [] });
  });
  const client = new GraphQLClient('https://example.invalid/graphql');
  Object.defineProperty(client, 'request', { value: request });
  const period = tenantCalendarPeriod(new Date('2026-10-06T00:00:00Z'), 'Asia/Kolkata');
  const { result } = renderHook(() => useEmployeePayslips(client, 'company-a', true, true, period));
  await waitFor(() =>
    expect(result.current.payslipLogoReadUrl).toBe('https://example.invalid/logo.png')
  );
  expect(result.current.payslipBranding?.payslipCompanyAddress).toBe('Old company address');
  updated = true;
  act(() => {
    window.dispatchEvent(new Event(PAYSLIP_SETTINGS_CHANGED));
  });
  await waitFor(() =>
    expect(result.current.payslipBranding?.payslipHeaderTitle).toBe('New company header')
  );
  expect(result.current.payslipBranding?.payslipCompanyAddress).toBeNull();
  expect(result.current.payslipLogoReadUrl).toBeNull();
});
