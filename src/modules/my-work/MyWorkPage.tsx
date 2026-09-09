import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';

import { createPermissionService } from '../../auth/permissionService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PageActions from '../../components/common/PageActions';
import { useAuth } from '../../contexts/AuthContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import {
  MyPerformanceReviewsDocument,
  type PerformanceReviewRow,
} from '../workplace/performanceLifecycleQueries';
import { AvailableSurveysDocument, type SurveySummaryRow } from '../workplace/surveyQueries';
import SurveysPage from '../workplace/SurveysPage';

import { buildMyWorkTasks, type MyWorkTask } from './myWorkTasks';

const MyWorkPage = () => {
  const { clientSession } = useAuth();
  const permissions = createPermissionService(clientSession);
  const canSelf = permissions.canScopedPermission('performance:self', ['SELF']);
  const canRespond = permissions.canScopedPermission('survey:respond', ['SELF']);
  const client = useGraphClient('client');
  const location = useLocation();
  const [params] = useSearchParams();
  const completed = location.pathname.endsWith('/completed');
  const surveyId = !completed ? params.get('survey') : null;
  const [tasks, setTasks] = useState<MyWorkTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setTasks([]);
    setErrors([]);
    void Promise.allSettled([
      canSelf
        ? client.request<{ myPerformanceReviews: PerformanceReviewRow[] }>(
            MyPerformanceReviewsDocument
          )
        : Promise.resolve({ myPerformanceReviews: [] }),
      canRespond
        ? client.request<{ availableSurveys: SurveySummaryRow[] }>(AvailableSurveysDocument)
        : Promise.resolve({ availableSurveys: [] }),
    ]).then(([performance, surveys]) => {
      if (cancelled) return;
      setTasks(
        buildMyWorkTasks(
          performance.status === 'fulfilled' ? performance.value.myPerformanceReviews : [],
          surveys.status === 'fulfilled' ? surveys.value.availableSurveys : []
        )
      );
      setErrors(
        [performance, surveys].flatMap((result) =>
          result.status === 'rejected' ? [graphQlUserMessage(result.reason)] : []
        )
      );
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [client, clientSession?.employeeId, canSelf, canRespond, revision, surveyId]);

  if (surveyId && canRespond)
    return (
      <div className="space-y-4">
        <Link to="/my-work/tasks" className="text-accent">
          Back to My Tasks
        </Link>
        <SurveysPage key={surveyId} respondentOnly initialSurveyId={surveyId} />
      </div>
    );
  const visible = tasks.filter((task) => task.completed === completed);
  return (
    <div className="space-y-4">
      <PageActions>
        <h1 className="sr-only">
          {completed ? 'Completed / Archive' : 'My Tasks'}
        </h1>
        <Button variant="outline" busy={loading} onClick={() => setRevision((value) => value + 1)}>
          Refresh
        </Button>
      </PageActions>
      {errors.length > 0 && (
        <p role="alert" className="text-status-danger">
          Some tasks could not load. {errors.join(' ')}
        </p>
      )}
      <MyWorkList
        visible={visible}
        loading={loading}
        completed={completed}
        hasErrors={errors.length > 0}
      />
    </div>
  );
};

const MyWorkList = ({
  visible,
  loading,
  completed,
  hasErrors,
}: {
  visible: MyWorkTask[];
  loading: boolean;
  completed: boolean;
  hasErrors: boolean;
}) => (
  <Card>
    {loading && <p role="status">Loading your work…</p>}
    {!loading && visible.length > 0 && (
      <ul className="divide-y divide-line">
        {visible.map((task) => (
          <li key={task.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div>
              <p className="font-medium">{task.title}</p>
              <p className="text-sm text-content-secondary">
                {task.kind}
                {task.date ? ` · ${completed ? 'Completed' : 'Due'} ${task.date.slice(0, 10)}` : ''}
                {task.completed && task.kind === 'Survey / Feedback'
                  ? ' · Submitted anonymously'
                  : ''}
              </p>
            </div>
            {task.href ? (
              <Link
                className="rounded-md border border-line px-3 py-2 text-sm text-accent"
                to={task.href}
              >
                {completed ? 'View review' : 'Open task'}
              </Link>
            ) : (
              <span className="text-sm text-content-secondary">Completed</span>
            )}
          </li>
        ))}
      </ul>
    )}
    {!loading && visible.length === 0 && !hasErrors && (
      <p className="text-content-secondary">
        {completed ? 'No completed tasks yet.' : 'You have no pending tasks.'}
      </p>
    )}
  </Card>
);

export default MyWorkPage;
