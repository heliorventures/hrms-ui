// @vitest-environment jsdom

import { renderHook, waitFor } from '@testing-library/react';
import { GraphQLClient } from 'graphql-request';
import { describe, expect, it, vi } from 'vitest';

import {
  ClientOpsPayslipsForPayrollHubDocument,
  ClientOpsPayrollTaxBoardDocument,
  EmployeeSalaryBreakupPreviewDocument,
  PayrollBoardDocument,
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
        employeeId: 'employee-1',
        ownerKey: 'employee-1|payroll:read=SELF',
      })
    );

    await waitFor(() => expect(result.current.loadingSalary).toBe(false));
    expect(result.current.salaryPreview).toEqual(preview);
    expect(request).toHaveBeenCalledWith(EmployeeSalaryBreakupPreviewDocument, {
      employeeId: 'employee-1',
      asOf: null,
    });
    expect(request).not.toHaveBeenCalledWith(PayrollBoardDocument, expect.anything());
    expect(request).not.toHaveBeenCalledWith(PayrollShellDocument, expect.anything());
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
});
