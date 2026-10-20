// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import OrganizationSeparationDetails from './OrganizationSeparationDetails';
import OrganizationSeparationsAdmin from './OrganizationSeparationsAdmin';
import type { OrganizationScope } from './organizationTypes';

const fixture = vi.hoisted(() => ({ row: {} as Record<string, unknown> }));
vi.mock('./useOrganizationSourceList', () => ({
  useOrganizationSourceList: () => ({
    loading: false,
    error: null,
    refresh: vi.fn(),
    hasPrevious: false,
    previous: vi.fn(),
    next: vi.fn(),
    data: { record: { has_more: false }, rows: [fixture.row] },
  }),
}));
vi.mock('./useOrganizationQuery', () => ({
  useOrganizationQuery: () => ({
    loading: false,
    error: null,
    refresh: vi.fn(),
    data: { record: fixture.row, version: 4 },
  }),
}));
afterEach(cleanup);

it.each([
  { name: 'Source Employee', code: 'EMP-104', subject: 'Source Employee (EMP-104)' },
  { name: null, code: null, subject: 'Employee reference: selected-employee' },
])(
  'identifies exit list and detail subjects using source name/code or an explicit reference fallback: $subject',
  ({ name, code, subject }) => {
    fixture.row = {
      separation_id: 'selected-exit',
      employee_id: 'selected-employee',
      employee_name: name,
      employee_code: code,
      separation_type: 'RESIGNATION',
      last_working_date: '2026-11-30',
      status: 'PENDING',
      version: 4,
      clearance: [],
    };
    const company = {
      membershipId: 'target-company',
      version: 1,
      capabilities: ['onboarding:manage'],
    };
    const scope = {
      ownerKey: 'source-session',
      organization: { id: 'organization', version: 1 },
      company,
      companies: [company],
      commands: { commands: [], submit: vi.fn() },
    } as unknown as OrganizationScope;
    render(
      <>
        <OrganizationSeparationsAdmin scope={scope} />
        <OrganizationSeparationDetails scope={scope} selected={fixture.row} />
      </>
    );
    expect(
      within(screen.getByRole('table', { name: 'Source employee exit requests' })).getByText(
        subject
      )
    ).toBeDefined();
    expect(
      within(screen.getByRole('table', { name: 'Selected employee exit' })).getByText(subject)
    ).toBeDefined();
  }
);
