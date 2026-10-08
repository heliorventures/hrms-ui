import type { PerformanceReviewRow } from '../workplace/performanceLifecycleQueries';
import { canFillSurvey } from '../workplace/surveyAvailability';
import type { SurveySummaryRow } from '../workplace/surveyQueries';

export interface MyWorkTask {
  id: string;
  title: string;
  kind: 'Performance' | 'Survey / Feedback';
  completed: boolean;
  date?: string | null;
  href?: string;
}

export function buildMyWorkTasks(
  reviews: PerformanceReviewRow[],
  surveys: SurveySummaryRow[]
): MyWorkTask[] {
  const tasks: MyWorkTask[] = reviews.flatMap(reviewTasks);
  for (const survey of surveys) {
    if (!survey.completed && !canFillSurvey(survey)) continue;
    tasks.push({
      id: `survey:${survey.id}`,
      title: survey.title,
      kind: 'Survey / Feedback',
      completed: survey.completed,
      date: survey.completed ? undefined : survey.closesAt,
      href: survey.completed ? undefined : `/my-work/tasks?survey=${encodeURIComponent(survey.id)}`,
    });
  }
  return tasks;
}

const reviewTasks = (review: PerformanceReviewRow): MyWorkTask[] => {
  const tasks: MyWorkTask[] = [];
  const href = `/performance?tab=my&review=${encodeURIComponent(review.id)}`;
  const add = (key: string, label: string, completed: boolean, date?: string | null) => {
    tasks.push({
      id: `${review.id}:${key}`,
      title: `${label} — ${review.cycleName}`,
      kind: 'Performance',
      completed,
      date,
      href,
    });
  };
  if (review.cycleStage === 'GOAL_SETTING' && review.status === 'GOAL_SETTING')
    add('goals', 'Set goals', false, review.cycleEndDate);
  if (review.selfSubmittedAt) add('self', 'Self-review', true, review.selfSubmittedAt);
  else if (review.cycleStage === 'SELF_REVIEW')
    add('self', 'Fill self-review', false, review.cycleEndDate);
  if (review.acknowledgedAt)
    add('acknowledge', 'Appraisal acknowledgement', true, review.acknowledgedAt);
  else if (review.cycleStage === 'EMPLOYEE_ACKNOWLEDGEMENT')
    add('acknowledge', 'Acknowledge appraisal', false, review.cycleEndDate);
  if (review.cycleStage === 'CLOSED')
    add('review', 'Completed appraisal', true, review.cycleEndDate);
  return tasks;
};
