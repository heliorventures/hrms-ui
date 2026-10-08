// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { GraphQLClient } from 'graphql-request';
import { afterEach, expect, it, vi } from 'vitest';

import {
  ManagedEmployeePayslipsDocument,
  ManagedPayslipEmployeesDocument,
  PayslipPresentationDocument,
  PayslipUnpaidLeaveDocument,
  PayslipLogoSignedReadUrlDocument,
} from '../../../api/graphql/graphql';
import { PAYSLIP_SETTINGS_CHANGED } from '../payslipTemplates';

import ManagedPayslips from './ManagedPayslips';

vi.mock('../../../contexts/TenantContext', () => ({
  useTenant: () => ({ currentTenant: { name: 'Company', id: 'tenant' } }),
}));
vi.mock('./PayslipDocument', () => ({
  default: ({
    employeeCode,
    companyHeaderName,
    companyAddress,
    detailsPending,
  }: {
    employeeCode: string;
    companyHeaderName?: string;
    companyAddress?: string | null;
    detailsPending?: boolean;
  }) => (
    <div>
      Payslip for {employeeCode}
      <span>{companyHeaderName}</span>
      <span>{companyAddress}</span>
      <button disabled={detailsPending}>Download PDF</button>
    </div>
  ),
}));
afterEach(cleanup);

it('blocks managed output until its configured logo resolves and exposes failed lookup retry', async () => {
  let retrying = false;
  let rejectLogo: (error: Error) => void = () => {
    throw new Error('Logo request not started');
  };
  const request = vi.fn((query: unknown) => {
    if (query === PayslipLogoSignedReadUrlDocument)
      return retrying
        ? Promise.resolve({ payslipLogoSignedReadUrl: 'https://example.invalid/logo.png' })
        : new Promise((_resolve, reject) => {
            rejectLogo = reject;
          });
    if (query === PayslipPresentationDocument)
      return Promise.resolve({
        payslipPresentation: { template: 'TABLE', employeeDetails: [], lines: [], statement: null },
      });
    if (query === PayslipUnpaidLeaveDocument) return Promise.resolve({ payslipUnpaidLeave: null });
    if (query === ManagedPayslipEmployeesDocument)
      return Promise.resolve({
        employees: [{ id: 'one', employeeCode: 'EMP01', fullName: 'Employee' }],
      });
    return Promise.resolve({
      payslips: [{ id: 'slip', periodYear: 2026, periodMonth: 9 }],
      payrollComplianceSetting: {
        payslipHeaderTitle: 'Company header',
        payslipLogoFileStorageId: 'logo-one',
      },
      salaryComponents: [],
    });
  });
  render(<ManagedPayslips client={{ request } as unknown as GraphQLClient} ownerKey="company-a" />);
  await screen.findByText(/EMP01/);
  fireEvent.change(screen.getByLabelText('Employee payslips'), { target: { value: 'one' } });
  await screen.findByText('Company header');
  await waitFor(() =>
    expect(request.mock.calls.some(([query]) => query === PayslipLogoSignedReadUrlDocument)).toBe(
      true
    )
  );
  expect(screen.getByRole('button', { name: 'Download PDF' }).hasAttribute('disabled')).toBe(true);
  act(() => {
    rejectLogo(new Error('Logo unavailable'));
  });
  expect((await screen.findByRole('alert')).textContent).toContain(
    'Payslip details could not be loaded.'
  );
  expect(screen.getByRole('button', { name: 'Download PDF' }).hasAttribute('disabled')).toBe(true);
  retrying = true;
  fireEvent.click(screen.getByRole('button', { name: 'Retry payslip details' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Download PDF' }).hasAttribute('disabled')).toBe(
      false
    )
  );
});

it('refreshes managed payslip branding without changing the selected period', async () => {
  let updated = false;
  const request = vi.fn((query: unknown) =>
    Promise.resolve(
      query === ManagedPayslipEmployeesDocument
        ? { employees: [{ id: 'one', employeeCode: 'EMP01', fullName: 'Employee' }] }
        : {
            payslips: [
              { id: 'september', periodYear: 2026, periodMonth: 9 },
              { id: 'august', periodYear: 2026, periodMonth: 8 },
            ],
            payrollComplianceSetting: {
              payslipHeaderTitle: updated ? 'Updated header' : 'Original header',
              payslipCompanyAddress: updated ? null : 'Original company address',
            },
            salaryComponents: [],
          }
    )
  );
  render(<ManagedPayslips client={{ request } as unknown as GraphQLClient} ownerKey="company-a" />);
  await screen.findByText(/EMP01/);
  fireEvent.change(screen.getByLabelText('Employee payslips'), { target: { value: 'one' } });
  await screen.findByText('Original header');
  expect(screen.getByText('Original company address')).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Payslip period'), { target: { value: 'august' } });
  updated = true;
  act(() => {
    window.dispatchEvent(new Event(PAYSLIP_SETTINGS_CHANGED));
  });
  await screen.findByText('Updated header');
  expect(screen.queryByText('Original company address')).toBeNull();
  expect(screen.getByLabelText<HTMLSelectElement>('Payslip period').value).toBe('august');
});

it('requires explicit employee selection and clears prior slips when employee changes', async () => {
  const request = vi.fn((query: unknown) =>
    Promise.resolve(
      query === ManagedPayslipEmployeesDocument
        ? {
            employees: [
              { id: 'one', employeeCode: 'SCL/01', fullName: 'First' },
              { id: 'two', employeeCode: 'SCL/02', fullName: 'Second' },
            ],
          }
        : {
            payslips: [{ id: 'slip', periodYear: 2026, periodMonth: 9 }],
            payrollComplianceSetting: null,
            salaryComponents: [],
          }
    )
  );
  render(
    <ManagedPayslips client={{ request } as unknown as GraphQLClient} ownerKey="tenant-admin" />
  );
  await screen.findByText('SCL/01 — First');
  expect(request.mock.calls.some(([query]) => query === ManagedEmployeePayslipsDocument)).toBe(
    false
  );
  fireEvent.change(screen.getByLabelText('Employee payslips'), { target: { value: 'one' } });
  await waitFor(() =>
    expect(request).toHaveBeenCalledWith(ManagedEmployeePayslipsDocument, {
      employeeId: 'one',
    })
  );
  request.mockImplementation(() => new Promise(() => {}));
  fireEvent.change(screen.getByLabelText('Employee payslips'), { target: { value: 'two' } });
  expect(screen.queryByText('Payslip for SCL/01')).toBeNull();
});
