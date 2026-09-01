// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import CreateEmployeeModal from './CreateEmployeeModal';

const graphClient = vi.hoisted(() => ({ request: vi.fn() }));

vi.mock('../../../hooks/useGraphClient', () => ({
  useGraphClient: () => graphClient,
}));

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    can: (permission: string) => permission === 'role:manage',
  }),
}));

function directoryResponse() {
  return {
    departments: [],
    designations: [],
    employees: [],
    tenantDirectoryRoles: [{ id: 'role-1', name: 'EMPLOYEE', isSystemRole: true }],
  };
}

const Harness = () => {
  const [open, setOpen] = useState(true);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open employee modal
      </button>
      <CreateEmployeeModal isOpen={open} onClose={() => setOpen(false)} onCreated={vi.fn()} />
    </>
  );
};

beforeEach(() => {
  graphClient.request.mockImplementation(async (document: unknown) => {
    if (String(document).includes('ClientOpsOrgListsForEmployeeModal')) {
      return directoryResponse();
    }
    throw Object.assign(new Error('email is already in use in this tenant'), {
      code: 'USER_EMAIL_CONFLICT',
    });
  });
});

afterEach(() => {
  cleanup();
  graphClient.request.mockReset();
});

describe('CreateEmployeeModal', () => {
  it('opens with a clean form after a previous create error was closed', async () => {
    render(<Harness />);

    await screen.findByLabelText(/employee code/i);
    fireEvent.change(screen.getByLabelText(/employee code/i), { target: { value: 'EMP-2208' } });
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Demo' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'demo.user' } });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'existing@example.test' },
    });
    fireEvent.change(screen.getByLabelText('Initial Password'), {
      target: { value: 'Password123!' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'Password123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await screen.findByText(
      'A login account already uses this email address. Use a different email or leave it blank.'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Open employee modal' }));

    await waitFor(() =>
      expect(
        screen.queryByText(
          'A login account already uses this email address. Use a different email or leave it blank.'
        )
      ).toBeNull()
    );
    expect((screen.getByLabelText(/employee code/i) as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('Email') as HTMLInputElement).value).toBe('');
  });
});
