import type { SurveySummaryRow } from './surveyQueries';

export function canFillSurvey(survey: SurveySummaryRow, now = Date.now()): boolean {
  if (survey.completed || survey.status !== 'PUBLISHED') return false;
  if (survey.opensAt && now < Date.parse(survey.opensAt)) return false;
  if (survey.closesAt && now >= Date.parse(survey.closesAt)) return false;
  return true;
}
