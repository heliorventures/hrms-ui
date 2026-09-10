import { useState } from 'react';

import type { useSurveyDraft } from './useSurveyDraft';
import type { useSurveyView } from './useSurveyView';

export const useSurveyNavigation = (
  view: ReturnType<typeof useSurveyView>,
  draft: ReturnType<typeof useSurveyDraft>,
  initialSurveyId?: string
) => {
  const [screen, setScreen] = useState<'list' | 'editor' | 'survey' | 'results'>(
    initialSurveyId ? 'survey' : 'list'
  );
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(initialSurveyId ?? null);
  const [historySurveyId, setHistorySurveyId] = useState<string | null>(null);
  const backToList = () => {
    draft.cancelDraft();
    view.closeView();
    setSelectedSurveyId(null);
    setScreen('list');
  };
  return {
    screen,
    selectedSurveyId,
    historySurveyId,
    backToList,
    createSurvey: () => {
      draft.cancelDraft();
      view.closeView();
      setSelectedSurveyId(null);
      setScreen('editor');
    },
    editSurvey: async (id: string, copy = false) => {
      view.closeView();
      draft.cancelDraft();
      setSelectedSurveyId(copy ? null : id);
      setScreen('editor');
      await draft.editSurvey(id, copy);
    },
    saveDraft: async () => {
      if (await draft.saveDraft()) {
        setSelectedSurveyId(null);
        setScreen('list');
      }
    },
    openSurvey: async (id: string, mode: 'admin' | 'respond') => {
      setSelectedSurveyId(id);
      setScreen('survey');
      await view.openSurvey(id, mode);
    },
    openResults: async (id: string) => {
      setSelectedSurveyId(id);
      setScreen('results');
      await view.openResults(id);
    },
    openHistory: async (id: string) => {
      setHistorySurveyId(id);
      await view.openHistory(id);
    },
    closeHistory: () => {
      setHistorySurveyId(null);
      view.closeHistory();
    },
  };
};
