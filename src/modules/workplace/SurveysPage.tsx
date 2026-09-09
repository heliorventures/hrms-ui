import { useCallback, useEffect, useRef, useState } from 'react';

import { createPermissionService } from '../../auth/permissionService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PageInformation from '../../components/common/PageInformation';
import { useAuth } from '../../contexts/AuthContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import { useKeyedAction } from '../../hooks/useKeyedAction';

import { canFillSurvey } from './surveyAvailability';

import {
  AvailableSurveysDocument,
  CloseSurveyDocument,
  PublishSurveyDocument,
  SaveSurveyDocument,
  SubmitSurveyDocument,
  SurveyDepartmentsDocument,
  SurveyDetailDocument,
  SurveyResultsDocument,
  SurveyResultsCatalogDocument,
  SurveysAdminDocument,
  type SurveyDetailRow,
  type SurveyQuestionRow,
  type SurveyResultsRow,
  type SurveySummaryRow,
} from './surveyQueries';

const fieldClass =
  'min-h-10 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-content-primary';

interface DraftQuestion {
  dimension: string;
  prompt: string;
  type: string;
  isRequired: boolean;
  options: string;
}

const blankQuestion = (): DraftQuestion => ({
  dimension: 'Engagement',
  prompt: '',
  type: 'RATING',
  isRequired: true,
  options: '',
});

const SurveysPage = ({
  respondentOnly = false,
  initialSurveyId,
}: { respondentOnly?: boolean; initialSurveyId?: string } = {}) => {
  const { clientSession } = useAuth();
  const permissions = createPermissionService(clientSession);
  const canManage = !respondentOnly && permissions.canScopedPermission('survey:manage', ['ALL']);
  const canRespond = permissions.canScopedPermission('survey:respond', ['SELF']);
  const canResults =
    !respondentOnly &&
    permissions.canScopedPermission('survey:results', ['TEAM', 'DEPARTMENT', 'ALL']);
  const client = useGraphClient('client');
  const [adminSurveys, setAdminSurveys] = useState<SurveySummaryRow[]>([]);
  const [available, setAvailable] = useState<SurveySummaryRow[]>([]);
  const [resultsCatalog, setResultsCatalog] = useState<SurveySummaryRow[]>([]);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [survey, setSurvey] = useState<SurveyDetailRow | null>(null);
  const [surveyMode, setSurveyMode] = useState<'admin' | 'respond'>('respond');
  const openedSurvey = useRef<string | null>(null);
  const openRequest = useRef(0);
  const [results, setResults] = useState<SurveyResultsRow | null>(null);
  const [answers, setAnswers] = useState<
    Record<string, { text?: string; numeric?: string; options?: string[] }>
  >({});
  const [draft, setDraft] = useState({ title: '', description: '', threshold: 5 });
  const [questions, setQuestions] = useState<DraftQuestion[]>([blankQuestion()]);
  const [audience, setAudience] = useState<string[]>([]);
  const { run, isBusy, error, notice } = useKeyedAction();

  const load = useCallback(async () => {
    const tasks: Promise<void>[] = [];
    if (canManage) {
      tasks.push(
        client
          .request<{ surveys: SurveySummaryRow[] }>(SurveysAdminDocument)
          .then((value) => setAdminSurveys(value.surveys))
      );
      tasks.push(
        client
          .request<{ departments: Array<{ id: string; name: string }> }>(SurveyDepartmentsDocument)
          .then((value) => setDepartments(value.departments))
      );
    }
    if (canRespond) {
      tasks.push(
        client
          .request<{ availableSurveys: SurveySummaryRow[] }>(AvailableSurveysDocument)
          .then((value) => setAvailable(value.availableSurveys))
      );
    }
    if (canResults && !canManage) {
      tasks.push(
        client
          .request<{ surveyResultsCatalog: SurveySummaryRow[] }>(SurveyResultsCatalogDocument)
          .then((value) => setResultsCatalog(value.surveyResultsCatalog))
      );
    }
    await Promise.all(tasks);
  }, [canManage, canRespond, canResults, client]);

  useEffect(() => {
    void run('load', load, '');
  }, [load, run]);

  const openSurvey = useCallback(
    async (id: string, mode: 'admin' | 'respond') => {
      await run(
        `open:${id}`,
        async () => {
          const requestId = ++openRequest.current;
          const value = await client.request<{ survey: SurveyDetailRow }>(SurveyDetailDocument, {
            id,
          });
          if (requestId !== openRequest.current) return;
          setSurvey(value.survey);
          setSurveyMode(mode);
          if (openedSurvey.current !== id) setAnswers({});
          openedSurvey.current = id;
          setResults(null);
        },
        'Survey opened.'
      );
    },
    [client, run]
  );

  useEffect(() => {
    if (initialSurveyId && canRespond) void openSurvey(initialSurveyId, 'respond');
  }, [initialSurveyId, canRespond, openSurvey]);

  const openResults = async (id: string) => {
    await run(
      `results:${id}`,
      async () => {
        const value = await client.request<{ surveyResults: SurveyResultsRow }>(
          SurveyResultsDocument,
          { id }
        );
        setResults(value.surveyResults);
        setSurvey(null);
      },
      'Aggregate results loaded.'
    );
  };

  const updateQuestion = (index: number, patch: Partial<DraftQuestion>) => {
    setQuestions((current) =>
      current.map((question, itemIndex) =>
        itemIndex === index ? { ...question, ...patch } : question
      )
    );
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-content-primary">
        {respondentOnly ? 'Survey / Feedback' : 'Surveys'}
      </h1>
      <PageInformation title="Survey privacy">
        <p className="text-sm text-content-secondary">
          Employee responses are reported only as privacy-thresholded totals, scores, and comment
          groups.
        </p>
      </PageInformation>
      {notice && (
        <p role="status" className="text-sm text-status-success">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-status-danger">
          {error}
        </p>
      )}

      {canManage && (
        <Card title="Create survey">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-sm">
              Title
              <input
                className={fieldClass}
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              />
            </label>
            <label className="text-sm md:col-span-2">
              Description
              <input
                className={fieldClass}
                value={draft.description}
                onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              />
            </label>
            <label className="text-sm">
              Minimum reporting group
              <input
                type="number"
                min={3}
                className={fieldClass}
                value={draft.threshold}
                onChange={(event) => setDraft({ ...draft, threshold: Number(event.target.value) })}
              />
            </label>
          </div>
          {departments.length > 0 && (
            <fieldset className="mt-3">
              <legend className="text-sm font-medium">
                Audience departments{' '}
                <span className="font-normal text-content-secondary">
                  (none means all employees)
                </span>
              </legend>
              <div className="mt-2 flex flex-wrap gap-3">
                {departments.map((department) => (
                  <label key={department.id} className="text-sm">
                    <input
                      type="checkbox"
                      checked={audience.includes(department.id)}
                      onChange={(event) =>
                        setAudience((current) =>
                          event.target.checked
                            ? [...current, department.id]
                            : current.filter((id) => id !== department.id)
                        )
                      }
                    />{' '}
                    {department.name}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          <div className="mt-4 space-y-3">
            {questions.map((question, index) => (
              <div key={index} className="rounded-md border border-line p-3">
                <div className="grid gap-2 md:grid-cols-4">
                  <label className="text-sm">
                    Area
                    <input
                      className={fieldClass}
                      value={question.dimension}
                      onChange={(event) => updateQuestion(index, { dimension: event.target.value })}
                    />
                  </label>
                  <label className="text-sm md:col-span-2">
                    Question
                    <input
                      className={fieldClass}
                      value={question.prompt}
                      onChange={(event) => updateQuestion(index, { prompt: event.target.value })}
                    />
                  </label>
                  <label className="text-sm">
                    Answer type
                    <select
                      className={fieldClass}
                      value={question.type}
                      onChange={(event) => updateQuestion(index, { type: event.target.value })}
                    >
                      <option value="RATING">Rating 1–5</option>
                      <option value="SINGLE_CHOICE">Single choice</option>
                      <option value="MULTIPLE_CHOICE">Multiple choice</option>
                      <option value="SHORT_TEXT">Short comment</option>
                      <option value="LONG_TEXT">Elaborative comment</option>
                    </select>
                  </label>
                  {(question.type === 'SINGLE_CHOICE' || question.type === 'MULTIPLE_CHOICE') && (
                    <label className="text-sm md:col-span-3">
                      Options (comma separated)
                      <input
                        className={fieldClass}
                        value={question.options}
                        onChange={(event) => updateQuestion(index, { options: event.target.value })}
                      />
                    </label>
                  )}
                </div>
                <div className="mt-2 flex gap-3 text-sm">
                  <label>
                    <input
                      type="checkbox"
                      checked={question.isRequired}
                      onChange={(event) =>
                        updateQuestion(index, { isRequired: event.target.checked })
                      }
                    />{' '}
                    Required
                  </label>
                  {questions.length > 1 && (
                    <Button
                      size="sm"
                      variant="quiet"
                      onClick={() =>
                        setQuestions((current) =>
                          current.filter((_, itemIndex) => itemIndex !== index)
                        )
                      }
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setQuestions((current) => [...current, blankQuestion()])}
            >
              Add question
            </Button>
            <Button
              size="sm"
              busy={isBusy('save-survey')}
              onClick={() =>
                void run(
                  'save-survey',
                  async () => {
                    await client.request(SaveSurveyDocument, {
                      input: {
                        title: draft.title,
                        description: draft.description || null,
                        minimumReportGroupSize: draft.threshold,
                        audienceDepartmentIds: audience,
                        sections: [
                          {
                            title: 'Survey',
                            questions: questions.map((question) => ({
                              dimension: question.dimension,
                              prompt: question.prompt,
                              questionType: question.type,
                              isRequired: question.isRequired,
                              ratingMin: question.type === 'RATING' ? '1' : null,
                              ratingMax: question.type === 'RATING' ? '5' : null,
                              options: question.options
                                .split(',')
                                .map((label) => label.trim())
                                .filter(Boolean)
                                .map((label, optionIndex) => ({
                                  label,
                                  score: String(optionIndex + 1),
                                })),
                            })),
                          },
                        ],
                      },
                    });
                    setDraft({ title: '', description: '', threshold: 5 });
                    setQuestions([blankQuestion()]);
                    setAudience([]);
                    await load();
                  },
                  'Survey saved as a draft.'
                )
              }
            >
              Save draft
            </Button>
          </div>
        </Card>
      )}

      {canManage && (
        <Card title="Survey administration">
          {adminSurveys.length === 0 ? (
            <p className="text-sm text-content-secondary">No surveys created.</p>
          ) : (
            <ul className="divide-y divide-line">
              {adminSurveys.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-content-secondary">
                      {item.status} · reporting threshold {item.minimumReportGroupSize}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void openSurvey(item.id, 'admin')}
                    >
                      View
                    </Button>
                    {item.status === 'DRAFT' && (
                      <Button
                        size="sm"
                        busy={isBusy(`publish:${item.id}`)}
                        onClick={() =>
                          void run(
                            `publish:${item.id}`,
                            async () => {
                              await client.request(PublishSurveyDocument, { id: item.id });
                              await load();
                            },
                            'Survey published and assigned to eligible employees.'
                          )
                        }
                      >
                        Publish
                      </Button>
                    )}
                    {item.status === 'PUBLISHED' && (
                      <Button
                        busy={isBusy(`close:${item.id}`)}
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          void run(
                            `close:${item.id}`,
                            async () => {
                              await client.request(CloseSurveyDocument, { id: item.id });
                              await load();
                            },
                            'Survey closed.'
                          )
                        }
                      >
                        Close
                      </Button>
                    )}
                    {canResults && item.status !== 'DRAFT' && (
                      <Button size="sm" variant="quiet" onClick={() => void openResults(item.id)}>
                        Aggregate results
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {canRespond && !initialSurveyId && (
        <Card title="My surveys">
          {available.length === 0 ? (
            <p className="text-sm text-content-secondary">No surveys assigned.</p>
          ) : (
            <ul className="divide-y divide-line">
              {available.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-content-secondary">
                      {item.completed ? 'Submitted' : item.status}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    busy={isBusy(`open:${item.id}`)}
                    disabled={!canFillSurvey(item)}
                    onClick={() => void openSurvey(item.id, 'respond')}
                  >
                    {item.completed ? 'Completed' : 'Fill survey'}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {canResults && !canManage && (
        <Card title="Survey reports">
          {resultsCatalog.length === 0 ? (
            <p className="text-sm text-content-secondary">
              No published survey results are available.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {resultsCatalog.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-content-secondary">
                      {item.status} · privacy threshold {item.minimumReportGroupSize}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => void openResults(item.id)}>
                    Aggregate results
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {survey && (
        <Card title={survey.summary.title}>
          {survey.summary.description && (
            <p className="mb-3 text-sm text-content-secondary">{survey.summary.description}</p>
          )}
          <div className="space-y-4">
            {survey.sections.map((section) => (
              <section key={section.id}>
                <h2 className="font-semibold">{section.title}</h2>
                <div className="mt-2 space-y-3">
                  {section.questions.map((question) => (
                    <SurveyQuestionControl
                      key={question.id}
                      question={question}
                      value={answers[question.id] ?? {}}
                      onChange={(value) =>
                        setAnswers((current) => ({ ...current, [question.id]: value }))
                      }
                      readOnly={surveyMode !== 'respond' || !canRespond || survey.summary.completed}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
          {surveyMode === 'respond' &&
            canRespond &&
            !survey.summary.completed &&
            canFillSurvey(survey.summary) && (
              <Button
                className="mt-4"
                busy={isBusy('submit-survey')}
                onClick={() =>
                  void run(
                    'submit-survey',
                    async () => {
                      const payload = survey.sections
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
                          (answer) =>
                            answer.selectedOptionIds.length > 0 ||
                            answer.numericAnswer ||
                            answer.textAnswer
                        );
                      await client.request(SubmitSurveyDocument, {
                        id: survey.summary.id,
                        answers: payload,
                      });
                      setSurvey((current) =>
                        current && current.summary.id === survey.summary.id
                          ? { ...current, summary: { ...current.summary, completed: true } }
                          : current
                      );
                      setAvailable((current) =>
                        current.map((item) =>
                          item.id === survey.summary.id ? { ...item, completed: true } : item
                        )
                      );
                    },
                    'Survey submitted anonymously.'
                  )
                }
              >
                Submit survey
              </Button>
            )}
        </Card>
      )}

      {results && (
        <Card title="Aggregate survey results">
          {results.suppressed ? (
            <p className="text-sm text-content-secondary">
              Results remain hidden until at least {results.minimumReportGroupSize} responses are
              available in your authorized group.
            </p>
          ) : (
            <>
              <p className="text-sm text-content-secondary">
                {results.respondentCount} qualifying responses. No respondent identities are
                available.
              </p>
              <h2 className="mt-4 font-semibold">Scores by area</h2>
              <ul className="mt-2 grid gap-2 md:grid-cols-3">
                {results.dimensions.map((item) => (
                  <li key={item.dimension} className="rounded-md bg-surface-selected p-3">
                    <p className="text-sm font-medium">{item.dimension}</p>
                    <p className="text-2xl font-semibold">{item.averageScore ?? 'Hidden'}</p>
                  </li>
                ))}
              </ul>
              <h2 className="mt-4 font-semibold">Question results and comments</h2>
              <div className="mt-2 space-y-3">
                {results.questions.map((item) => (
                  <div key={item.questionId} className="rounded-md border border-line p-3">
                    <p className="font-medium">{item.prompt}</p>
                    <p className="text-sm text-content-secondary">
                      {item.responseCount
                        ? `${item.responseCount} responses${item.averageScore ? ` · average ${item.averageScore}` : ''}`
                        : 'Hidden below privacy threshold'}
                    </p>
                    {item.options.length > 0 && (
                      <ul className="mt-2 text-sm">
                        {item.options.map((option) => (
                          <li key={option.optionId}>
                            {option.label}: {option.responseCount}
                          </li>
                        ))}
                      </ul>
                    )}
                    {item.comments.length > 0 && (
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                        {item.comments.map((comment, index) => (
                          <li key={index}>{comment}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
};

const SurveyQuestionControl = ({
  question,
  value,
  onChange,
  readOnly,
}: {
  question: SurveyQuestionRow;
  value: { text?: string; numeric?: string; options?: string[] };
  onChange: (value: { text?: string; numeric?: string; options?: string[] }) => void;
  readOnly: boolean;
}) => (
  <fieldset disabled={readOnly} className="rounded-md border border-line p-3">
    <legend className="px-1 text-sm font-medium">
      {question.prompt}
      {question.isRequired ? ' *' : ''}
    </legend>
    <p className="mb-2 text-xs text-content-secondary">Area: {question.dimension}</p>
    {question.questionType === 'RATING' && (
      <input
        aria-label={`${question.prompt} rating`}
        type="number"
        min={question.ratingMin ?? 1}
        max={question.ratingMax ?? 5}
        step="0.1"
        className={fieldClass}
        value={value.numeric ?? ''}
        onChange={(event) => onChange({ numeric: event.target.value })}
      />
    )}
    {(question.questionType === 'SHORT_TEXT' || question.questionType === 'LONG_TEXT') && (
      <textarea
        className={fieldClass}
        rows={question.questionType === 'LONG_TEXT' ? 4 : 2}
        value={value.text ?? ''}
        onChange={(event) => onChange({ text: event.target.value })}
      />
    )}
    {(question.questionType === 'SINGLE_CHOICE' || question.questionType === 'MULTIPLE_CHOICE') && (
      <div className="space-y-2">
        {question.options.map((option) => {
          const checked = value.options?.includes(option.id) ?? false;
          return (
            <label key={option.id} className="block text-sm">
              <input
                type={question.questionType === 'SINGLE_CHOICE' ? 'radio' : 'checkbox'}
                name={question.id}
                checked={checked}
                onChange={(event) => {
                  const current = value.options ?? [];
                  onChange({
                    options:
                      question.questionType === 'SINGLE_CHOICE'
                        ? event.target.checked
                          ? [option.id]
                          : []
                        : event.target.checked
                          ? [...current, option.id]
                          : current.filter((id) => id !== option.id),
                  });
                }}
              />{' '}
              {option.label}
            </label>
          );
        })}
      </div>
    )}
  </fieldset>
);

export default SurveysPage;
