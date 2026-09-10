// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import SurveysPage from './SurveysPage';

const state = vi.hoisted(() => ({
  request: vi.fn<[unknown, unknown?], Promise<unknown>>(),
  permissions: new Set(['survey:manage']),
  scopes: { 'survey:manage': 'ALL' },
}));
vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => state }));
vi.mock('../../contexts/TenantContext', () => ({
  useTenant: () => ({ currentTenant: { id: 'tenant-1', timezone: 'UTC' } }),
}));
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    clientSession: {
      employeeId: 'employee-1',
      permissions: state.permissions,
      permissionScopes: state.scopes,
      resourceScopes: {},
    },
  }),
}));

const summary = {
  id: 'previous',
  title: 'Previous pulse',
  status: 'CLOSED',
  completed: false,
  minimumReportGroupSize: 5,
  assignedCount: 12,
  completedCount: 7,
  pendingCount: 5,
};
const detail = (title = summary.title) => ({
  summary: { ...summary, title },
  audienceDepartmentIds: [],
  sections: [
    {
      id: 'old-section',
      title: 'Engagement',
      displayOrder: 0,
      questions: [
        {
          id: 'old-question',
          dimension: 'Support',
          prompt: 'Useful support',
          description: 'Consider this month',
          commentEnabled: true,
          questionType: 'RATING',
          isRequired: true,
          ratingMin: '1',
          ratingMax: '5',
          displayOrder: 0,
          options: [],
        },
      ],
    },
  ],
});
const deferred = () => {
  let resolve!: (value: unknown) => void;
  const promise = new Promise<unknown>((complete) => {
    resolve = complete;
  });
  return { promise, resolve };
};
beforeEach(() => {
  state.request.mockReset();
  state.request.mockImplementation((document) => {
    const source = String(document);
    if (source.includes('SurveysAdminWorkspace')) return Promise.resolve({ surveys: [summary] });
    if (source.includes('SurveyDetailWorkspace')) return Promise.resolve({ survey: detail() });
    if (source.includes('SurveyAudienceWorkspace'))
      return Promise.resolve({
        surveyAudience: {
          audienceKind: 'ALL',
          departmentIds: [],
          locationIds: [],
          employeeIds: [],
        },
      });
    if (source.includes('SurveyManagementEventsWorkspace'))
      return Promise.resolve({ surveyManagementEvents: [] });
    if (source.includes('SaveSurveyWorkspace'))
      return Promise.resolve({ saveSurvey: { summary: { id: 'new' } } });
    return Promise.resolve({});
  });
});
afterEach(cleanup);

describe('survey list and navigation workflows', () => {
  it('shows assigned, completed and pending counts in the created survey list', async () => {
    render(<SurveysPage />);
    await screen.findByText('Previous pulse');
    for (const [label, count] of [
      ['Assigned', '12'],
      ['Completed', '7'],
      ['Pending', '5'],
    ]) {
      const term = screen.getByText(label, { selector: 'dt' });
      expect(term.nextElementSibling?.textContent).toBe(count);
    }
    expect(screen.queryByLabelText('Title')).toBeNull();
  });

  it('keeps the list under the history modal and ignores old history after close and reopen', async () => {
    const old = deferred();
    const current = deferred();
    const fallback = state.request.getMockImplementation();
    if (!fallback) throw new Error('Missing request mock');
    let historyRequests = 0;
    state.request.mockImplementation((document, variables) => {
      if (String(document).includes('SurveyManagementEventsWorkspace')) {
        historyRequests += 1;
        return historyRequests === 1 ? old.promise : current.promise;
      }
      return fallback(document, variables);
    });
    const user = userEvent.setup();
    render(<SurveysPage />);
    await user.click(await screen.findByRole('button', { name: 'History' }));
    const dialog = screen.getByRole('dialog', { name: 'Survey history' });
    expect(within(dialog).getByText(/Loading history/)).toBeTruthy();
    expect(screen.getByText('Previous pulse')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Back to surveys' })).toBeNull();
    await user.click(within(dialog).getByRole('button', { name: /close/i }));
    await user.click(screen.getByRole('button', { name: 'History' }));
    await waitFor(() => expect(historyRequests).toBe(2));
    await act(async () => {
      current.resolve({ surveyManagementEvents: [] });
      await current.promise;
    });
    expect(await screen.findByText('No management events recorded.')).toBeTruthy();
    await act(async () => {
      old.resolve({
        surveyManagementEvents: [
          { action: 'OLD', occurredAt: '2030-01-01T00:00:00Z', message: 'Stale old history' },
        ],
      });
      await old.promise;
    });
    expect(screen.queryByText('Stale old history')).toBeNull();
    expect(screen.getByText('No management events recorded.')).toBeTruthy();
  });
});

describe('survey draft and detail navigation', () => {
  it('copies from Start from into an editable draft without questionnaire or response IDs', async () => {
    const user = userEvent.setup();
    render(<SurveysPage />);
    await screen.findByText('Previous pulse');
    await user.click(screen.getByRole('button', { name: 'Add survey' }));
    await user.selectOptions(screen.getByLabelText('Start from'), 'previous');
    const title = await screen.findByLabelText<HTMLInputElement>('Title');
    await waitFor(() => expect(title.value).toBe('Previous pulse (copy)'));
    await user.clear(title);
    await user.type(title, 'New pulse');
    await user.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() =>
      expect(
        state.request.mock.calls.some(([doc]) => String(doc).includes('SaveSurveyWorkspace'))
      ).toBe(true)
    );
    const save = state.request.mock.calls.find(([doc]) =>
      String(doc).includes('SaveSurveyWorkspace')
    );
    expect(save?.[1]).toMatchObject({
      input: { sourceSurveyId: 'previous', title: 'New pulse', opensAt: null, closesAt: null },
    });
    const variables = JSON.stringify(save?.[1]);
    expect(variables).not.toContain('old-question');
    expect(variables).not.toContain('old-section');
    expect(variables).not.toContain('responseId');
    expect(variables).not.toContain('submissionId');
    expect(
      state.request.mock.calls.some(([doc]) =>
        /SurveySubmissionsWorkspace|SurveyResultsWorkspace/.test(String(doc))
      )
    ).toBe(false);
  });

  it('reopens the same survey while an abandoned detail request is pending and ignores its late result', async () => {
    const old = deferred();
    const current = deferred();
    const fallback = state.request.getMockImplementation();
    if (!fallback) throw new Error('Missing request mock');
    let detailRequests = 0;
    state.request.mockImplementation((document, variables) => {
      if (String(document).includes('SurveyDetailWorkspace')) {
        detailRequests += 1;
        return detailRequests === 1 ? old.promise : current.promise;
      }
      return fallback(document, variables);
    });
    const user = userEvent.setup();
    render(<SurveysPage />);
    await user.click(await screen.findByRole('button', { name: 'View' }));
    await user.click(screen.getByRole('button', { name: 'Back to surveys' }));
    await user.click(screen.getByRole('button', { name: 'View' }));
    await waitFor(() => expect(detailRequests).toBe(2));
    await act(async () => {
      current.resolve({ survey: detail('Current reopened survey') });
      await current.promise;
    });
    expect(
      await screen.findByRole('heading', { name: 'Current reopened survey', level: 1 })
    ).toBeTruthy();
    await act(async () => {
      old.resolve({ survey: detail('Abandoned survey detail') });
      await old.promise;
    });
    expect(screen.queryByText('Abandoned survey detail')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Current reopened survey', level: 1 })).toBeTruthy();
  });
});
