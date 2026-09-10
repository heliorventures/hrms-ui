import { useCallback, useRef, useState } from 'react';

import { useGraphClient } from '../../hooks/useGraphClient';
import type { useKeyedAction } from '../../hooks/useKeyedAction';

import {
  SurveyDetailDocument,
  SurveyManagementEventsDocument,
  SurveyResultsDocument,
  type SurveyDetailRow,
  type SurveyManagementEventRow,
  type SurveyResultsRow,
} from './surveyQueries';

export type SurveyAnswerValue = { text?: string; numeric?: string; options?: string[] };
export const useSurveyView = (run: ReturnType<typeof useKeyedAction>['run']) => {
  const client = useGraphClient('client');
  const [survey, setSurvey] = useState<SurveyDetailRow | null>(null);
  const [surveyMode, setSurveyMode] = useState<'admin' | 'respond'>('respond');
  const [results, setResults] = useState<SurveyResultsRow | null>(null);
  const [events, setEvents] = useState<SurveyManagementEventRow[]>([]);
  const [answers, setAnswers] = useState<Record<string, SurveyAnswerValue>>({});
  const request = useRef(0);
  const openedSurvey = useRef<string | null>(null);
  const openSurvey = useCallback(
    async (id: string, mode: 'admin' | 'respond') => {
      await run(
        `open:${id}`,
        async () => {
          const token = ++request.current;
          const value = await client.request<{ survey: SurveyDetailRow }>(SurveyDetailDocument, {
            id,
          });
          if (token !== request.current) return;
          setEvents([]);
          setResults(null);
          setSurvey(value.survey);
          setSurveyMode(mode);
          if (openedSurvey.current !== id) setAnswers({});
          openedSurvey.current = id;
        },
        'Survey opened.'
      );
    },
    [client, run]
  );
  const openResults = async (id: string) =>
    run(
      `results:${id}`,
      async () => {
        const token = ++request.current;
        const value = await client.request<{ surveyResults: SurveyResultsRow }>(
          SurveyResultsDocument,
          { id }
        );
        if (token !== request.current) return;
        setResults(value.surveyResults);
        setEvents([]);
        setSurvey(null);
      },
      'Aggregate results loaded.'
    );
  const openHistory = async (id: string) =>
    run(
      'management-events',
      async () => {
        const token = ++request.current;
        const value = await client.request<{ surveyManagementEvents: SurveyManagementEventRow[] }>(
          SurveyManagementEventsDocument,
          { id }
        );
        if (token !== request.current) return;
        setEvents(value.surveyManagementEvents);
        setSurvey(null);
        setResults(null);
      },
      'Management history loaded.'
    );
  return {
    survey,
    setSurvey,
    surveyMode,
    results,
    events,
    answers,
    setAnswers,
    openSurvey,
    openResults,
    openHistory,
  };
};
