// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AdminWorkflowsDataDocument,
  AdminWorkflowsStepsDataDocument,
} from '../../api/graphql/graphql';

import AdminWorkflowsPage from './AdminWorkflowsPage';

const state = vi.hoisted(() => ({
  tenant: { id: 'tenant-a' },
  session: {
    employeeId: 'viewer',
    permissions: new Set(['workflow:manage']),
    permissionScopes: { 'workflow:manage': 'ALL' },
    resourceScopes: {},
    jwtRoles: [],
    persona: 'HR',
    mustChangePassword: false,
  },
  client: { request: vi.fn() },
}));
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ clientSession: state.session }),
}));
vi.mock('../../contexts/TenantContext', () => ({
  useTenant: () => ({ currentTenant: state.tenant }),
}));
vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => state.client }));
vi.mock('./WorkflowDesignerSteps', () => ({
  default: ({
    workflowId,
    steps,
    onDeleteStep,
    onReorder,
  }: {
    workflowId: string;
    steps: { id: string }[];
    onDeleteStep: (id: string) => void;
    onReorder: (id: string, ids: string[]) => void;
  }) => (
    <div>
      <span>{steps.map((step) => step.id).join(',')}</span>
      <button onClick={() => onDeleteStep('leave-step')}>Foreign delete</button>
      <button onClick={() => onReorder('leave', ['leave-step'])}>Foreign reorder</button>
      <button onClick={() => onReorder(workflowId, ['leave-step'])}>Foreign step reorder</button>
    </div>
  ),
}));

const workflows = [
  { id: 'leave', name: 'Leave definition', entityType: 'LEAVE_REQUEST', isActive: true },
  { id: 'expense', name: 'Expense definition', entityType: 'EXPENSE', isActive: true },
  { id: 'travel', name: 'Travel definition', entityType: 'TRAVEL_REQUEST', isActive: true },
  { id: 'time', name: 'Timesheet definition', entityType: 'TIMESHEET_WEEK_BATCH', isActive: true },
];
beforeEach(() => {
  state.tenant = { id: 'tenant-a' };
  state.session.employeeId = 'viewer';
  state.client.request.mockReset().mockImplementation((document: unknown) => {
    if (document === AdminWorkflowsDataDocument)
      return Promise.resolve({
        workflows,
        workflowInstances: workflows.map((w) => ({
          id: `${w.id}-request`,
          workflowId: w.id,
          entityType: w.entityType,
          entityId: w.id,
          status: `${w.id}-pending`,
        })),
      });
    if (document === AdminWorkflowsStepsDataDocument)
      return Promise.resolve({
        workflowsWithSteps: workflows.map((workflow) => ({
          workflow,
          steps: [
            { id: `${workflow.id}-step`, sequenceOrder: 1, stepName: 'Approve', canSkip: false },
          ],
        })),
      });
    throw new Error('Unexpected mutation');
  });
});
afterEach(cleanup);
function setup(path: string) {
  const router = createMemoryRouter(
    [{ path: '/workplace/workflows', element: <AdminWorkflowsPage /> }],
    { initialEntries: [path] }
  );
  const view = render(<RouterProvider router={router} />);
  return { router, ...view };
}
describe('workflow domain workspace', () => {
  it('defaults the compatibility URL to Leave', async () => {
    setup('/workplace/workflows');
    await screen.findByText('leave-pending');
    expect(
      within(screen.getByLabelText('Approval for'))
        .getAllByRole('option')
        .map((o) => o.textContent)
    ).toEqual(['Leave']);
    expect(screen.queryByText('expense-pending')).toBeNull();
  });
  it('filters choices, definitions, steps and requests to expenses and travel', async () => {
    setup('/workplace/workflows?domain=expenses');
    await screen.findByText('expense-pending');
    expect(
      within(screen.getByLabelText('Approval for'))
        .getAllByRole('option')
        .map((o) => o.textContent)
    ).toEqual(['Expenses', 'Travel']);
    expect(screen.getByText('travel-pending')).toBeTruthy();
    expect(screen.queryByText('leave-pending')).toBeNull();
    expect(screen.queryByText('time-pending')).toBeNull();
    expect(screen.queryByText('leave-step')).toBeNull();
    expect(screen.queryByText('Leave definition')).toBeNull();
    for (const label of ['Foreign delete', 'Foreign reorder', 'Foreign step reorder'])
      fireEvent.click(screen.getAllByText(label)[0]);
    expect(state.client.request).toHaveBeenCalledTimes(2);
  });
  it('resets drafts and visible data when switching domains and going back', async () => {
    const { router } = setup('/workplace/workflows?domain=leave');
    await screen.findByText('leave-pending');
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Unsaved leave draft' } });
    await act(async () => {
      await router.navigate('/workplace/workflows?domain=timesheets');
    });
    await screen.findByText('time-pending');
    expect(screen.getByLabelText<HTMLInputElement>('Name').value).toBe('Timesheets Approval');
    expect(screen.queryByText('leave-pending')).toBeNull();
    await act(async () => {
      await router.navigate(-1);
    });
    await screen.findByText('leave-pending');
    expect(screen.getByLabelText<HTMLInputElement>('Name').value).toBe('Leave Approval');
    expect(screen.queryByText('time-pending')).toBeNull();
  });
  it.each(['bogus', '', 'leave&domain=expenses'])(
    'makes no request for invalid domain %s',
    (domain) => {
      setup(`/workplace/workflows?domain=${domain}`);
      expect(screen.getByRole('alert').textContent).toContain('Invalid approval rules view');
      expect(state.client.request).not.toHaveBeenCalled();
    }
  );
  it('resets editor state when the authorization identity changes', async () => {
    const { rerender } = setup('/workplace/workflows?domain=leave');
    await screen.findByText('leave-pending');
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Private draft' } });
    state.session.employeeId = 'other-viewer';
    // A context update rerenders the page even when the GraphQL client stays stable.
    const router = createMemoryRouter([{ path: '*', element: <AdminWorkflowsPage /> }], {
      initialEntries: ['/workplace/workflows?domain=leave'],
    });
    rerender(<RouterProvider router={router} />);
    await screen.findByText('leave-pending');
    expect(screen.getByLabelText<HTMLInputElement>('Name').value).toBe('Leave Approval');
  });
});
