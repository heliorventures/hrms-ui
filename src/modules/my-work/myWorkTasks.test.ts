import { expect, it } from 'vitest';

import type { PerformanceReviewRow } from '../workplace/performanceLifecycleQueries';
import type { SurveySummaryRow } from '../workplace/surveyQueries';

import { buildMyWorkTasks } from './myWorkTasks';

it('archives self submissions while keeping a later acknowledgement pending', () => {
  const review = {
    id: 'r1',
    cycleName: 'Annual',
    cycleStage: 'EMPLOYEE_ACKNOWLEDGEMENT',
    status: 'MANAGER_SUBMITTED',
    selfSubmittedAt: '2026-09-01',
    cycleEndDate: '2026-09-30',
  } as PerformanceReviewRow;
  const tasks = buildMyWorkTasks([review], []);
  expect(tasks.filter((task) => !task.completed).map((task) => task.title)).toEqual([
    'Acknowledge appraisal — Annual',
  ]);
  expect(tasks.filter((task) => task.completed).map((task) => task.title)).toEqual([
    'Self-review — Annual',
  ]);
});

it('keeps anonymous completion receipts and excludes closed unfilled surveys from pending tasks', () => {
  const surveys = [
    { id: 's1', title: 'Submitted pulse', status: 'CLOSED', completed: true },
    { id: 's2', title: 'Missed pulse', status: 'CLOSED', completed: false },
    { id: 's3', title: 'Current pulse', status: 'PUBLISHED', completed: false },
  ] as SurveySummaryRow[];
  const tasks = buildMyWorkTasks([], surveys);
  expect(tasks.filter((task) => !task.completed).map((task) => task.title)).toEqual([
    'Current pulse',
  ]);
  expect(tasks.find((task) => task.id === 'survey:s1')).toMatchObject({
    completed: true,
    href: undefined,
  });
});

it('does not offer surveys outside their response window', () => {
  const surveys = [
    {
      id: 'expired',
      title: 'Expired',
      status: 'PUBLISHED',
      completed: false,
      closesAt: '2020-01-01T00:00:00Z',
    },
    {
      id: 'future',
      title: 'Future',
      status: 'PUBLISHED',
      completed: false,
      opensAt: '2099-01-01T00:00:00Z',
    },
  ] as SurveySummaryRow[];
  expect(buildMyWorkTasks([], surveys)).toEqual([]);
});
