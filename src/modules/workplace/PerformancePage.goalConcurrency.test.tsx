// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import PerformancePage from './PerformancePage';

const state = vi.hoisted(() => ({
  request: vi.fn(),
  permissions: new Set(['performance:evaluate']),
  permissionScopes: { 'performance:evaluate': 'TEAM' } as Record<string, string>,
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

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
};

const review = (id: string) => ({
  id,
  reviewCycleId: 'cycle-1',
  employeeId: 'report',
  employeeName: id === 'review-a' ? 'Review A' : 'Review B',
  managerEmployeeId: 'me',
  appraisalTemplateId: 'template-1',
  cycleName: 'Annual',
  cycleStartDate: '2026-01-01',
  cycleEndDate: '2026-12-31',
  cycleStage: 'GOAL_SETTING',
  status: 'PENDING',
});

const detail = (id: string) => ({
  review: review(id),
  goals: [],
  feedback: [],
  answers: [],
  template: { sections: [] },
});

const openEvaluation = (employeeName: string) => {
  const rowLabel = screen.getByText(
    (content, element) => element?.tagName === 'P' && content.includes(employeeName)
  );
  const row = rowLabel.closest('li');
  if (!row) throw new Error(`Review row was not found for ${employeeName}.`);
  fireEvent.click(within(row).getByRole('button', { name: 'Open evaluation' }));
};

const installReviewRequests = () => {
  state.request.mockImplementation((document: unknown, variables?: { participantId?: string }) => {
    const source = String(document);
    if (source.includes('TeamPerformanceReviewsWorkspace')) {
      return Promise.resolve({
        myTeamPerformanceReviews: [review('review-a'), review('review-b')],
      });
    }
    if (source.includes('PerformanceReviewDetailWorkspace')) {
      return Promise.resolve({
        performanceReviewDetail: detail(variables?.participantId ?? 'review-a'),
      });
    }
    return Promise.resolve({});
  });
};

beforeEach(() => {
  state.permissions = new Set(['performance:evaluate']);
  state.permissionScopes = { 'performance:evaluate': 'TEAM' };
  state.request.mockReset();
  installReviewRequests();
});
afterEach(cleanup);

it('retains an active B draft when an older A save completes', async () => {
  const save = deferred<unknown>();
  state.request.mockImplementation((document: unknown, variables?: { participantId?: string }) => {
    const source = String(document);
    if (source.includes('TeamPerformanceReviewsWorkspace')) {
      return Promise.resolve({
        myTeamPerformanceReviews: [review('review-a'), review('review-b')],
      });
    }
    if (source.includes('PerformanceReviewDetailWorkspace')) {
      return Promise.resolve({
        performanceReviewDetail: detail(variables?.participantId ?? 'review-a'),
      });
    }
    if (source.includes('ProposePerformanceGoalWorkspace')) return save.promise;
    return Promise.resolve({});
  });
  render(
    <MemoryRouter initialEntries={['/performance?tab=team&review=review-a']}>
      <PerformancePage />
    </MemoryRouter>
  );

  fireEvent.change(await screen.findByLabelText('Goal title'), {
    target: { value: 'Pending A goal' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Add goal' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Add goal' }).getAttribute('aria-busy')).toBe('true')
  );

  openEvaluation('Review B');
  const bTitle = await screen.findByLabelText<HTMLInputElement>('Goal title');
  fireEvent.change(bTitle, { target: { value: 'Draft for B' } });
  save.resolve({});

  await waitFor(() => {
    expect(screen.getByLabelText<HTMLInputElement>('Goal title').value).toBe('Draft for B');
  });
  expect(screen.queryByText('Goal proposed.')).toBeNull();
});

it('keeps a new A editor state clean after an A to B to A switch and stale save completion', async () => {
  const save = deferred<unknown>();
  state.request.mockImplementation((document: unknown, variables?: { participantId?: string }) => {
    const source = String(document);
    if (source.includes('TeamPerformanceReviewsWorkspace')) {
      return Promise.resolve({
        myTeamPerformanceReviews: [review('review-a'), review('review-b')],
      });
    }
    if (source.includes('PerformanceReviewDetailWorkspace')) {
      return Promise.resolve({
        performanceReviewDetail: detail(variables?.participantId ?? 'review-a'),
      });
    }
    if (source.includes('ProposePerformanceGoalWorkspace')) return save.promise;
    return Promise.resolve({});
  });
  render(
    <MemoryRouter initialEntries={['/performance?tab=team&review=review-a']}>
      <PerformancePage />
    </MemoryRouter>
  );

  fireEvent.change(await screen.findByLabelText('Goal title'), {
    target: { value: 'Pending A goal' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Add goal' }));
  openEvaluation('Review B');
  await screen.findByLabelText('Goal title');
  openEvaluation('Review A');

  const currentATitle = await screen.findByLabelText<HTMLInputElement>('Goal title');
  expect(currentATitle.value).toBe('');
  fireEvent.change(currentATitle, { target: { value: 'New A draft' } });
  save.resolve({});

  await waitFor(() => expect(currentATitle.value).toBe('New A draft'));
  expect(screen.queryByText('Goal proposed.')).toBeNull();
});

it('blocks approval while a save for the same participant is pending', async () => {
  const save = deferred<unknown>();
  state.request.mockImplementation((document: unknown, variables?: { participantId?: string }) => {
    const source = String(document);
    if (source.includes('TeamPerformanceReviewsWorkspace')) {
      return Promise.resolve({ myTeamPerformanceReviews: [review('review-a')] });
    }
    if (source.includes('PerformanceReviewDetailWorkspace')) {
      return Promise.resolve({
        performanceReviewDetail: detail(variables?.participantId ?? 'review-a'),
      });
    }
    if (source.includes('ProposePerformanceGoalWorkspace')) return save.promise;
    if (source.includes('ApprovePerformanceGoalsWorkspace')) return Promise.resolve({});
    return Promise.resolve({});
  });
  render(
    <MemoryRouter initialEntries={['/performance?tab=team&review=review-a']}>
      <PerformancePage />
    </MemoryRouter>
  );

  fireEvent.change(await screen.findByLabelText('Goal title'), {
    target: { value: 'Pending goal' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Add goal' }));
  const approve = await screen.findByRole<HTMLButtonElement>('button', { name: 'Approve goals' });
  await waitFor(() => expect(approve.disabled).toBe(true));
  fireEvent.click(approve);

  expect(
    state.request.mock.calls.some(([document]) =>
      String(document).includes('ApprovePerformanceGoalsWorkspace')
    )
  ).toBe(false);
  save.resolve({});
});
