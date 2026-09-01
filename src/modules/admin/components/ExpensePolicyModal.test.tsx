// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ExpensePolicyForm } from '../expenseCategoryTypes';

import ExpensePolicyModal from './ExpensePolicyModal';

const form: ExpensePolicyForm = {
  editPolicyId: null,
  applicableTo: 'DEPARTMENT',
  departmentId: '',
  designationId: '',
  roleId: '',
  limitPerDay: '',
  limitPerMonth: '',
  maxAmountPerClaim: '',
  receiptRequired: false,
  approvalRequired: false,
};

const baseProps = {
  open: true,
  form,
  error: null,
  saving: false,
  directoryLoading: false,
  directoryError: null,
  departmentOptions: [],
  designationOptions: [],
  roleOptions: [],
  hasDepartments: false,
  hasDesignations: false,
  hasRoles: false,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
  onChange: vi.fn(),
};

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('ExpensePolicyModal directory picker availability', () => {
  it('keeps usable active-scope options enabled and selectable during refresh', () => {
    const onChange = vi.fn();

    render(
      <ExpensePolicyModal
        {...baseProps}
        directoryLoading
        departmentOptions={[{ id: 'department-1', title: 'Finance' }]}
        hasDepartments
        onChange={onChange}
      />
    );

    expect(screen.getByText('Loading Organization Directory...')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('1 result available.');

    const picker = screen.getByRole<HTMLSelectElement>('listbox', { name: 'Department' });
    expect(picker.disabled).toBe(false);
    expect(screen.getByRole('option', { name: 'Finance' })).toBeTruthy();

    fireEvent.change(picker, { target: { value: 'department-1' } });
    expect(onChange).toHaveBeenCalledWith({ ...form, departmentId: 'department-1' });
  });

  it('announces loading and preserves usable options when a later directory warning exists', () => {
    const view = render(<ExpensePolicyModal {...baseProps} directoryLoading />);

    expect(screen.getByRole('status').textContent).toBe('Loading organization directory.');
    expect(screen.getByRole<HTMLSelectElement>('listbox', { name: 'Department' }).disabled).toBe(
      true
    );
    expect(screen.queryByText('No options are available.')).toBeNull();

    view.rerender(
      <ExpensePolicyModal
        {...baseProps}
        directoryError="The directory refresh failed."
        departmentOptions={[{ id: 'department-1', title: 'Finance' }]}
        hasDepartments
      />
    );
    expect(screen.getByText('The directory refresh failed.')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('1 result available.');
    expect(screen.getByRole<HTMLSelectElement>('listbox', { name: 'Department' }).disabled).toBe(
      false
    );
    expect(screen.getByRole('option', { name: 'Finance' })).toBeTruthy();

    view.rerender(
      <ExpensePolicyModal {...baseProps} directoryError="The directory request failed." />
    );
    expect(screen.queryByRole('listbox', { name: 'Department' })).toBeNull();
    expect(screen.getByLabelText('Department ID (Paste UUID)')).toBeTruthy();
  });
});
