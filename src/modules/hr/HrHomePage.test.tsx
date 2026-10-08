// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';

import HrHomePage from './HrHomePage';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    can: () => false,
    clientSession: {
      jwtRoles: [],
      permissions: new Set(['leave:approve']),
      permissionScopes: { 'leave:approve': 'TEAM' },
      resourceScopes: {},
      persona: 'EMPLOYEE',
      mustChangePassword: false,
    },
  }),
}));
afterEach(cleanup);
it('keeps the legacy workbench limited to accessible functional shortcuts', () => {
  render(
    <MemoryRouter>
      <HrHomePage />
    </MemoryRouter>
  );
  expect(screen.getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
    '/organization/documents',
    '/hr/leaves',
  ]);
});
