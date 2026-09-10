// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import SurveysPage from './SurveysPage';

const state = vi.hoisted(() => ({
  request: vi.fn<[unknown, unknown?], Promise<unknown>>(),
  permissions: new Set<string>(['survey:respond']),
  scopes: { 'survey:respond': 'SELF' } as Record<string, string>,
  tenantId: 'tenant-1',
}));

vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => state }));
vi.mock('../../contexts/TenantContext', () => ({
  useTenant: () => ({ currentTenant: { id: state.tenantId, timezone: 'Asia/Kolkata' } }),
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

beforeEach(() => {
  state.tenantId = 'tenant-1';
  state.permissions = new Set(['survey:respond']);
  state.scopes = { 'survey:respond': 'SELF' };
  state.request.mockReset();
  state.request.mockImplementation((document: unknown) => {
    const source = String(document);
    if (source.includes('AvailableSurveysWorkspace')) {
      return Promise.resolve({
        availableSurveys: [
          {
            id: 'survey-1',
            title: 'Pulse',
            status: 'PUBLISHED',
            minimumReportGroupSize: 5,
            completed: false,
          },
        ],
      });
    }
    if (source.includes('SurveyDetailWorkspace')) {
      return Promise.resolve({
        survey: {
          summary: {
            id: 'survey-1',
            title: 'Pulse',
            status: 'PUBLISHED',
            minimumReportGroupSize: 5,
            completed: false,
          },
          audienceDepartmentIds: [],
          sections: [
            {
              id: 'section-1',
              title: 'Engagement',
              displayOrder: 0,
              questions: [
                {
                  id: 'question-1',
                  dimension: 'Leadership',
                  questionType: 'RATING',
                  prompt: 'I receive useful direction',
                  isRequired: true,
                  ratingMin: '1',
                  ratingMax: '5',
                  displayOrder: 0,
                  options: [],
                },
              ],
            },
          ],
        },
      });
    }
    if (source.includes('SubmitSurveyWorkspace')) return Promise.resolve({ submitSurvey: true });
    return Promise.resolve({});
  });
});

afterEach(cleanup);

describe('SurveysPage', () => {
  it('discards a pending detail request when the tenant context changes', async () => {
    let resolveDetail!: (result: unknown) => void;
    const fallback = state.request.getMockImplementation()!;
    state.request.mockImplementation((document: unknown, variables: unknown) => {
      if (String(document).includes('SurveyDetailWorkspace'))
        return new Promise((resolve) => {
          resolveDetail = resolve;
        });
      return fallback(document, variables);
    });
    const user = userEvent.setup();
    const view = render(<SurveysPage />);
    await user.click(await screen.findByRole('button', { name: 'Fill survey' }));
    state.tenantId = 'tenant-2';
    view.rerender(<SurveysPage />);
    const { act } = await import('@testing-library/react');
    await act(async () =>
      resolveDetail({
        survey: {
          summary: {
            id: 'old',
            title: 'Old tenant detail',
            status: 'PUBLISHED',
            minimumReportGroupSize: 5,
            completed: false,
          },
          audienceDepartmentIds: [],
          sections: [],
        },
      })
    );
    expect(screen.queryByText('Old tenant detail')).toBeNull();
  });
  it('opens an already published scheduled survey without republishing its audience', async () => {
    state.permissions = new Set(['survey:manage']);
    state.scopes = { 'survey:manage': 'ALL' };
    const summary = {
      id: 'scheduled',
      title: 'Later pulse',
      status: 'PUBLISHED',
      opensAt: '2099-01-01T00:00:00Z',
      closesAt: null,
      minimumReportGroupSize: 5,
      completed: false,
    };
    state.request.mockImplementation((document: unknown) => {
      const source = String(document);
      if (source.includes('SurveysAdminWorkspace')) return Promise.resolve({ surveys: [summary] });
      if (source.includes('OpenSurveyWorkspace')) {
        summary.opensAt = '2020-01-01T00:00:00Z';
        return Promise.resolve({ openSurvey: { summary } });
      }
      return Promise.resolve({});
    });
    const user = userEvent.setup();
    render(<SurveysPage />);
    await user.click(await screen.findByRole('button', { name: 'Open now' }));
    expect(
      state.request.mock.calls.some(([doc]) => String(doc).includes('OpenSurveyWorkspace'))
    ).toBe(false);
    await user.click(screen.getByRole('button', { name: 'Confirm open now' }));
    await waitFor(() =>
      expect(
        state.request.mock.calls.find(([doc]) => String(doc).includes('OpenSurveyWorkspace'))?.[1]
      ).toEqual({ id: 'scheduled' })
    );
    expect(
      state.request.mock.calls.some(([doc]) => String(doc).includes('PublishSurveyWorkspace'))
    ).toBe(false);
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Open now' })).toBeNull());
  });
  it('does not let a stale results request replace a newer survey view', async () => {
    state.permissions = new Set(['survey:manage', 'survey:results']);
    state.scopes = { 'survey:manage': 'ALL', 'survey:results': 'ALL' };
    let resolveResults!: (result: unknown) => void;
    const fallback = state.request.getMockImplementation()!;
    state.request.mockImplementation((document: unknown, variables: unknown) => {
      if (String(document).includes('SurveysAdminWorkspace'))
        return Promise.resolve({
          surveys: [
            {
              id: 'survey-1',
              title: 'Pulse',
              status: 'PUBLISHED',
              minimumReportGroupSize: 5,
              completed: false,
            },
          ],
        });
      if (String(document).includes('SurveyResultsWorkspace'))
        return new Promise((resolve) => {
          resolveResults = resolve;
        });
      return fallback(document, variables);
    });
    const user = userEvent.setup();
    render(<SurveysPage />);
    await user.click(await screen.findByRole('button', { name: 'Aggregate results' }));
    await user.click(screen.getByRole('button', { name: 'View' }));
    await screen.findByLabelText('I receive useful direction rating');
    const { act } = await import('@testing-library/react');
    await act(async () =>
      resolveResults({
        surveyResults: {
          surveyId: 'survey-1',
          suppressed: true,
          respondentCount: null,
          minimumReportGroupSize: 5,
          dimensions: [],
          questions: [],
        },
      })
    );
    expect(screen.getByLabelText('I receive useful direction rating')).toBeTruthy();
    expect(screen.queryByText('Aggregate survey results')).toBeNull();
  });
  it('selects a paginated explicit employee audience and sends only that target category', async () => {
    state.permissions = new Set(['survey:manage']);
    state.scopes = { 'survey:manage': 'ALL' };
    state.request.mockImplementation((document: unknown, variables: unknown) => {
      const source = String(document);
      if (source.includes('SurveysAdminWorkspace')) return Promise.resolve({ surveys: [] });
      if (source.includes('SurveyDepartmentsWorkspace'))
        return Promise.resolve({ departments: [] });
      if (source.includes('SurveyAudienceOptionsWorkspace'))
        return Promise.resolve({
          surveyAudienceOptions: (variables as { after?: string }).after
            ? { nodes: [{ id: 'e2', label: 'Second employee' }], nextCursor: null }
            : { nodes: [{ id: 'e1', label: 'First employee' }], nextCursor: 'e1' },
        });
      return Promise.resolve({ saveSurvey: { summary: { id: 'new' } } });
    });
    const user = userEvent.setup();
    render(<SurveysPage />);
    await user.type(screen.getByLabelText('Title'), 'Targeted');
    await user.type(screen.getByLabelText('Question'), 'Rate');
    await user.selectOptions(screen.getByLabelText('Audience type'), 'EMPLOYEE');
    await user.click(await screen.findByLabelText('First employee'));
    await user.click(screen.getByRole('button', { name: 'Load more audience options' }));
    await user.click(await screen.findByLabelText('Second employee'));
    await user.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() =>
      expect(
        state.request.mock.calls.find(([doc]) => String(doc).includes('SaveSurveyWorkspace'))?.[1]
      ).toMatchObject({
        input: {
          audienceDepartmentIds: [],
          audienceLocationIds: [],
          audienceEmployeeIds: ['e1', 'e2'],
        },
      })
    );
  });
  it('hydrates and updates a complete draft, preserves failed saves, and copies without its identity or schedule', async () => {
    state.permissions = new Set(['survey:manage']);
    state.scopes = { 'survey:manage': 'ALL' };
    const summary = {
      id: 'draft-1',
      title: 'Existing',
      description: 'Details',
      status: 'DRAFT',
      minimumReportGroupSize: 7,
      completed: false,
      opensAt: '2030-01-15T04:30:00.123Z',
      closesAt: '2030-01-16T04:30:00.123Z',
    };
    const section = (id: string, title: string) => ({
      id,
      title,
      displayOrder: 0,
      questions: [
        {
          id: `${id}-q`,
          dimension: 'Team',
          questionType: 'RATING',
          prompt: `${title} rating`,
          isRequired: false,
          ratingMin: '0',
          ratingMax: '10',
          displayOrder: 0,
          options: [],
        },
      ],
    });
    state.request.mockImplementation((document: unknown) => {
      const source = String(document);
      if (source.includes('SurveysAdminWorkspace')) return Promise.resolve({ surveys: [summary] });
      if (source.includes('SurveyDepartmentsWorkspace'))
        return Promise.resolve({ departments: [{ id: 'dept-1', name: 'Engineering' }] });
      if (source.includes('SurveyAudienceWorkspace'))
        return Promise.resolve({
          surveyAudience: {
            audienceKind: 'DEPARTMENT',
            departmentIds: ['dept-1'],
            locationIds: [],
            employeeIds: [],
            sourceSurveyId: null,
          },
        });
      if (source.includes('SurveyAudienceOptionsWorkspace'))
        return Promise.resolve({
          surveyAudienceOptions: {
            nodes: [{ id: 'dept-1', label: 'Engineering' }],
            nextCursor: null,
          },
        });
      if (source.includes('SurveyDetailWorkspace'))
        return Promise.resolve({
          survey: {
            summary,
            audienceDepartmentIds: ['dept-1'],
            sections: [section('s1', 'First'), section('s2', 'Second')],
          },
        });
      if (source.includes('SaveSurveyWorkspace'))
        return Promise.reject(new Error('Save unavailable'));
      return Promise.resolve({});
    });
    const user = userEvent.setup();
    render(<SurveysPage />);
    await user.click(await screen.findByRole('button', { name: 'Edit draft' }));
    expect(((await screen.findByLabelText('Title')) as HTMLInputElement).value).toBe('Existing');
    expect(
      screen.getAllByLabelText('Section title').map((e) => (e as HTMLInputElement).value)
    ).toEqual(['First', 'Second']);
    expect(((await screen.findByLabelText('Engineering')) as HTMLInputElement).checked).toBe(true);
    expect((screen.getAllByLabelText('Rating minimum')[0] as HTMLInputElement).value).toBe('0');
    await user.click(screen.getByRole('button', { name: 'Save draft' }));
    await screen.findByRole('alert');
    expect((screen.getByLabelText('Title') as HTMLInputElement).value).toBe('Existing');
    expect(
      state.request.mock.calls.find(([doc]) => String(doc).includes('SaveSurveyWorkspace'))?.[1]
    ).toMatchObject({
      input: {
        id: 'draft-1',
        opensAt: '2030-01-15T04:30:00.123Z',
        closesAt: '2030-01-16T04:30:00.123Z',
        minimumReportGroupSize: 7,
        audienceDepartmentIds: ['dept-1'],
        sections: [
          { title: 'First', questions: [{ ratingMin: '0', ratingMax: '10', isRequired: false }] },
          { title: 'Second' },
        ],
      },
    });
    await user.click(screen.getByRole('button', { name: 'Cancel editing' }));
    expect((screen.getByLabelText('Title') as HTMLInputElement).value).toBe('');
    summary.status = 'CLOSED';
    cleanup();
    render(<SurveysPage />);
    await user.click(await screen.findByRole('button', { name: 'Copy as new draft' }));
    await waitFor(() =>
      expect((screen.getByLabelText('Title') as HTMLInputElement).value).toContain('Existing')
    );
    await user.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() =>
      expect(
        state.request.mock.calls.filter(([doc]) => String(doc).includes('SaveSurveyWorkspace'))
      ).toHaveLength(2)
    );
    const copied = state.request.mock.calls.filter(([doc]) =>
      String(doc).includes('SaveSurveyWorkspace')
    )[1]?.[1] as { input: Record<string, unknown> };
    expect(copied.input.id).toBeUndefined();
    expect(copied.input.opensAt).toBeNull();
    expect(copied.input.closesAt).toBeNull();
    expect(copied.input.sourceSurveyId).toBe('draft-1');
  });

  it('adds and removes sections and validates tenant-timezone schedules before saving', async () => {
    state.permissions = new Set(['survey:manage']);
    state.scopes = { 'survey:manage': 'ALL' };
    state.request.mockImplementation((document: unknown) => {
      if (String(document).includes('SurveysAdminWorkspace'))
        return Promise.resolve({ surveys: [] });
      if (String(document).includes('SurveyDepartmentsWorkspace'))
        return Promise.resolve({ departments: [] });
      return Promise.resolve({ saveSurvey: { summary: { id: 'new' } } });
    });
    const user = userEvent.setup();
    render(<SurveysPage />);
    await user.type(screen.getByLabelText('Title'), 'Scheduled');
    await user.type(screen.getByLabelText('Question'), 'First');
    await user.click(screen.getByRole('button', { name: 'Add section' }));
    await user.type(screen.getAllByLabelText('Question')[1], 'Second');
    await user.click(screen.getAllByRole('button', { name: 'Remove section' })[0]);
    expect((screen.getByLabelText('Question') as HTMLInputElement).value).toBe('Second');
    // Browser-independent datetime-local values are interpreted in the displayed tenant zone.
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.change(screen.getByLabelText('Opens at (Asia/Kolkata)'), {
      target: { value: '2030-01-15T10:00' },
    });
    fireEvent.change(screen.getByLabelText('Closes at (Asia/Kolkata)'), {
      target: { value: '2030-01-15T09:00' },
    });
    await user.click(screen.getByRole('button', { name: 'Save draft' }));
    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(
      state.request.mock.calls.some(([doc]) => String(doc).includes('SaveSurveyWorkspace'))
    ).toBe(false);
    fireEvent.change(screen.getByLabelText('Closes at (Asia/Kolkata)'), {
      target: { value: '2030-01-16T10:00' },
    });
    await user.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() =>
      expect(
        state.request.mock.calls.find(([doc]) => String(doc).includes('SaveSurveyWorkspace'))?.[1]
      ).toMatchObject({
        input: {
          opensAt: '2030-01-15T04:30:00.000Z',
          closesAt: '2030-01-16T04:30:00.000Z',
          sections: [{ questions: [{ prompt: 'Second' }] }],
        },
      })
    );
  });
  it('saves explicit option scores and clears incompatible options on type changes', async () => {
    state.permissions = new Set(['survey:manage']);
    state.scopes = { 'survey:manage': 'ALL' };
    state.request.mockImplementation((document: unknown) => {
      if (String(document).includes('SurveysAdminWorkspace'))
        return Promise.resolve({ surveys: [] });
      if (String(document).includes('SurveyDepartmentsWorkspace'))
        return Promise.resolve({ departments: [] });
      return Promise.resolve({ saveSurvey: { summary: { id: 'new' } } });
    });
    const user = userEvent.setup();
    render(<SurveysPage />);
    await user.type(screen.getByLabelText('Title'), 'Pulse');
    await user.type(screen.getByLabelText('Question'), 'Choose');
    await user.selectOptions(screen.getByLabelText('Answer type'), 'SINGLE_CHOICE');
    await user.type(screen.getByLabelText('Option 1 label'), 'Neutral');
    await user.click(screen.getByRole('button', { name: 'Add option' }));
    await user.type(screen.getByLabelText('Option 2 label'), 'Positive');
    await user.type(screen.getByLabelText('Option 2 score (optional)'), '10');
    await user.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() =>
      expect(
        state.request.mock.calls.find(([doc]) => String(doc).includes('SaveSurveyWorkspace'))?.[1]
      ).toMatchObject({
        input: {
          sections: [
            {
              questions: [
                {
                  options: [
                    { label: 'Neutral', score: null },
                    { label: 'Positive', score: '10' },
                  ],
                },
              ],
            },
          ],
        },
      })
    );
    await user.type(screen.getByLabelText('Title'), 'Comments');
    await user.type(screen.getByLabelText('Question'), 'Explain');
    await user.selectOptions(screen.getByLabelText('Answer type'), 'SINGLE_CHOICE');
    await user.type(screen.getByLabelText('Option 1 label'), 'Discard');
    await user.selectOptions(screen.getByLabelText('Answer type'), 'SHORT_TEXT');
    await user.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() =>
      expect(
        state.request.mock.calls.filter(([doc]) =>
          String(doc).includes('SaveSurveyWorkspace')
        )[1]?.[1]
      ).toMatchObject({
        input: { sections: [{ questions: [{ options: [], ratingMin: null, ratingMax: null }] }] },
      })
    );
  });
  it('opens a task directly in respondent mode without loading HR administration', async () => {
    state.permissions = new Set(['survey:respond', 'survey:manage']);
    state.scopes = { 'survey:respond': 'SELF', 'survey:manage': 'ALL' };
    render(<SurveysPage respondentOnly initialSurveyId="survey-1" />);
    await screen.findByLabelText('I receive useful direction rating');
    expect(screen.queryByText('Create survey')).toBeNull();
    expect(
      state.request.mock.calls.some(([document]) =>
        /SurveysAdminWorkspace|SurveyDepartmentsWorkspace|SurveyAudienceWorkspace|SurveyAudienceOptionsWorkspace|SurveyManagementEventsWorkspace/.test(String(document))
      )
    ).toBe(false);
  });
  it('submits an assigned survey without a respondent identity in the payload', async () => {
    const user = userEvent.setup();
    render(<SurveysPage />);
    await user.click(await screen.findByRole('button', { name: 'Fill survey' }));
    await user.type(await screen.findByLabelText('I receive useful direction rating'), '4');
    await user.click(screen.getByRole('button', { name: 'Submit survey' }));
    await waitFor(() => {
      const call = state.request.mock.calls.find(([document]) =>
        String(document).includes('SubmitSurveyWorkspace')
      );
      expect(call?.[1]).toEqual({
        id: 'survey-1',
        answers: [
          { questionId: 'question-1', selectedOptionIds: [], numericAnswer: '4', textAnswer: null },
        ],
      });
      expect(JSON.stringify(call?.[1])).not.toContain('employee-1');
    });
  });

  it('explains threshold suppression without rendering response details', async () => {
    state.permissions = new Set(['survey:results']);
    state.scopes = { 'survey:results': 'TEAM' };
    state.request.mockImplementation((document: unknown) => {
      if (String(document).includes('SurveyResultsCatalogWorkspace'))
        return Promise.resolve({
          surveyResultsCatalog: [
            {
              id: 'survey-1',
              title: 'Pulse',
              status: 'CLOSED',
              minimumReportGroupSize: 5,
              completed: false,
            },
          ],
        });
      if (String(document).includes('SurveyResultsWorkspace'))
        return Promise.resolve({
          surveyResults: {
            surveyId: 'survey-1',
            suppressed: true,
            respondentCount: null,
            minimumReportGroupSize: 5,
            dimensions: [],
            questions: [],
          },
        });
      return Promise.resolve({});
    });
    const user = userEvent.setup();
    render(<SurveysPage />);
    await user.click(await screen.findByRole('button', { name: 'Aggregate results' }));
    expect(
      await screen.findByText(/Results remain hidden until at least 5 responses/)
    ).toBeTruthy();
    expect(screen.queryByText(/qualifying responses/)).toBeNull();
  });
});
