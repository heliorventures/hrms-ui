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
import { useSurveyNavigation } from './useSurveyNavigation';
import { useSurveyView, type SurveyAnswerValue } from './useSurveyView';

const responseComment = (
  question: SurveyDetailRow['sections'][number]['questions'][number],
  answer: SurveyAnswerValue
) => {
  if (!question.commentEnabled) return null;
  if (!['RATING', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(question.questionType)) return null;
  const comment = answer.comment?.trim() || null;
  if (comment && !answer.numeric?.trim() && !answer.options?.length) {
    throw new Error(`Choose a rating or option before adding a comment to "${question.prompt}".`);
  }
  return comment;
};

const responsePayload = (survey: SurveyDetailRow, answers: Record<string, SurveyAnswerValue>) =>
  survey.sections
    .flatMap((section) => section.questions)
    .map((question) => {
      const answer = answers[question.id] ?? {};
      const comment = responseComment(question, answer);
      return {
        questionId: question.id,
        selectedOptionIds: answer.options ?? [],
        numericAnswer: answer.numeric?.trim() || null,
        textAnswer: answer.text?.trim() || null,
        comment,
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
  const canReviewSubmissions =
    canManage && permissions.canScopedPermission('survey:results', ['ALL']);
  const client = useGraphClient('client');
  const action = useKeyedAction();
  const { run } = action;
  const catalog = useSurveyCatalog(canManage, canRespond, canResults, run);
  const view = useSurveyView(run);
  const draft = useSurveyDraft(timezone, run, catalog.load);
  const navigation = useSurveyNavigation(view, draft, initialSurveyId);
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
  const submit = () => {
    const { survey } = view;
    if (!survey) return Promise.resolve();
    let answers: ReturnType<typeof responsePayload>;
    try {
      answers = responsePayload(survey, view.answers);
    } catch (cause) {
      action.setError(cause instanceof Error ? cause.message : 'Check your survey answers.');
      return Promise.resolve();
    }
    return run(
      'submit-survey',
      async () => {
        await client.request(SubmitSurveyDocument, {
          id: survey.summary.id,
          answers,
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
  };
  return {
    ...action,
    ...catalog,
    ...view,
    ...draft,
    isBusy: (key: string) => (key === 'load-draft' ? draft.loadingDraft : action.isBusy(key)),
    timezone,
    canManage,
    canRespond,
    canResults,
    canReviewSubmissions,
    transition,
    submit,
    ...navigation,
  };
};
export type SurveyWorkspaceModel = ReturnType<typeof useSurveyWorkspace>;
