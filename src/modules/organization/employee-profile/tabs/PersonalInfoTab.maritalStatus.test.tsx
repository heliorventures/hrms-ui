// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { GraphQLClient } from 'graphql-request';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';

import { UpdateEmployeeSelfServiceProfileDocument } from '../../../../api/graphql/graphql';
import type { PersonalInfoFields } from '../types';

import { PersonalInfoTab } from './PersonalInfoTab';

afterEach(cleanup);
const initial: PersonalInfoFields = {
  firstName: 'Example',
  lastName: 'Employee',
  email: '',
  phone: '',
  bloodGroup: '',
  dateOfBirth: '',
  gender: '',
  maritalStatus: '',
  nationality: '',
  permanentAddress: '',
  currentAddress: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelation: '',
};

it('saves marital status through the existing personal profile operation', async () => {
  const request = vi.fn().mockResolvedValue({
    updateEmployeeSelfServiceProfile: { maritalStatus: 'MARRIED' },
  });
  const client = new GraphQLClient('https://example.invalid/graphql');
  Object.defineProperty(client, 'request', { value: request });
  render(
    <MemoryRouter>
      <PersonalInfoTab
        employeeId="employee-a"
        client={client}
        initial={initial}
        pendingRequests={[]}
      />
    </MemoryRouter>
  );
  fireEvent.change(screen.getByRole('combobox', { name: 'Marital Status' }), {
    target: { value: 'MARRIED' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() =>
    expect(request).toHaveBeenCalledWith(UpdateEmployeeSelfServiceProfileDocument, {
      input: expect.objectContaining({ employeeId: 'employee-a', maritalStatus: 'MARRIED' }),
    })
  );
  expect(await screen.findByText('Profile saved.')).toBeTruthy();
  expect(
    (screen.getByRole('combobox', { name: 'Marital Status' }) as HTMLSelectElement).value
  ).toBe('MARRIED');
});

it('keeps the marital status field read-only when profile editing is denied', () => {
  render(
    <MemoryRouter>
      <PersonalInfoTab
        employeeId="employee-a"
        client={new GraphQLClient('https://example.invalid')}
        initial={initial}
        pendingRequests={[]}
        readOnly
      />
    </MemoryRouter>
  );
  expect(
    (screen.getByRole('combobox', { name: 'Marital Status' }) as HTMLSelectElement).disabled
  ).toBe(true);
  expect(screen.queryByRole('button', { name: 'Save' })).toBeNull();
});
