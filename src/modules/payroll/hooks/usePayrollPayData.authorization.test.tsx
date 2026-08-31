// @vitest-environment jsdom

import { act, renderHook, waitFor } from '@testing-library/react';
import { GraphQLClient } from 'graphql-request';
import { describe, expect, it, vi } from 'vitest';

import {
  ClientOpsPayslipsForPayrollHubDocument,
  ClientOpsPayrollTaxBoardDocument,
  EmployeeSalaryBreakupPreviewDocument,
  PayrollBoardDocument,
  PayrollComplianceSettingDocument,
  PayrollShellDocument,
  TaxComputationsListDocument,
  TaxProofLinesDocument,
  TaxSectionDefinitionsDocument,
} from '../../../api/graphql/graphql';

import { usePayrollPayData } from './usePayrollPayData';

function clientWith(request: unknown) {
  const client = new GraphQLClient('https://example.invalid/graphql');
  Object.defineProperty(client, 'request', { value: request });
  return client;
}

describe('usePayrollPayData exact read authority', () => {
  it('sends no payroll or tax request without an enabled read permission', async () => {
    const request = vi.fn();
    const client = clientWith(request);
    const { result } = renderHook(() =>
      usePayrollPayData(client, 'payslip', {
        canReadPayroll: false,
        canReadTax: false,
        canSubmitTax: false,
        ownerKey: 'employee|none',
        tenantTimezone: 'Asia/Kolkata',
      })
    );

    await waitFor(() => expect(result.current.loadingShell).toBe(false));
    expect(request).not.toHaveBeenCalled();
    expect(result.current.payslips).toBeNull();
  });

  it('loads the signed-in employee salary preview without requesting payroll administration data', async () => {
    const preview = {
      employeeId: 'employee-1',
      annualCtc: '1200000',
      monthlyGross: '100000',
      monthlyDeductions: '10000',
      monthlyNetBeforeStatutory: '90000',
      lines: [],
    };
    const request = vi.fn((document: unknown) => {
      if (document === EmployeeSalaryBreakupPreviewDocument) {
        return Promise.resolve({ employeeSalaryBreakupPreview: preview });
      }
      return Promise.reject(new Error('Unexpected GraphQL document.'));
    });
    const client = clientWith(request);
    const { result } = renderHook(() =>
      usePayrollPayData(client, 'salary', {
        canReadPayroll: true,
        canReadTax: false,
        canSubmitTax: false,
        ownerKey: 'employee-1|payroll:read=SELF',
        tenantTimezone: 'Asia/Kolkata',
      })
    );

    await waitFor(() => expect(result.current.loadingSalary).toBe(false));
    expect(result.current.salaryPreview).toEqual(preview);
    expect(request).toHaveBeenCalledWith(EmployeeSalaryBreakupPreviewDocument, {
      asOf: null,
    });
    expect(request).not.toHaveBeenCalledWith(PayrollBoardDocument, expect.anything());
    expect(request).not.toHaveBeenCalledWith(PayrollShellDocument, expect.anything());
  });

  it('clears salary data while a different authorization owner is loading', async () => {
    const preview = {
      employeeId: 'employee-1',
      annualCtc: '1200000',
      monthlyGross: '100000',
      monthlyDeductions: '10000',
      monthlyNetBeforeStatutory: '90000',
      lines: [],
    };
    let salaryRequestCount = 0;
    const request = vi.fn((document: unknown) => {
      if (document !== EmployeeSalaryBreakupPreviewDocument) {
        return Promise.reject(new Error('Unexpected GraphQL document.'));
      }
      salaryRequestCount += 1;
      return salaryRequestCount === 1
        ? Promise.resolve({ employeeSalaryBreakupPreview: preview })
        : new Promise(() => undefined);
    });
    const client = clientWith(request);
    const { result, rerender } = renderHook(
      ({ ownerKey }) =>
        usePayrollPayData(client, 'salary', {
          canReadPayroll: true,
          canReadTax: false,
          canSubmitTax: false,
          ownerKey,
          tenantTimezone: 'Asia/Kolkata',
        }),
      { initialProps: { ownerKey: 'employee-1|payroll:read=SELF' } }
    );

    await waitFor(() => expect(result.current.salaryPreview).toEqual(preview));
    rerender({ ownerKey: 'employee-2|payroll:read=SELF' });
    await waitFor(() => expect(salaryRequestCount).toBe(2));

    expect(result.current.salaryPreview).toBeNull();
  });

  it('loads tax self-service without issuing payroll reads', async () => {
    const request = vi.fn((document: unknown) => {
      if (document === ClientOpsPayrollTaxBoardDocument) {
        return Promise.resolve({ taxConfigurations: [], taxSlabs: [] });
      }
      if (document === TaxComputationsListDocument) return Promise.resolve({ taxComputations: [] });
      if (document === TaxProofLinesDocument) return Promise.resolve({ taxProofLines: [] });
      if (document === TaxSectionDefinitionsDocument) {
        return Promise.resolve({ taxSectionDefinitions: [] });
      }
      return Promise.reject(new Error('Unexpected GraphQL document.'));
    });
    const client = clientWith(request);
    const { result } = renderHook(() =>
      usePayrollPayData(client, 'incometax', {
        canReadPayroll: false,
        canReadTax: true,
        canSubmitTax: false,
        ownerKey: 'employee|tax:read=SELF',
        tenantTimezone: 'Asia/Kolkata',
      })
    );

    await waitFor(() => expect(result.current.loadingEmployeeTax).toBe(false));
    expect(request).toHaveBeenCalledWith(ClientOpsPayrollTaxBoardDocument, { limit: 100 });
    expect(request).not.toHaveBeenCalledWith(PayrollShellDocument, expect.anything());
    expect(request).not.toHaveBeenCalledWith(
      ClientOpsPayslipsForPayrollHubDocument,
      expect.anything()
    );
  });

  it('offers every current-year month through the current month when no payslips exist', async () => {
    const request = vi.fn((document: unknown) => {
      if (document === ClientOpsPayslipsForPayrollHubDocument) {
        return Promise.resolve({ payslips: [] });
      }
      if (document === PayrollComplianceSettingDocument) {
        return Promise.resolve({ payrollComplianceSetting: null });
      }
      return Promise.reject(new Error('Unexpected GraphQL document.'));
    });
    const client = clientWith(request);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentPeriodKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

    const { result } = renderHook(() =>
      usePayrollPayData(client, 'payslip', {
        canReadPayroll: true,
        canReadTax: false,
        canSubmitTax: false,
        ownerKey: 'employee-1|payroll:read=SELF',
        tenantTimezone: 'Asia/Kolkata',
      })
    );

    await waitFor(() => expect(result.current.payslips).toEqual([]));
    await waitFor(() => expect(result.current.selectedPeriodKey).toBe(currentPeriodKey));

    expect(result.current.payslipPeriodOptions).toHaveLength(currentMonth);
    expect(result.current.payslipPeriodOptions[0].periodKey).toBe(currentPeriodKey);
    expect(
      result.current.payslipPeriodOptions[result.current.payslipPeriodOptions.length - 1]?.periodKey
    ).toBe(`${currentYear}-01`);
    expect(result.current.activePayslip).toBeNull();
  });

  it('clears payslips while a different authorization owner is loading', async () => {
    const now = new Date();
    const payslip = {
      id: 'payslip-1',
      payrollCycleId: 'cycle-1',
      periodMonth: now.getMonth() + 1,
      periodYear: now.getFullYear(),
      grossSalary: '100000',
      totalDeductions: '10000',
      netSalary: '90000',
      status: 'GENERATED',
      generatedAt: now.toISOString(),
      lines: [],
    };
    let payslipRequestCount = 0;
    const request = vi.fn((document: unknown) => {
      if (document === ClientOpsPayslipsForPayrollHubDocument) {
        payslipRequestCount += 1;
        return payslipRequestCount === 1
          ? Promise.resolve({ payslips: [payslip] })
          : new Promise(() => undefined);
      }
      if (document === PayrollComplianceSettingDocument) {
        return Promise.resolve({ payrollComplianceSetting: null });
      }
      return Promise.reject(new Error('Unexpected GraphQL document.'));
    });
    const client = clientWith(request);
    const { result, rerender } = renderHook(
      ({ ownerKey }) =>
        usePayrollPayData(client, 'payslip', {
          canReadPayroll: true,
          canReadTax: false,
          canSubmitTax: false,
          ownerKey,
          tenantTimezone: 'Asia/Kolkata',
        }),
      { initialProps: { ownerKey: 'employee-1|payroll:read=SELF' } }
    );

    await waitFor(() => expect(result.current.payslips).toEqual([payslip]));
    rerender({ ownerKey: 'employee-2|payroll:read=SELF' });
    await waitFor(() => expect(payslipRequestCount).toBe(2));

    expect(result.current.payslips).toBeNull();
    expect(result.current.activePayslip).toBeNull();
  });

  it.each([
    {
      name: 'Kolkata month boundary',
      timezone: 'Asia/Kolkata',
      start: new Date('2026-08-31T18:29:59.900Z'),
      beforeKey: '2026-08',
      beforeCount: 8,
      afterKey: '2026-09',
      afterCount: 9,
    },
    {
      name: 'New York year boundary while the browser is already in the next year',
      timezone: 'America/New_York',
      start: new Date('2027-01-01T04:59:59.900Z'),
      beforeKey: '2026-12',
      beforeCount: 12,
      afterKey: '2027-01',
      afterCount: 1,
    },
  ])('refreshes available periods across the $name', async (scenario) => {
    vi.useFakeTimers();
    vi.setSystemTime(scenario.start);
    const request = vi.fn((document: unknown) => {
      if (document === ClientOpsPayslipsForPayrollHubDocument) {
        return Promise.resolve({ payslips: [] });
      }
      if (document === PayrollComplianceSettingDocument) {
        return Promise.resolve({ payrollComplianceSetting: null });
      }
      return Promise.reject(new Error('Unexpected GraphQL document.'));
    });
    const client = clientWith(request);
    const { result, unmount } = renderHook(() =>
      usePayrollPayData(client, 'payslip', {
        canReadPayroll: true,
        canReadTax: false,
        canSubmitTax: false,
        ownerKey: 'employee-1|payroll:read=SELF',
        tenantTimezone: scenario.timezone,
      })
    );

    try {
      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });
      expect(result.current.payslipPeriodOptions).toHaveLength(scenario.beforeCount);
      expect(result.current.payslipPeriodOptions[0]?.periodKey).toBe(scenario.beforeKey);

      await act(async () => {
        vi.advanceTimersByTime(500);
        await Promise.resolve();
      });
      expect(result.current.payslipPeriodOptions).toHaveLength(scenario.afterCount);
      expect(result.current.payslipPeriodOptions[0]?.periodKey).toBe(scenario.afterKey);
    } finally {
      unmount();
      vi.useRealTimers();
    }
  });
});
