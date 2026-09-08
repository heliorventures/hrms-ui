// @vitest-environment jsdom

import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import PrejoiningAdminPage from './PrejoiningAdminPage';

const state = vi.hoisted(() => ({
  request: vi.fn<[unknown, Record<string, unknown>?], Promise<unknown>>(),
  tenantId: 'tenant-a',
  permissions: new Set<string>([
    'prejoining:manage',
    'prejoining:review',
    'employee:write',
    'role:manage',
  ]),
  scopes: {
    'prejoining:manage': 'ALL',
    'prejoining:review': 'ALL',
    'employee:write': 'ALL',
    'role:manage': 'ALL',
  } as Record<string, string>,
}));

vi.mock('../../../hooks/useGraphClient', () => ({ useGraphClient: () => state }));
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    clientSession: {
      employeeId: 'hr-1',
      permissions: state.permissions,
      permissionScopes: state.scopes,
      resourceScopes: {},
    },
  }),
}));
vi.mock('../../../contexts/TenantContext', () => ({
  useTenant: () => ({ currentTenant: { id: state.tenantId } }),
}));

const candidate = {
  id: 'candidate-1',
  email: 'alex@example.com',
  status: 'SUBMITTED',
  revision: 2,
  config: {
    expiryHours: 48,
    fields: [
      { key: 'firstName', label: 'First name', required: true },
      { key: 'lastName', label: 'Last name', required: true },
      { key: 'email', label: 'Email', required: true },
    ],
    documents: [{ id: 'req-1', documentTypeId: 'type-1', label: 'Identity proof', required: true }],
  },
  answers: { firstName: 'Alex', lastName: 'Morgan', email: 'alex@example.com' },
  feedback: null,
  documents: [
    {
      id: 'doc-1',
      requirementId: 'req-1',
      filename: 'identity.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1200,
    },
  ],
  expiresAt: '2026-09-10T00:00:00Z',
  employeeId: null,
  createdAt: '2026-09-08T00:00:00Z',
  updatedAt: '2026-09-08T01:00:00Z',
};

function installResponses() {
  state.request.mockImplementation((document: unknown) => {
    const source = String(document);
    if (source.includes('PrejoiningAdminBootstrap')) {
      return Promise.resolve({
        prejoiningConfig: candidate.config,
        prejoiningFieldCatalog: [
          ...candidate.config.fields,
          { key: 'dateOfBirth', label: 'Date of birth', required: false },
        ],
        prejoiningDocumentTypes: [{ id: 'type-1', name: 'Identity proof' }],
      });
    }
    if (source.includes('PrejoiningCandidatesAdmin')) {
      return Promise.resolve({ prejoiningCandidates: { nodes: [candidate], total: 1 } });
    }
    if (source.includes('PrejoiningCandidateAdmin')) {
      return Promise.resolve({ prejoiningCandidate: candidate });
    }
    if (source.includes('PrejoiningConversionDirectory')) {
      return Promise.resolve({
        prejoiningConversionOptions: {
          departments: [],
          designations: [],
          managers: [],
          hasMoreManagers: false,
          roles: [{ id: 'role-1', name: 'Employee' }],
        },
      });
    }
    if (source.includes('PrejoiningInviteAdmin')) {
      return Promise.resolve({
        invitePrejoining: {
          candidate: { ...candidate, status: 'DRAFT' },
          privateUrl: 'https://tenant.test/prejoining#token=secret',
          emailStatus: 'FAILED',
          emailError: 'Mail transport unavailable',
        },
      });
    }
    if (source.includes('PrejoiningRequestChangesAdmin')) {
      return Promise.resolve({
        requestPrejoiningChanges: {
          ...candidate,
          status: 'CHANGES_REQUESTED',
          revision: 3,
          feedback: 'Upload a clearer copy.',
        },
      });
    }
    if (source.includes('PrejoiningApproveAdmin')) {
      return Promise.resolve({
        approvePrejoining: { ...candidate, status: 'APPROVED', revision: 3 },
      });
    }
    if (source.includes('PrejoiningConfirmJoinedAdmin')) {
      return Promise.resolve({
        confirmPrejoiningJoined: {
          ...candidate,
          status: 'JOINED',
          revision: 4,
          employeeId: 'employee-9',
        },
      });
    }
    return Promise.resolve({});
  });
}

beforeEach(() => {
  state.tenantId = 'tenant-a';
  state.permissions = new Set([
    'prejoining:manage',
    'prejoining:review',
    'employee:write',
    'role:manage',
  ]);
  state.scopes = {
    'prejoining:manage': 'ALL',
    'prejoining:review': 'ALL',
    'employee:write': 'ALL',
    'role:manage': 'ALL',
  };
  state.request.mockReset();
  installResponses();
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
});

afterEach(cleanup);

describe('PrejoiningAdminPage', () => {
  it('does not request protected resources when no ALL-scoped permission exists', async () => {
    state.permissions = new Set(['prejoining:review']);
    state.scopes = { 'prejoining:review': 'TEAM' };
    render(<PrejoiningAdminPage />);
    expect(await screen.findByText(/do not have access/i)).toBeTruthy();
    expect(state.request).not.toHaveBeenCalled();
  });

  it('keeps configuration and review actions separated by permission', async () => {
    state.permissions = new Set(['prejoining:review']);
    state.scopes = { 'prejoining:review': 'ALL' };
    render(<PrejoiningAdminPage />);
    expect(await screen.findByRole('tab', { name: 'Candidates' })).toBeTruthy();
    expect(screen.queryByRole('tab', { name: 'Config' })).toBeNull();
    await userEvent
      .setup()
      .click(await screen.findByRole('button', { name: /review alex@example.com/i }));
    expect(await screen.findByRole('button', { name: 'Approve information' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /reissue/i })).toBeNull();
  });

  it('reports email failure while preserving the private link for copy', async () => {
    render(<PrejoiningAdminPage />);
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText');
    await user.click(await screen.findByRole('button', { name: 'Create invitation' }));
    await user.type(screen.getByLabelText('Candidate email'), 'alex@example.com');
    await user.click(screen.getByRole('button', { name: 'Send email and create link' }));
    expect(await screen.findByText('Mail transport unavailable')).toBeTruthy();
    const link = screen.getByLabelText('Private invitation link');
    expect(link.getAttribute('value')).toContain('#token=secret');
    await user.click(screen.getByRole('button', { name: 'Copy link' }));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('#token=secret'));
  });

  it('saves an optional personal field as required when HR selects that setting', async () => {
    state.request.mockImplementation((document: unknown, variables?: Record<string, unknown>) => {
      const source = String(document);
      if (source.includes('PrejoiningAdminBootstrap'))
        return Promise.resolve({
          prejoiningConfig: candidate.config,
          prejoiningFieldCatalog: [
            ...candidate.config.fields,
            { key: 'dateOfBirth', label: 'Date of birth', required: false },
          ],
          prejoiningDocumentTypes: [],
        });
      if (source.includes('SavePrejoiningConfigAdmin'))
        return Promise.resolve({ savePrejoiningConfig: variables?.config });
      if (source.includes('PrejoiningCandidatesAdmin'))
        return Promise.resolve({ prejoiningCandidates: { nodes: [], total: 0 } });
      return Promise.resolve({});
    });
    const user = userEvent.setup();
    render(<PrejoiningAdminPage />);
    await user.click(await screen.findByRole('checkbox', { name: 'Date of birth' }));
    await user.click(screen.getByRole('checkbox', { name: 'Require Date of birth' }));
    await user.click(screen.getByRole('button', { name: 'Save configuration' }));
    await waitFor(() => {
      const save = state.request.mock.calls.find(([document]) =>
        String(document).includes('SavePrejoiningConfigAdmin')
      );
      const savedConfig = save?.[1]?.config;
      if (!savedConfig || typeof savedConfig !== 'object' || !('fields' in savedConfig)) {
        throw new Error('Saved configuration has no fields');
      }
      const { fields } = savedConfig as { fields: unknown };
      if (!Array.isArray(fields)) throw new Error('Saved fields are not an array');
      const typedFields: unknown[] = fields;
      expect(
        typedFields.find(
          (field) =>
            typeof field === 'object' &&
            field !== null &&
            'key' in field &&
            field.key === 'dateOfBirth'
        )
      ).toMatchObject({
        key: 'dateOfBirth',
        required: true,
      });
    });
  });
});

describe('PrejoiningAdminPage loading ownership', () => {
  it('keeps configuration controls disabled while configuration is still loading', async () => {
    let resolveConfig: ((value: unknown) => void) | undefined;
    state.request.mockImplementation((document: unknown) => {
      const source = String(document);
      if (source.includes('PrejoiningAdminBootstrap'))
        return new Promise((resolve) => {
          resolveConfig = resolve;
        });
      if (source.includes('PrejoiningCandidatesAdmin'))
        return Promise.resolve({ prejoiningCandidates: { nodes: [], total: 0 } });
      return Promise.resolve({});
    });
    render(<PrejoiningAdminPage />);
    const expiry = await screen.findByLabelText('Invitation expiry (hours)');
    expect(expiry.matches(':disabled')).toBe(true);
    resolveConfig?.({
      prejoiningConfig: candidate.config,
      prejoiningFieldCatalog: candidate.config.fields,
      prejoiningDocumentTypes: [],
    });
    await waitFor(() => expect(expiry.matches(':disabled')).toBe(false));
  });

  it('loads configuration when React StrictMode replays the bootstrap effect', async () => {
    render(
      <StrictMode>
        <PrejoiningAdminPage />
      </StrictMode>
    );
    expect(await screen.findByDisplayValue('48')).toBeTruthy();
    expect(
      state.request.mock.calls.some(([document]) =>
        String(document).includes('PrejoiningAdminBootstrap')
      )
    ).toBe(true);
  });

  it('uses the visible revision for a correction request and blocks duplicate submission', async () => {
    render(<PrejoiningAdminPage />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('tab', { name: 'Candidates' }));
    await user.click(await screen.findByRole('button', { name: /review alex@example.com/i }));
    await user.click(await screen.findByRole('button', { name: 'Request corrections' }));
    await user.type(screen.getByLabelText('Correction instructions'), 'Upload a clearer copy.');
    const submit = screen.getByRole('button', { name: 'Send correction request' });
    await Promise.all([user.click(submit), user.click(submit)]);
    await waitFor(() => {
      const calls = state.request.mock.calls.filter(([document]) =>
        String(document).includes('PrejoiningRequestChangesAdmin')
      );
      expect(calls).toHaveLength(1);
      expect(calls[0]?.[1]).toEqual({
        id: 'candidate-1',
        revision: 2,
        feedback: 'Upload a clearer copy.',
      });
    });
  });
});

describe('PrejoiningAdminPage ownership and conversion', () => {
  it('requires separate approval before showing conversion and validates employee login fields', async () => {
    render(<PrejoiningAdminPage />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('tab', { name: 'Candidates' }));
    await user.click(await screen.findByRole('button', { name: /review alex@example.com/i }));
    expect(screen.queryByRole('button', { name: 'Confirm joined' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Approve information' }));
    await user.click(await screen.findByRole('button', { name: 'Confirm joined' }));
    const dialog = await screen.findByRole('dialog', { name: 'Confirm joined' });
    await user.click(within(dialog).getByRole('button', { name: 'Create employee and login' }));
    expect(await within(dialog).findByText(/employee code is required/i)).toBeTruthy();
    expect(
      state.request.mock.calls.some(([document]) =>
        String(document).includes('PrejoiningConfirmJoinedAdmin')
      )
    ).toBe(false);
  });

  it('ignores a completed request after the tenant owner changes', async () => {
    let resolveList: ((value: unknown) => void) | undefined;
    state.request.mockImplementation((document: unknown) => {
      if (String(document).includes('PrejoiningCandidatesAdmin'))
        return new Promise((resolve) => {
          resolveList = resolve;
        });
      if (String(document).includes('PrejoiningAdminBootstrap'))
        return Promise.resolve({
          prejoiningConfig: candidate.config,
          prejoiningFieldCatalog: candidate.config.fields,
          prejoiningDocumentTypes: [],
        });
      return Promise.resolve({});
    });
    const view = render(<PrejoiningAdminPage />);
    state.tenantId = 'tenant-b';
    view.rerender(<PrejoiningAdminPage />);
    resolveList?.({ prejoiningCandidates: { nodes: [candidate], total: 1 } });
    await Promise.resolve();
    expect(screen.queryByText('alex@example.com')).toBeNull();
  });

  it('clears conversion credentials before opening another candidate', async () => {
    const approved = { ...candidate, status: 'APPROVED' as const };
    const second = { ...approved, id: 'candidate-2', email: 'sam@example.com', revision: 5 };
    let detailCount = 0;
    state.request.mockImplementation((document: unknown) => {
      const source = String(document);
      if (source.includes('PrejoiningCandidatesAdmin'))
        return Promise.resolve({ prejoiningCandidates: { nodes: [approved, second], total: 2 } });
      if (source.includes('PrejoiningCandidateAdmin')) {
        detailCount += 1;
        return Promise.resolve({ prejoiningCandidate: detailCount === 1 ? approved : second });
      }
      if (source.includes('PrejoiningConversionDirectory'))
        return Promise.resolve({
          prejoiningConversionOptions: {
            departments: [],
            designations: [],
            managers: [],
            roles: [{ id: 'role-1', name: 'Employee' }],
            hasMoreManagers: false,
          },
        });
      if (source.includes('PrejoiningAdminBootstrap'))
        return Promise.resolve({
          prejoiningConfig: candidate.config,
          prejoiningFieldCatalog: candidate.config.fields,
          prejoiningDocumentTypes: [],
        });
      return Promise.resolve({});
    });
    const user = userEvent.setup();
    render(<PrejoiningAdminPage />);
    await user.click(await screen.findByRole('tab', { name: 'Candidates' }));
    await user.click(await screen.findByRole('button', { name: /review alex@example.com/i }));
    await user.click(await screen.findByRole('button', { name: 'Confirm joined' }));
    await user.type(await screen.findByLabelText('Employee code'), 'EMP-001');
    await user.type(screen.getByLabelText('Initial password'), 'Secret123');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.click(screen.getByLabelText('Close modal'));
    await user.click(screen.getByRole('button', { name: /review sam@example.com/i }));
    await user.click(await screen.findByRole('button', { name: 'Confirm joined' }));
    const employeeCode = await screen.findByLabelText('Employee code');
    const initialPassword = screen.getByLabelText('Initial password');
    const username = screen.getByLabelText('Username');
    if (!(employeeCode instanceof HTMLInputElement))
      throw new Error('Employee code is not an input');
    if (!(initialPassword instanceof HTMLInputElement)) throw new Error('Password is not an input');
    if (!(username instanceof HTMLInputElement)) throw new Error('Username is not an input');
    expect(employeeCode.value).toBe('');
    expect(initialPassword.value).toBe('');
    expect(username.value).toBe('sam@example.com');
  });
});
