import { useCallback, useRef, useState } from 'react';

import { useGraphClient } from '../../hooks/useGraphClient';
import type { useKeyedAction } from '../../hooks/useKeyedAction';

import {
  SurveyDetailDocument,
  SurveyResultsDocument,
  type SurveyDetailRow,
  type SurveyResultsRow,
} from './surveyQueries';
import { useSurveyHistory, useSurveySubmissions } from './useSurveyReviewData';

export type SurveyAnswerValue = {
  text?: string;
  numeric?: string;
  options?: string[];
  comment?: string;
};
export const useSurveyView = (run: ReturnType<typeof useKeyedAction>['run']) => {
  const client = useGraphClient('client');
  const [survey, setSurvey] = useState<SurveyDetailRow | null>(null);
  const [surveyMode, setSurveyMode] = useState<'admin' | 'respond'>('respond');
  const [results, setResults] = useState<SurveyResultsRow | null>(null);
  const [resultsFailed, setResultsFailed] = useState(false);
  const history = useSurveyHistory(run);
  const submissionData = useSurveySubmissions(run);
  const { clearSubmissions } = submissionData;
  const [answers, setAnswers] = useState<Record<string, SurveyAnswerValue>>({});
  const request = useRef(0);
  const openedSurvey = useRef<string | null>(null);
  const openSurvey = useCallback(
    async (id: string, mode: 'admin' | 'respond') => {
      const token = ++request.current;
      await run(
        `open:${id}:${token}`,
        async () => {
          clearSubmissions();
          setSurvey(null);
          setResults(null);
          const value = await client.request<{ survey: SurveyDetailRow }>(SurveyDetailDocument, {
            id,
          });
          if (token !== request.current) return;
          setResults(null);
          setSurvey(value.survey);
          setSurveyMode(mode);
          if (openedSurvey.current !== id) setAnswers({});
          openedSurvey.current = id;
        },
        'Survey opened.'
      );
    },
    [client, run, clearSubmissions]
  );
  const openResults = async (id: string) => {
    const token = ++request.current;
    await run(
      `results:${id}:${token}`,
      async () => {
        clearSubmissions();
        setResults(null);
        setSurvey(null);
        setResultsFailed(false);
        try {
          const value = await client.request<{ surveyResults: SurveyResultsRow }>(
            SurveyResultsDocument,
            { id }
          );
          if (token !== request.current) return;
          setResults(value.surveyResults);
          setSurvey(null);
        } catch (cause) {
          if (token !== request.current) return;
          setResultsFailed(true);
          throw cause;
        }
      },
      'Aggregate results loaded.'
    );
  };
  const closeView = () => {
    ++request.current;
    clearSubmissions();
    setSurvey(null);
    setResults(null);
    setAnswers({});
    openedSurvey.current = null;
  };
  return {
    survey,
    setSurvey,
    surveyMode,
    results,
    resultsFailed,
    ...history,
    ...submissionData,
    answers,
    setAnswers,
    openSurvey,
    openResults,
    closeView,
  };
};
