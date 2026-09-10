import { useCallback, useRef, useState } from 'react';

import { useGraphClient } from '../../hooks/useGraphClient';
import type { useKeyedAction } from '../../hooks/useKeyedAction';

import {
  SurveyManagementEventsDocument,
  SurveySubmissionsDocument,
  type SurveyManagementEventRow,
  type SurveySubmissionsRow,
} from './surveyQueries';

type RunAction = ReturnType<typeof useKeyedAction>['run'];

export const useSurveyHistory = (run: RunAction) => {
  const client = useGraphClient('client');
  const [events, setEvents] = useState<SurveyManagementEventRow[]>([]);
  const [historyBusy, setHistoryBusy] = useState(false);
  const [historyFailed, setHistoryFailed] = useState(false);
  const request = useRef(0);
  const openHistory = async (id: string) => {
    const token = ++request.current;
    setHistoryBusy(true);
    setHistoryFailed(false);
    setEvents([]);
    await run(
      `management-events:${id}:${token}`,
      async () => {
        try {
          const value = await client.request<{
            surveyManagementEvents: SurveyManagementEventRow[];
          }>(SurveyManagementEventsDocument, { id });
          if (token === request.current) setEvents(value.surveyManagementEvents);
        } catch (cause) {
          if (token === request.current) setHistoryFailed(true);
          throw cause;
        } finally {
          if (token === request.current) setHistoryBusy(false);
        }
      },
      'Management history loaded.'
    );
  };
  const closeHistory = () => {
    ++request.current;
    setEvents([]);
    setHistoryBusy(false);
    setHistoryFailed(false);
  };
  return { events, historyBusy, historyFailed, openHistory, closeHistory };
};

export const useSurveySubmissions = (run: RunAction) => {
  const client = useGraphClient('client');
  const [submissions, setSubmissions] = useState<SurveySubmissionsRow | null>(null);
  const [submissionOffset, setSubmissionOffset] = useState(0);
  const [submissionsFailed, setSubmissionsFailed] = useState(false);
  const request = useRef(0);
  const clearSubmissions = useCallback(() => {
    ++request.current;
    setSubmissions(null);
    setSubmissionOffset(0);
    setSubmissionsFailed(false);
  }, []);
  const openSubmissions = async (id: string, offset = 0) => {
    const token = ++request.current;
    setSubmissions(null);
    setSubmissionsFailed(false);
    setSubmissionOffset(offset);
    await run(
      `submissions:${id}:${offset}:${token}`,
      async () => {
        try {
          const value = await client.request<{ surveySubmissions: SurveySubmissionsRow }>(
            SurveySubmissionsDocument,
            { id, offset, limit: 20 }
          );
          if (token === request.current) setSubmissions(value.surveySubmissions);
        } catch (cause) {
          if (token === request.current) setSubmissionsFailed(true);
          throw cause;
        }
      },
      ''
    );
  };
  return { submissions, submissionOffset, submissionsFailed, openSubmissions, clearSubmissions };
};
