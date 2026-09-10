import { useEffect } from 'react';

import { createPermissionService } from '../../auth/permissionService';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import { useKeyedAction } from '../../hooks/useKeyedAction';

import {
  CloseSurveyDocument,
  OpenSurveyDocument,
  PublishSurveyDocument,
  SubmitSurveyDocument,
  type SurveyDetailRow,
} from './surveyQueries';
import { useSurveyCatalog } from './useSurveyCatalog';
import { useSurveyDraft } from './useSurveyDraft';
import { useSurveyView, type SurveyAnswerValue } from './useSurveyView';

const responsePayload = (survey: SurveyDetailRow, answers: Record<string, SurveyAnswerValue>) =>
  survey.sections
    .flatMap((section) => section.questions)
    .map((question) => {
      const answer = answers[question.id] ?? {};
      return {
        questionId: question.id,
        selectedOptionIds: answer.options ?? [],
        numericAnswer: answer.numeric?.trim() || null,
        textAnswer: answer.text?.trim() || null,
      };
    })
    .filter(
      (answer) => answer.selectedOptionIds.length > 0 || answer.numericAnswer || answer.textAnswer
    );

const transitions = {
  publish: {
    document: PublishSurveyDocument,
    message: 'Survey published and assigned to eligible employees.',
  },
  close: { document: CloseSurveyDocument, message: 'Survey closed.' },
  'open-now': { document: OpenSurveyDocument, message: 'Survey opened for its existing audience.' },
};
export type SurveyTransition = keyof typeof transitions;
export const useSurveyWorkspace = (respondentOnly: boolean, initialSurveyId?: string) => {
  const { clientSession } = useAuth();
  const {
    currentTenant: { timezone },
  } = useTenant();
  const permissions = createPermissionService(clientSession);
  const canManage = !respondentOnly && permissions.canScopedPermission('survey:manage', ['ALL']);
  const canRespond = permissions.canScopedPermission('survey:respond', ['SELF']);
  const canResults =
    !respondentOnly &&
    permissions.canScopedPermission('survey:results', ['TEAM', 'DEPARTMENT', 'ALL']);
  const client = useGraphClient('client');
  const action = useKeyedAction();
  const { run } = action;
  const catalog = useSurveyCatalog(canManage, canRespond, canResults, run);
  const view = useSurveyView(run);
  const draft = useSurveyDraft(timezone, run, catalog.load);
  const { openSurvey } = view;
  useEffect(() => {
    if (initialSurveyId && canRespond) void openSurvey(initialSurveyId, 'respond');
  }, [initialSurveyId, canRespond, openSurvey]);
  const transition = (id: string, kind: SurveyTransition) =>
    run(
      `${kind}:${id}`,
      async () => {
        await client.request(transitions[kind].document, { id });
        await catalog.load();
      },
      transitions[kind].message
    );
  const submit = () =>
    run(
      'submit-survey',
      async () => {
        const { survey } = view;
        if (!survey) return;
        await client.request(SubmitSurveyDocument, {
          id: survey.summary.id,
          answers: responsePayload(survey, view.answers),
        });
        view.setSurvey((current) =>
          current && current.summary.id === survey.summary.id
            ? { ...current, summary: { ...current.summary, completed: true } }
            : current
        );
        catalog.setAvailable((current) =>
          current.map((item) =>
            item.id === survey.summary.id ? { ...item, completed: true } : item
          )
        );
      },
      'Survey submitted anonymously.'
    );
  return {
    ...action,
    ...catalog,
    ...view,
    ...draft,
    timezone,
    canManage,
    canRespond,
    canResults,
    transition,
    submit,
  };
};
export type SurveyWorkspaceModel = ReturnType<typeof useSurveyWorkspace>;
