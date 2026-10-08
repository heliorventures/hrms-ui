import { useCallback, useEffect, useRef, useState } from 'react';

import { useGraphClient } from '../../hooks/useGraphClient';
import type { useKeyedAction } from '../../hooks/useKeyedAction';

import {
  AvailableSurveysDocument,
  SurveyResultsCatalogDocument,
  SurveysAdminDocument,
  type SurveySummaryRow,
} from './surveyQueries';

export const useSurveyCatalog = (
  canManage: boolean,
  canRespond: boolean,
  canResults: boolean,
  run: ReturnType<typeof useKeyedAction>['run']
) => {
  const client = useGraphClient('client');
  const [adminSurveys, setAdminSurveys] = useState<SurveySummaryRow[]>([]);
  const [available, setAvailable] = useState<SurveySummaryRow[]>([]);
  const [resultsCatalog, setResultsCatalog] = useState<SurveySummaryRow[]>([]);
  const generation = useRef(0);
  const invalidate = useCallback(() => {
    ++generation.current;
  }, []);
  const load = useCallback(async () => {
    const requestGeneration = ++generation.current;
    const tasks: Promise<void>[] = [];
    if (canManage)
      tasks.push(
        client.request<{ surveys: SurveySummaryRow[] }>(SurveysAdminDocument).then((value) => {
          if (requestGeneration === generation.current) setAdminSurveys(value.surveys);
        })
      );
    if (canRespond)
      tasks.push(
        client
          .request<{ availableSurveys: SurveySummaryRow[] }>(AvailableSurveysDocument)
          .then((value) => {
            if (requestGeneration === generation.current) setAvailable(value.availableSurveys);
          })
      );
    if (canResults && !canManage)
      tasks.push(
        client
          .request<{ surveyResultsCatalog: SurveySummaryRow[] }>(SurveyResultsCatalogDocument)
          .then((value) => {
            if (requestGeneration === generation.current)
              setResultsCatalog(value.surveyResultsCatalog);
          })
      );
    await Promise.all(tasks);
  }, [canManage, canRespond, canResults, client]);
  useEffect(() => {
    // StrictMode replays setup after cleanup invalidates the previous generation.
    // A generation-specific key must allow that replacement read to start.
    void run(`load:${generation.current}`, load, '');
    return invalidate;
  }, [load, run, invalidate]);
  return { adminSurveys, available, resultsCatalog, setAvailable, load };
};
