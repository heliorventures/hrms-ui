import type { SurveySummaryRow } from './surveyQueries';

export function canFillSurvey(survey: SurveySummaryRow, now = Date.now()): boolean {
  return !survey.completed && surveyAvailabilityLabel(survey, now) === 'Open';
}

const boundaryTimestamp = (value: string | null | undefined, fallback: number): number =>
  value ? Date.parse(value) : fallback;

export function surveyAvailabilityLabel(survey: SurveySummaryRow, now = Date.now()): string {
  if (survey.status === 'DRAFT') return 'Draft';
  if (survey.status === 'CLOSED') return 'Closed';
  if (survey.status !== 'PUBLISHED' || !Number.isFinite(now)) return 'Unavailable';
  const opens = boundaryTimestamp(survey.opensAt, -Infinity);
  const closes = boundaryTimestamp(survey.closesAt, Infinity);
  if (Number.isNaN(opens) || Number.isNaN(closes) || closes <= opens) return 'Unavailable';
  if (now >= closes) return 'Ended';
  if (now < opens) return 'Scheduled';
  return 'Open';
}
