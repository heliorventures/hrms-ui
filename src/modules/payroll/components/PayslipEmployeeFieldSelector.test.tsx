// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import PayslipEmployeeFieldSelector from './PayslipEmployeeFieldSelector';

afterEach(cleanup);

describe('employee fields on payslip', () => {
  it('lets an admin enable gender and hide UAN without changing other fields', () => {
    const change = vi.fn();
    render(
      <PayslipEmployeeFieldSelector
        value={['EMPLOYEE_NAME', 'UAN']}
        disabled={false}
        onChange={change}
      />
    );
    fireEvent.click(screen.getByRole('checkbox', { name: 'Gender' }));
    expect(change).toHaveBeenLastCalledWith(['EMPLOYEE_NAME', 'UAN', 'GENDER']);
    fireEvent.click(screen.getByRole('checkbox', { name: 'UAN' }));
    expect(change).toHaveBeenLastCalledWith(['EMPLOYEE_NAME']);
  });

  it('disables editing while settings are loading or saving', () => {
    render(<PayslipEmployeeFieldSelector value={[]} disabled onChange={vi.fn()} />);
    expect(screen.getByRole('group').hasAttribute('disabled')).toBe(true);
  });
});
