// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { GraphQLClient } from 'graphql-request';
import { afterEach, expect, it, vi } from 'vitest';

import ManagedPayslips from './ManagedPayslips';

vi.mock('../../../contexts/TenantContext', () => ({
  useTenant: () => ({ currentTenant: { name: 'Company', id: 'tenant' } }),
}));
vi.mock('./PayslipDocument', () => ({
  default: ({ employeeCode }: { employeeCode: string }) => <div>Payslip for {employeeCode}</div>,
}));
afterEach(cleanup);

it('requires explicit employee selection and clears prior slips when employee changes', async () => {
  const request = vi.fn((query: string) =>
    Promise.resolve(
      query.includes('ManagedPayslipEmployees')
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
  expect(request.mock.calls.some(([query]) => query.includes('ManagedEmployeePayslips'))).toBe(
    false
  );
  fireEvent.change(screen.getByLabelText('Employee payslips'), { target: { value: 'one' } });
  await waitFor(() =>
    expect(request).toHaveBeenCalledWith(expect.stringContaining('ManagedEmployeePayslips'), {
      employeeId: 'one',
    })
  );
  request.mockImplementation(() => new Promise(() => {}));
  fireEvent.change(screen.getByLabelText('Employee payslips'), { target: { value: 'two' } });
  expect(screen.queryByText('Payslip for SCL/01')).toBeNull();
});
