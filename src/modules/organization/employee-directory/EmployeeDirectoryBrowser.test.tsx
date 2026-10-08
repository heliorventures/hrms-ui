// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it } from 'vitest';

import EmployeeDirectoryBrowser from './EmployeeDirectoryBrowser';
import type { DirectoryEmployee } from './employeeDirectoryModel';

afterEach(cleanup);

const rows: DirectoryEmployee[] = [
  {
    employeeId: 'maya',
    employeeCode: 'AST-101',
    fullName: 'Maya Shah',
    status: 'Active',
    employmentType: 'Full-time',
    departmentName: 'Engineering',
    designationTitle: 'Frontend Engineer',
    reportingManagerName: 'Arjun Rao',
    dateOfJoining: '2024-01-12',
  },
  {
    employeeId: 'arjun',
    employeeCode: 'AST-102',
    fullName: 'Arjun Rao',
    status: 'Active',
    employmentType: 'Full-time',
    departmentName: 'Engineering',
    designationTitle: 'Team Lead',
    reportingManagerName: 'Priya Mehta',
    dateOfJoining: '2023-03-10',
  },
];

it('selects work details and keeps the profile link tied to the selected employee', () => {
  render(
    <MemoryRouter>
      <EmployeeDirectoryBrowser rows={rows} />
    </MemoryRouter>
  );
  expect(screen.getByRole('region', { name: 'Work details for Maya Shah' })).toBeTruthy();
  fireEvent.click(
    screen.getByRole('button', { name: 'Show work details for Arjun Rao (AST-102)' })
  );
  expect(screen.queryByRole('region', { name: 'Work details for Maya Shah' })).toBeNull();
  expect(screen.getByRole('region', { name: 'Work details for Arjun Rao' })).toBeTruthy();
  expect(
    screen.getByRole('link', { name: 'Open profile for Arjun Rao' }).getAttribute('href')
  ).toBe('/organization/employees/arjun');
});

it('supports arrow and boundary keyboard navigation without automatic selection', () => {
  render(
    <MemoryRouter>
      <EmployeeDirectoryBrowser rows={rows} />
    </MemoryRouter>
  );
  const first = screen.getByRole('button', { name: 'Show work details for Maya Shah (AST-101)' });
  const last = screen.getByRole('button', { name: 'Show work details for Arjun Rao (AST-102)' });
  first.focus();
  fireEvent.keyDown(first, { key: 'ArrowRight' });
  expect(document.activeElement).toBe(last);
  expect(screen.getByRole('region', { name: 'Work details for Maya Shah' })).toBeTruthy();
  fireEvent.keyDown(last, { key: 'Home' });
  expect(document.activeElement).toBe(first);
  fireEvent.keyDown(first, { key: 'End' });
  expect(document.activeElement).toBe(last);
});

it('falls back to an available employee when filtering removes the selected card', () => {
  const { rerender } = render(
    <MemoryRouter>
      <EmployeeDirectoryBrowser rows={rows} />
    </MemoryRouter>
  );
  fireEvent.click(
    screen.getByRole('button', { name: 'Show work details for Arjun Rao (AST-102)' })
  );
  rerender(
    <MemoryRouter>
      <EmployeeDirectoryBrowser rows={rows.slice(0, 1)} />
    </MemoryRouter>
  );
  expect(screen.getByRole('region', { name: 'Work details for Maya Shah' })).toBeTruthy();
  expect(screen.queryByRole('link', { name: 'Open profile for Arjun Rao' })).toBeNull();
});
