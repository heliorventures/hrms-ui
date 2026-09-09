// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import PerformancePage from './PerformancePage';

const state = vi.hoisted(() => ({
  request: vi.fn(),
  permissions: new Set(['performance:self', 'performance:manage']),
  permissionScopes: { 'performance:self': 'SELF', 'performance:manage': 'ALL' } as Record<
    string,
    string
  >,
}));
vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => state }));
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    clientSession: {
      employeeId: 'me',
      permissions: state.permissions,
      permissionScopes: state.permissionScopes,
      resourceScopes: {},
    },
  }),
}));
afterEach(cleanup);
beforeEach(() => {
  state.permissions = new Set(['performance:self', 'performance:manage']);
  state.permissionScopes = { 'performance:self': 'SELF', 'performance:manage': 'ALL' };
  state.request.mockImplementation((document: unknown) => {
    const source = String(document);
    if (source.includes('MyPerformanceReviewsWorkspace'))
      return Promise.resolve({ myPerformanceReviews: [] });
    if (source.includes('TeamPerformanceReviewsWorkspace'))
      return Promise.resolve({ myTeamPerformanceReviews: [] });
    if (source.includes('PerformanceProgramsWorkspace'))
      return Promise.resolve({
        performancePrograms: [{ id: 'p1', name: 'Annual', status: 'DRAFT' }],
      });
    if (source.includes('AppraisalTemplatesWorkspace'))
      return Promise.resolve({ appraisalTemplates: [] });
    return Promise.resolve({ reviewCycles: [], goals: [] });
  });
  state.request.mockClear();
});

it('separates personal work from setup and keeps loading on the clicked action', async () => {
  render(
    <MemoryRouter initialEntries={['/performance?tab=setup']}>
      <PerformancePage />
    </MemoryRouter>
  );
  expect(await screen.findByRole('tab', { name: 'My Performance' })).toBeTruthy();
  const activate = await screen.findByRole('button', { name: 'Activate process' });
  state.request.mockImplementationOnce(() => new Promise(() => {}));
  fireEvent.click(activate);
  await waitFor(() => expect(activate.getAttribute('aria-busy')).toBe('true'));
  expect(screen.getByRole('button', { name: 'Save template' }).getAttribute('aria-busy')).not.toBe(
    'true'
  );
  expect(screen.getByRole('button', { name: 'Save process' }).getAttribute('aria-busy')).not.toBe(
    'true'
  );
});

it('does not fetch administrative catalogs for a personal tab, including HR users', async () => {
  render(
    <MemoryRouter initialEntries={['/performance?tab=my']}>
      <PerformancePage />
    </MemoryRouter>
  );
  await screen.findByText('No assigned performance reviews.');
  expect(
    state.request.mock.calls.some(([document]) =>
      /PerformanceCatalog|PerformanceProgramsWorkspace|TeamPerformanceReviewsWorkspace/.test(
        String(document)
      )
    )
  ).toBe(false);
  expect(screen.queryByRole('button', { name: 'Save process' })).toBeNull();
});

it('does not expose administrator tabs to employees even with a setup URL', async () => {
  state.permissions = new Set(['performance:self']);
  state.permissionScopes = { 'performance:self': 'SELF' };
  render(
    <MemoryRouter initialEntries={['/performance?tab=setup']}>
      <PerformancePage />
    </MemoryRouter>
  );
  expect(await screen.findByRole('tab', { name: 'My Performance' })).toBeTruthy();
  expect(screen.queryByRole('tab', { name: 'Setup' })).toBeNull();
});

it('preserves the setup draft when switching workflow tabs', async () => {
  render(
    <MemoryRouter initialEntries={['/performance?tab=setup']}>
      <PerformancePage />
    </MemoryRouter>
  );
  fireEvent.change(await screen.findByLabelText('Process name'), {
    target: { value: 'Quarterly growth' },
  });
  fireEvent.click(screen.getByRole('tab', { name: 'Process' }));
  expect(screen.queryByLabelText('Process name')).toBeNull();
  fireEvent.click(screen.getByRole('tab', { name: 'Setup' }));
  expect(screen.getByLabelText('Process name')).toHaveProperty('value', 'Quarterly growth');
});

it('opens the linked submitted appraisal with saved answers and no resubmission control', async () => {
  state.permissions = new Set(['performance:self']);
  state.permissionScopes = { 'performance:self': 'SELF' };
  const review = {
    id: 'r1',
    employeeId: 'me',
    employeeName: 'Employee',
    cycleName: 'Annual',
    cycleStage: 'SELF_REVIEW',
    status: 'SELF_SUBMITTED',
    selfSubmittedAt: '2026-09-01',
  };
  state.request.mockImplementation((document: unknown) =>
    String(document).includes('PerformanceReviewDetailWorkspace')
      ? Promise.resolve({
          performanceReviewDetail: {
            review,
            goals: [],
            feedback: [],
            template: {
              sections: [
                {
                  questions: [
                    {
                      id: 'q1',
                      prompt: 'Achievements',
                      answerer: 'BOTH',
                      questionType: 'LONG_TEXT',
                      options: [],
                    },
                  ],
                },
              ],
            },
            answers: [
              {
                questionId: 'q1',
                employeeTextAnswer: 'Delivered the project',
                employeeSelectedOptionIds: [],
                managerSelectedOptionIds: [],
              },
            ],
          },
        })
      : Promise.resolve({ myPerformanceReviews: [review] })
  );
  render(
    <MemoryRouter initialEntries={['/performance?tab=my&review=r1']}>
      <PerformancePage />
    </MemoryRouter>
  );
  expect(await screen.findByText('Employee response: Delivered the project')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Submit self-appraisal' })).toBeNull();
  expect(state.request).toHaveBeenCalledWith(
    expect.stringContaining('PerformanceReviewDetailWorkspace'),
    { participantId: 'r1' }
  );
});
