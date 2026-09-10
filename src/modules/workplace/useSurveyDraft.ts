import { useRef, useState } from 'react';

import { useGraphClient } from '../../hooks/useGraphClient';
import type { useKeyedAction } from '../../hooks/useKeyedAction';

import { blankSurvey, buildSurveyInput, hydrateSurvey } from './surveyEditorModel';
import {
  SaveSurveyDocument,
  SurveyAudienceDocument,
  SurveyDetailDocument,
  type SurveyAudienceRow,
  type SurveyDetailRow,
} from './surveyQueries';

export const useSurveyDraft = (
  timezone: string,
  run: ReturnType<typeof useKeyedAction>['run'],
  load: () => Promise<void>
) => {
  const client = useGraphClient('client');
  const [draft, setDraft] = useState(blankSurvey);
  const request = useRef(0);
  const editSurvey = async (id: string, copy = false) => {
    const token = ++request.current;
    await run(
      'load-draft',
      async () => {
        const [value, audience] = await Promise.all([
          client.request<{ survey: SurveyDetailRow }>(SurveyDetailDocument, { id }),
          client.request<{ surveyAudience: SurveyAudienceRow }>(SurveyAudienceDocument, { id }),
        ]);
        if (token !== request.current) return;
        setDraft(hydrateSurvey(value.survey, timezone, copy, audience.surveyAudience));
      },
      ''
    );
  };
  const cancelDraft = () => {
    ++request.current;
    setDraft(blankSurvey());
  };
  const saveDraft = () =>
    run(
      'save-survey',
      async () => {
        await client.request(SaveSurveyDocument, { input: buildSurveyInput(draft, timezone) });
        setDraft(blankSurvey());
        await load();
      },
      'Survey saved as a draft.'
    );
  return { draft, setDraft, editSurvey, cancelDraft, saveDraft };
};
