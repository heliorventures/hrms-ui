// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { graphqlDocumentSource } from '../../../testUtils/graphqlDocumentSource';

import EditEmployeeModal, { type EditEmployeeRow } from './EditEmployeeModal';

const graphClient = vi.hoisted(() => ({
  request: vi.fn<(document: unknown, variables?: unknown) => Promise<unknown>>(),
}));

vi.mock('../../../hooks/useGraphClient', () => ({ useGraphClient: () => graphClient }));
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({ can: () => false }),
}));

const employee: EditEmployeeRow = {
  id: 'employee-1',
  employeeCode: 'EMP-001',
  firstName: 'Test',
  lastName: 'Employee',
  fullName: 'Test Employee',
  status: 'ACTIVE',
  dateOfJoining: '2026-01-01',
};

const props = {
  isOpen: true,
  employee,
  onClose: vi.fn(),
  onUpdated: vi.fn(),
};

const codeInput = () => screen.getByLabelText<HTMLInputElement>(/employee code/i);
const joiningInput = () => screen.getByLabelText<HTMLInputElement>(/date of joining/i);
const submit = () => {
  const form = codeInput().closest('form');
  if (!form) throw new Error('Employee edit form missing');
  fireEvent.submit(form);
};

beforeEach(() => {
  vi.clearAllMocks();
  graphClient.request.mockImplementation(async () => ({
    departments: [],
    designations: [],
    employees: [],
  }));
});

afterEach(() => {
  cleanup();
});

describe('EditEmployeeModal identity corrections', () => {
  it('edits and saves employee code and joining date against the same internal employee ID', async () => {
    render(<EditEmployeeModal {...props} />);

    expect(codeInput().disabled).toBe(false);
    expect(joiningInput().disabled).toBe(false);
    expect(codeInput().required).toBe(true);
    expect(joiningInput().required).toBe(true);
    expect(codeInput().maxLength).toBe(50);
    expect(codeInput().value).toBe('EMP-001');
    expect(joiningInput().value).toBe('2026-01-01');

    fireEvent.change(codeInput(), { target: { value: ' EMP-002 ' } });
    fireEvent.change(joiningInput(), { target: { value: '2026-02-15' } });
    submit();

    await waitFor(() => expect(props.onUpdated).toHaveBeenCalledOnce());
    const update = graphClient.request.mock.calls.find(([document]) =>
      graphqlDocumentSource(document).includes('mutation UpdateEmployee(')
    );
    expect(update?.[1]).toEqual({
      input: expect.objectContaining({
        id: employee.id,
        employeeCode: 'EMP-002',
        dateOfJoining: '2026-02-15',
      }),
    });
    expect(props.onClose).toHaveBeenCalledOnce();
  });

  it.each([
    { code: '   ', date: '2026-01-01', message: 'Employee code is required.' },
    {
      code: 'X'.repeat(51),
      date: '2026-01-01',
      message: 'Employee code must be at most 50 characters.',
    },
    { code: 'EMP-001', date: '', message: 'Date of joining is required.' },
  ])('rejects empty identity fields before saving: $message', async ({ code, date, message }) => {
    render(<EditEmployeeModal {...props} />);
    fireEvent.change(codeInput(), { target: { value: code } });
    fireEvent.change(joiningInput(), { target: { value: date } });
    submit();

    expect(await screen.findByText(message)).toBeTruthy();
    expect(
      graphClient.request.mock.calls.some(([document]) =>
        graphqlDocumentSource(document).includes('mutation UpdateEmployee(')
      )
    ).toBe(false);
    expect(props.onClose).not.toHaveBeenCalled();
  });

  it('retains corrections after a duplicate code error and permits a successful retry', async () => {
    let updates = 0;
    graphClient.request.mockImplementation(async (document: unknown) => {
      if (graphqlDocumentSource(document).includes('mutation UpdateEmployee(')) {
        updates += 1;
        if (updates === 1) {
          throw Object.assign(new Error('employee code is already in use in this tenant'), {
            code: 'EMPLOYEE_CODE_CONFLICT',
          });
        }
      }
      return { departments: [], designations: [], employees: [] };
    });
    render(<EditEmployeeModal {...props} />);
    fireEvent.change(codeInput(), { target: { value: 'EMP-002' } });
    fireEvent.change(joiningInput(), { target: { value: '2026-02-15' } });
    submit();

    expect(
      await screen.findByText(
        'An employee already uses this employee code. Choose a different code.'
      )
    ).toBeTruthy();
    expect(codeInput().value).toBe('EMP-002');
    expect(joiningInput().value).toBe('2026-02-15');
    expect(props.onClose).not.toHaveBeenCalled();

    fireEvent.change(codeInput(), { target: { value: 'EMP-003' } });
    submit();
    await waitFor(() => expect(props.onUpdated).toHaveBeenCalledOnce());
  });

  it('discards unsaved corrections when reopened or switched to another employee', () => {
    const { rerender } = render(<EditEmployeeModal {...props} />);
    fireEvent.change(codeInput(), { target: { value: 'UNSAVED' } });
    fireEvent.change(joiningInput(), { target: { value: '2026-03-01' } });
    rerender(<EditEmployeeModal {...props} isOpen={false} />);
    rerender(<EditEmployeeModal {...props} />);
    expect(codeInput().value).toBe(employee.employeeCode);
    expect(joiningInput().value).toBe(employee.dateOfJoining);

    rerender(
      <EditEmployeeModal
        {...props}
        employee={{
          ...employee,
          id: 'employee-2',
          employeeCode: 'EMP-002',
          dateOfJoining: '2026-04-01',
        }}
      />
    );
    expect(codeInput().value).toBe('EMP-002');
    expect(joiningInput().value).toBe('2026-04-01');
  });
});
