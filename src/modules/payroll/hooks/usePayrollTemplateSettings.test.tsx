// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { GraphQLClient } from 'graphql-request';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  PayrollComplianceSettingDocument,
  UpsertPayrollComplianceSettingDocument,
} from '../../../api/graphql/graphql';
import { DialogProvider } from '../../../contexts/DialogContext';

import { usePayrollBoard } from './usePayrollBoard';
import { usePayrollBoardActions } from './usePayrollBoardActions';

afterEach(cleanup);
const wrapper = ({ children }: PropsWithChildren) => <DialogProvider>{children}</DialogProvider>;
const clientWith = (request: unknown) => {
  const client = new GraphQLClient('https://example.invalid/graphql');
  Object.defineProperty(client, 'request', { value: request });
  return client;
};

describe('company payslip settings', () => {
  it('loads the saved company selection', async () => {
    const request = vi.fn().mockImplementation((document: unknown) =>
      Promise.resolve(
        document === PayrollComplianceSettingDocument
          ? {
              payrollComplianceSetting: {
                payslipTemplate: 'TABLE',
                payslipEmployeeFields: ['EMPLOYEE_NAME', 'EMPLOYEE_CODE', 'UAN', 'ESIC'],
                baseSalaryComponentCode: 'BASIC',
                arrearSalaryComponentCode: 'ARREAR',
              },
            }
          : { salaryComponents: [], payrollCycles: [], payrollArrears: [] }
      )
    );
    const client = clientWith(request);
    const { result } = renderHook(() =>
      usePayrollBoard(client, { enabled: true, ownerKey: 'company-a' })
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.complianceForm.payslipTemplateInput).toBe('TABLE');
  });

  it('reports failed settings reads instead of offering the default as saved', async () => {
    const request = vi
      .fn()
      .mockImplementation((document: unknown) =>
        document === PayrollComplianceSettingDocument
          ? Promise.reject(new Error('Settings unavailable'))
          : Promise.resolve({ salaryComponents: [], payrollCycles: [], payrollArrears: [] })
      );
    const client = clientWith(request);
    const { result } = renderHook(() =>
      usePayrollBoard(client, { enabled: true, ownerKey: 'company-a' })
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeNull();
  });

  it('saves the selected template through company settings', async () => {
    const request = vi
      .fn()
      .mockResolvedValue({ upsertPayrollComplianceSetting: { payslipTemplate: 'TABLE' } });
    const client = clientWith(request);
    const reload = vi.fn().mockResolvedValue(undefined);
    const form = {
      payslipTemplateInput: 'TABLE' as const,
      payslipEmployeeFieldsInput: ['EMPLOYEE_NAME', 'EMPLOYEE_CODE', 'UAN', 'ESIC'],
      employerTanInput: '',
      employerLegalNameInput: '',
      baseComponentInput: 'BASIC',
      arrearComponentInput: 'ARREAR',
      payslipHeaderInput: '',
      payslipLogoIdInput: '',
    };
    const { result } = renderHook(
      () =>
        usePayrollBoardActions({
          client,
          enabled: true,
          complianceReady: true,
          ownerKey: 'company-a',
          complianceForm: form,
          reload,
        }),
      { wrapper }
    );
    await act(async () => result.current.savePayrollCompliance());
    expect(request).toHaveBeenCalledWith(UpsertPayrollComplianceSettingDocument, {
      input: {
        payslipTemplate: 'TABLE',
        payslipEmployeeFields: ['EMPLOYEE_NAME', 'EMPLOYEE_CODE', 'UAN', 'ESIC'],
        employerTan: null,
        employerLegalName: null,
        baseSalaryComponentCode: 'BASIC',
        arrearSalaryComponentCode: 'ARREAR',
        payslipHeaderTitle: null,
        payslipLogoFileStorageId: null,
      },
    });
    expect(reload).toHaveBeenCalledOnce();
  });
});
