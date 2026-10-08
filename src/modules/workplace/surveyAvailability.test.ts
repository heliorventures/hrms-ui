import { describe, expect, it } from 'vitest';
import { canFillSurvey, surveyAvailabilityLabel } from './surveyAvailability';
import type { SurveySummaryRow } from './surveyQueries';

const now = Date.parse('2026-09-20T09:00:00Z');
const survey: SurveySummaryRow = {
  id: 'survey', title: 'Pulse', status: 'PUBLISHED', completed: false,
  minimumReportGroupSize: 3, opensAt: '2026-09-20T09:00:00Z',
  closesAt: '2026-09-21T09:00:00Z',
};

describe('survey availability', () => {
  it('labels the inclusive opening and exclusive closing boundaries', () => {
    expect(surveyAvailabilityLabel(survey, now - 1)).toBe('Scheduled');
    expect(surveyAvailabilityLabel(survey, now)).toBe('Open');
    expect(surveyAvailabilityLabel(survey, Date.parse(survey.closesAt!))).toBe('Ended');
    expect(canFillSurvey(survey, now - 1)).toBe(false);
    expect(canFillSurvey(survey, now)).toBe(true);
    expect(canFillSurvey(survey, Date.parse(survey.closesAt!))).toBe(false);
  });

  it('preserves draft, closed and submitted restrictions', () => {
    expect(surveyAvailabilityLabel({ ...survey, status: 'DRAFT' }, now)).toBe('Draft');
    expect(surveyAvailabilityLabel({ ...survey, status: 'CLOSED' }, now)).toBe('Closed');
    expect(canFillSurvey({ ...survey, completed: true }, now)).toBe(false);
    expect(canFillSurvey({ ...survey, status: 'DRAFT' }, now)).toBe(false);
    expect(canFillSurvey({ ...survey, status: 'CLOSED' }, now)).toBe(false);
  });

  it('fails closed on malformed times and unknown status', () => {
    expect(canFillSurvey({ ...survey, opensAt: 'invalid' }, now)).toBe(false);
    expect(canFillSurvey({ ...survey, closesAt: 'invalid' }, now)).toBe(false);
    expect(surveyAvailabilityLabel({ ...survey, closesAt: 'invalid' }, now)).toBe('Unavailable');
    expect(canFillSurvey({ ...survey, status: 'OTHER' }, now)).toBe(false);
  });
});
