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
  const [savedDraft, setSavedDraft] = useState(() => JSON.stringify(draft));
  const [loadingDraft, setLoadingDraft] = useState(false);
  const request = useRef(0);
  const editSurvey = async (id: string, copy = false) => {
    const token = ++request.current;
    setLoadingDraft(true);
    await run(
      `load-draft:${token}`,
      async () => {
        const [value, audience] = await Promise.all([
          client.request<{ survey: SurveyDetailRow }>(SurveyDetailDocument, { id }),
          client.request<{ surveyAudience: SurveyAudienceRow }>(SurveyAudienceDocument, { id }),
        ]);
        if (token !== request.current) return;
        const next = hydrateSurvey(value.survey, timezone, copy, audience.surveyAudience);
        setDraft(next);
        setSavedDraft(JSON.stringify(next));
      },
      ''
    );
    if (token === request.current) setLoadingDraft(false);
  };
  const cancelDraft = () => {
    ++request.current;
    setLoadingDraft(false);
    const next = blankSurvey();
    setDraft(next);
    setSavedDraft(JSON.stringify(next));
  };
  const saveDraft = async () => {
    let saved = false;
    const token = ++request.current;
    await run(
      'save-survey',
      async () => {
        await client.request(SaveSurveyDocument, { input: buildSurveyInput(draft, timezone) });
        if (token !== request.current) return;
        saved = true;
        const next = blankSurvey();
        setDraft(next);
        setSavedDraft(JSON.stringify(next));
        await load();
      },
      'Survey saved as a draft.'
    );
    return saved;
  };
  return {
    draft,
    setDraft,
    editSurvey,
    cancelDraft,
    saveDraft,
    loadingDraft,
    draftDirty: JSON.stringify(draft) !== savedDraft,
  };
};
