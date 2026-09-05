// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BenefitsPage from './BenefitsPage';
const state = vi.hoisted(() => ({
  scope: 'ALL',
  employeeId: undefined as string | undefined,
  request: vi.fn(),
  can: vi.fn((permission: string) => permission === 'benefits:manage'),
}));
vi.mock('../../hooks/useGraphClient', () => {
  const client = { request: state.request };
  return { useGraphClient: () => client };
});
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    can: state.can,
    clientSession: {
      permissionScopes: { 'benefits:manage': state.scope },
      employeeId: state.employeeId,
    },
  }),
}));
afterEach(() => {
  cleanup();
  state.request.mockReset();
  state.employeeId = undefined;
});
describe('benefits setup access', () => {
  it('loads catalog without employee enrollment lookup for a setup administrator', async () => {
    state.scope = 'ALL';
    state.request.mockResolvedValue({ benefitTypes: [], benefitPlans: [] });
    render(<BenefitsPage />);
    await waitFor(() => expect(state.request).toHaveBeenCalledTimes(1));
    expect(screen.queryByText('My Enrollments')).toBeNull();
    expect(screen.getByRole('button', { name: 'Create benefit type' })).toBeTruthy();
  });
  it('hides setup controls without ALL scope', async () => {
    state.scope = 'TEAM';
    state.request.mockResolvedValue({ benefitTypes: [], benefitPlans: [] });
    render(<BenefitsPage />);
    await waitFor(() => expect(state.request).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('button', { name: 'Create benefit type' })).toBeNull();
  });
  it('requests the next catalog page and keeps every type available to plan creation', async () => {
    state.scope = 'ALL';
    const types = Array.from({ length: 101 }, (_, i) => ({
      id: `type-${i}`,
      name: `Type ${i}`,
      code: `CODE${i}`,
    }));
    state.request.mockImplementation(
      (_query: string, variables: { typeOffset?: number; offset?: number }) => {
        if (variables.offset !== undefined)
          return Promise.resolve({
            benefitTypes: types.slice(variables.offset, variables.offset + 100),
          });
        return Promise.resolve({
          benefitTypes: types.slice(variables.typeOffset ?? 0, (variables.typeOffset ?? 0) + 21),
          benefitPlans: [],
        });
      }
    );
    render(<BenefitsPage />);
    await screen.findByText('Type 0');
    fireEvent.click(screen.getByRole('button', { name: 'Next benefit types' }));
    await screen.findByText('Type 20');
    expect(state.request).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ typeOffset: 20 })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Create benefit plan' }));
    expect(await screen.findByRole('option', { name: 'Type 100' })).toBeTruthy();
    expect(state.request).toHaveBeenCalledWith(expect.anything(), { offset: 100 });
  });
  it('shows enrollment plan names even when the plan is outside the current page', async () => {
    state.scope = 'ALL';
    state.employeeId = 'employee-1';
    state.request.mockImplementation((query: string) =>
      Promise.resolve(
        query.includes('BenefitsSetupEnrollments')
          ? {
              myBenefitEnrollments: [
                {
                  id: 'enrollment-1',
                  benefitPlanId: 'plan-outside-page',
                  benefitPlanName: 'Family medical coverage',
                  status: 'ENROLLED',
                  effectiveFrom: '2026-09-01',
                },
              ],
            }
          : { benefitTypes: [], benefitPlans: [] }
      )
    );
    render(<BenefitsPage />);
    expect(await screen.findByText('Family medical coverage')).toBeTruthy();
    expect(screen.queryByText(/plan-outside-page/)).toBeNull();
  });
});
