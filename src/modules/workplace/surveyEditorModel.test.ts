import { describe, expect, it } from 'vitest';

import { blankSurvey, buildSurveyInput, hydrateSurvey, tenantTimeToIso } from './surveyEditorModel';

describe('survey review and question configuration', () => {
  it('saves review disclosure and optional question guidance and comments', () => {
    const draft = blankSurvey();
    draft.title = 'Pulse';
    const [question] = draft.sections[0].questions;
    question.prompt = 'Support';
    question.description = '  Rate the support you receive.  ';
    question.commentEnabled = true;
    const input = buildSurveyInput(draft, 'UTC');
    expect(input.responseReviewMode).toBe('ANONYMOUS_SUBMISSIONS');
    expect(input.sections[0].questions[0]).toMatchObject({
      description: 'Rate the support you receive.',
      commentEnabled: true,
      ratingMin: '1',
      ratingMax: '5',
    });
    question.type = 'LONG_TEXT';
    expect(buildSurveyInput(draft, 'UTC').sections[0].questions[0].commentEnabled).toBe(false);
  });
  it('preserves the aggregate-only disclosure for legacy surveys', () => {
    const draft = hydrateSurvey(
      {
        summary: {
          id: 's',
          title: 'Legacy',
          status: 'DRAFT',
          minimumReportGroupSize: 5,
          completed: false,
        },
        audienceDepartmentIds: [],
        sections: [],
      },
      'UTC',
      false,
      { audienceKind: 'ALL', departmentIds: [], locationIds: [], employeeIds: [] }
    );
    expect(draft.responseReviewMode).toBe('AGGREGATE_ONLY');
  });
  it('retains custom decimal scales and review settings when copying a survey', () => {
    const draft = hydrateSurvey(
      {
        summary: {
          id: 's',
          title: 'Custom',
          status: 'CLOSED',
          minimumReportGroupSize: 5,
          completed: false,
          responseReviewMode: 'ANONYMOUS_SUBMISSIONS',
        },
        audienceDepartmentIds: [],
        sections: [
          {
            id: 'section',
            title: 'Section',
            displayOrder: 0,
            questions: [
              {
                id: 'q',
                dimension: 'Support',
                prompt: 'Rate support',
                description: 'Use the existing scale',
                commentEnabled: true,
                questionType: 'RATING',
                isRequired: true,
                ratingMin: '0.25',
                ratingMax: '2.75',
                displayOrder: 0,
                options: [],
              },
            ],
          },
        ],
      },
      'UTC',
      true,
      { audienceKind: 'ALL', departmentIds: [], locationIds: [], employeeIds: [] }
    );
    const input = buildSurveyInput(draft, 'UTC');
    expect(input.responseReviewMode).toBe('ANONYMOUS_SUBMISSIONS');
    expect(input.sections[0].questions[0]).toMatchObject({
      ratingMin: '0.25',
      ratingMax: '2.75',
      description: 'Use the existing scale',
      commentEnabled: true,
    });
  });
});

describe('survey editor schedule and payload boundaries', () => {
  it('requires at least two options for a choice question', () => {
    const draft = blankSurvey();
    draft.title = 'Choose';
    const [q] = draft.sections[0].questions;
    q.prompt = 'Pick';
    q.type = 'SINGLE_CHOICE';
    q.options = [{ key: 'one', label: 'Only one', score: '' }];
    expect(() => buildSurveyInput(draft, 'UTC')).toThrow(/at least two/);
  });
  it('does not broaden a saved restricted audience after its last selection disappears', () => {
    const detail = {
      summary: {
        id: 's',
        title: 'Restricted',
        status: 'DRAFT',
        minimumReportGroupSize: 5,
        completed: false,
      },
      audienceDepartmentIds: [],
      sections: [],
    };
    const audience = {
      audienceKind: 'LOCATION',
      departmentIds: [],
      locationIds: [],
      employeeIds: [],
    };
    const draft = hydrateSurvey(detail, 'UTC', false, audience);
    expect(draft.audienceKind).toBe('LOCATION');
    expect(() => buildSurveyInput(draft, 'UTC')).toThrow(/Select at least one/);
  });
  it('converts wall time in the tenant zone rather than browser local time', () => {
    expect(tenantTimeToIso('2030-01-15T10:00', 'Asia/Kolkata')).toBe('2030-01-15T04:30:00.000Z');
    expect(tenantTimeToIso('2030-07-15T10:00', 'America/New_York')).toBe(
      '2030-07-15T14:00:00.000Z'
    );
  });
  it('rejects nonexistent and ambiguous DST wall times rather than guessing', () => {
    expect(() => tenantTimeToIso('2030-03-10T02:30', 'America/New_York')).toThrow(
      /ambiguous or does not exist/
    );
    expect(() => tenantTimeToIso('2030-11-03T01:30', 'America/New_York')).toThrow(
      /ambiguous or does not exist/
    );
  });
  it('retains exact saved instants including fractional seconds and resolved DST ambiguity', () => {
    expect(
      tenantTimeToIso('2030-11-03T01:30', 'America/New_York', '2030-11-03T05:30:12.345Z')
    ).toBe('2030-11-03T05:30:12.345Z');
  });
  it('rejects empty labels and invalid ranges and retains zero option scores', () => {
    const draft = blankSurvey();
    draft.title = 'Pulse';
    const [q] = draft.sections[0].questions;
    q.prompt = 'Choose';
    q.type = 'SINGLE_CHOICE';
    q.options = [
      { key: 'a', label: '', score: '0' },
      { key: 'b', label: 'Yes', score: '' },
    ];
    expect(() => buildSurveyInput(draft, 'UTC')).toThrow(/label/);
    q.options[0].label = 'No';
    expect(buildSurveyInput(draft, 'UTC').sections[0].questions[0].options).toEqual([
      { label: 'No', score: '0' },
      { label: 'Yes', score: null },
    ]);
    q.type = 'RATING';
    q.ratingMin = '5';
    q.ratingMax = '2';
    expect(() => buildSurveyInput(draft, 'UTC')).toThrow(/greater/);
  });
});
