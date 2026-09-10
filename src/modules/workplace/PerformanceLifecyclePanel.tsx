import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useGraphClient } from '../../hooks/useGraphClient';
import { useKeyedAction } from '../../hooks/useKeyedAction';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

import {
  AcknowledgePerformanceReviewDocument,
  ActivatePerformanceProgramDocument,
  AddPerformanceFeedbackDocument,
  AdvancePerformanceCycleDocument,
  AppraisalTemplatesDocument,
  ApprovePerformanceGoalsDocument,
  LaunchPerformanceCycleDocument,
  MyPerformanceReviewsDocument,
  PerformanceProgramsDocument,
  PerformanceReviewDetailDocument,
  ProposePerformanceGoalDocument,
  PublishAppraisalTemplateDocument,
  SaveAppraisalTemplateDocument,
  SavePerformanceProgramDocument,
  SubmitManagerAppraisalDocument,
  SubmitSelfAppraisalDocument,
  TeamPerformanceReviewsDocument,
  type AppraisalQuestionRow,
  type AppraisalTemplateRow,
  type PerformanceProgramRow,
  type PerformanceReviewDetailRow,
  type PerformanceReviewRow,
} from './performanceLifecycleQueries';

const fieldClass =
  'min-h-10 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-content-primary';

interface Props {
  canManage: boolean;
  canEvaluate: boolean;
  canSelf: boolean;
  actorEmployeeId?: string;
  tab: string;
  initialReviewId?: string | null;
}

interface DraftQuestion {
  key: string;
  parentKey: string;
  prompt: string;
  type: string;
  answerer: string;
  isRequired: boolean;
  selfRating: boolean;
  managerRating: boolean;
  options: string;
}

const blankQuestion = (index: number): DraftQuestion => ({
  key: `q${index}`,
  parentKey: '',
  prompt: '',
  type: 'LONG_TEXT',
  answerer: 'BOTH',
  isRequired: true,
  selfRating: true,
  managerRating: true,
  options: '',
});

const PerformanceLifecyclePanel = ({
  canManage,
  canEvaluate,
  canSelf,
  actorEmployeeId,
  tab,
  initialReviewId,
}: Props) => {
  const client = useGraphClient('client');
  const [programs, setPrograms] = useState<PerformanceProgramRow[]>([]);
  const [templates, setTemplates] = useState<AppraisalTemplateRow[]>([]);
  const [selfReviews, setSelfReviews] = useState<PerformanceReviewRow[]>([]);
  const [teamReviews, setTeamReviews] = useState<PerformanceReviewRow[]>([]);
  const [detail, setDetail] = useState<PerformanceReviewDetailRow | null>(null);
  const [selectedProgram, setSelectedProgram] = useState('');

  const { run, isBusy, error, notice, setError } = useKeyedAction();
  const showSetup = canManage && tab === 'setup';
  const showProcess = canManage && tab === 'process';
  const showAdmin = showSetup || showProcess;
  const showTeam =
    (canEvaluate || canManage) && (tab === 'team' || tab === 'review' || showProcess);
  const showSelf = canSelf && tab === 'my';
  const detailRequest = useRef(0);
  const selectedReviewId = useRef<string | null>(null);
  const templateRequest = useRef(0);
  const [programDraft, setProgramDraft] = useState({
    name: '',
    cadence: 'QUARTERLY',
    anchorDate: new Date().toISOString().slice(0, 10),
    includeCalibration: false,
    includeAcknowledgement: true,
  });
  const [templateName, setTemplateName] = useState('Standard appraisal');
  const [questions, setQuestions] = useState<DraftQuestion[]>([blankQuestion(1)]);
  const [periodDate, setPeriodDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [goal, setGoal] = useState({ title: '', weightage: '' });
  const [feedback, setFeedback] = useState('');
  const [finalRating, setFinalRating] = useState('');
  const [performanceBand, setPerformanceBand] = useState('');
  const [responses, setResponses] = useState<
    Partial<Record<string, { text?: string; rating?: string; options?: string[] }>>
  >({});

  const loadReviews = useCallback(async () => {
    const tasks: Promise<void>[] = [];
    if (showSelf) {
      tasks.push(
        client
          .request<{ myPerformanceReviews: PerformanceReviewRow[] }>(MyPerformanceReviewsDocument)
          .then((result) => setSelfReviews(result.myPerformanceReviews))
      );
    }
    if (showTeam) {
      tasks.push(
        client
          .request<{
            myTeamPerformanceReviews: PerformanceReviewRow[];
          }>(TeamPerformanceReviewsDocument)
          .then((result) => setTeamReviews(result.myTeamPerformanceReviews))
      );
    }
    await Promise.all(tasks);
  }, [showSelf, showTeam, client]);

  const loadPrograms = useCallback(async () => {
    if (!showAdmin) return;
    const result = await client.request<{ performancePrograms: PerformanceProgramRow[] }>(
      PerformanceProgramsDocument
    );
    setPrograms(result.performancePrograms);
    setSelectedProgram((current) => current || result.performancePrograms[0]?.id || '');
  }, [showAdmin, client]);

  useEffect(() => {
    void run(`reviews:${tab}`, loadReviews, '');
  }, [loadReviews, run, tab]);
  useEffect(() => {
    void run('programs', loadPrograms, '');
  }, [loadPrograms, run]);

  const loadTemplates = useCallback(async () => {
    const requestId = ++templateRequest.current;
    if (!selectedProgram || !showAdmin) {
      setTemplates([]);
      return;
    }
    const result = await client.request<{ appraisalTemplates: AppraisalTemplateRow[] }>(
      AppraisalTemplatesDocument,
      { programId: selectedProgram }
    );
    if (requestId !== templateRequest.current) return;
    setTemplates(result.appraisalTemplates);
    setSelectedTemplate((current) =>
      result.appraisalTemplates.some((item) => item.id === current && item.status === 'PUBLISHED')
        ? current
        : ''
    );
  }, [showAdmin, client, selectedProgram]);

  useEffect(() => {
    void loadTemplates().catch((cause) => setError(graphQlUserMessage(cause)));
  }, [loadTemplates, setError]);

  const loadReviewDetail = useCallback(
    async (id: string, resetDraft = false) => {
      if (resetDraft) selectedReviewId.current = id;
      const requestId = ++detailRequest.current;
      const result = await client.request<{ performanceReviewDetail: PerformanceReviewDetailRow }>(
        PerformanceReviewDetailDocument,
        { participantId: id }
      );
      setSelfReviews((rows) =>
        rows.map((row) => (row.id === id ? result.performanceReviewDetail.review : row))
      );
      setTeamReviews((rows) =>
        rows.map((row) => (row.id === id ? result.performanceReviewDetail.review : row))
      );
      if (requestId !== detailRequest.current || selectedReviewId.current !== id) return;
      setDetail(result.performanceReviewDetail);
      if (resetDraft) {
        setResponses({});
        setGoal({ title: '', weightage: '' });
        setFeedback('');
        setFinalRating('');
        setPerformanceBand('');
      }
    },
    [client]
  );

  const openReview = (id: string) =>
    run(`open:${id}`, () => loadReviewDetail(id, detail?.review.id !== id), '');
  useEffect(() => {
    if (initialReviewId && (showSelf || showTeam))
      void run(`open:${initialReviewId}`, () => loadReviewDetail(initialReviewId, true), '');
  }, [initialReviewId, showSelf, showTeam, loadReviewDetail, run]);

  const activeProgram = programs.find((program) => program.id === selectedProgram);
  const publishedTemplates = templates.filter(
    (template) =>
      template.performanceProgramId === selectedProgram && template.status === 'PUBLISHED'
  );
  const launchTemplateId = selectedTemplate || publishedTemplates[0]?.id || '';
  const allReviews = useMemo(() => {
    const rows = new Map<string, { row: PerformanceReviewRow; lane: 'self' | 'team' }>();
    if (showSelf) selfReviews.forEach((row) => rows.set(row.id, { row, lane: 'self' }));
    if (showTeam)
      teamReviews
        .filter((row) => showProcess || row.employeeId !== actorEmployeeId)
        .forEach((row) =>
          rows.set(row.id, { row, lane: row.employeeId === actorEmployeeId ? 'self' : 'team' })
        );
    return [...rows.values()];
  }, [selfReviews, teamReviews, showSelf, showTeam, showProcess, actorEmployeeId]);

  const answerPayload = (role: 'EMPLOYEE' | 'MANAGER') => {
    if (!detail) return [];
    return detail.template.sections
      .flatMap((section) => section.questions)
      .filter((question) => question.answerer === role || question.answerer === 'BOTH')
      .map((question) => ({
        questionId: question.id,
        textAnswer: responses[question.id]?.text?.trim() || null,
        rating: responses[question.id]?.rating?.trim() || null,
        selectedOptionIds: responses[question.id]?.options ?? [],
      }));
  };

  const updateQuestion = (index: number, patch: Partial<DraftQuestion>) => {
    setQuestions((current) =>
      current.map((question, questionIndex) =>
        questionIndex === index ? { ...question, ...patch } : question
      )
    );
  };

  return (
    <div className="space-y-4">
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

      {showSetup && (
        <Card title="Performance programs">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-sm">
              Process name
              <input
                className={fieldClass}
                value={programDraft.name}
                onChange={(event) => setProgramDraft({ ...programDraft, name: event.target.value })}
              />
            </label>
            <label className="text-sm">
              Cadence
              <select
                className={fieldClass}
                value={programDraft.cadence}
                onChange={(event) =>
                  setProgramDraft({ ...programDraft, cadence: event.target.value })
                }
              >
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="YEARLY">Yearly</option>
                <option value="MANUAL">Manual</option>
              </select>
            </label>
            <label className="text-sm">
              Anchor date
              <input
                type="date"
                className={fieldClass}
                value={programDraft.anchorDate}
                onChange={(event) =>
                  setProgramDraft({ ...programDraft, anchorDate: event.target.value })
                }
              />
            </label>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <label>
              <input
                type="checkbox"
                checked={programDraft.includeCalibration}
                onChange={(event) =>
                  setProgramDraft({ ...programDraft, includeCalibration: event.target.checked })
                }
              />{' '}
              HR calibration
            </label>
            <label>
              <input
                type="checkbox"
                checked={programDraft.includeAcknowledgement}
                onChange={(event) =>
                  setProgramDraft({ ...programDraft, includeAcknowledgement: event.target.checked })
                }
              />{' '}
              Employee acknowledgement
            </label>
            <Button
              size="sm"
              busy={isBusy('save-program')}
              onClick={() =>
                void run(
                  'save-program',
                  async () => {
                    await client.request(SavePerformanceProgramDocument, {
                      input: {
                        name: programDraft.name,
                        cadence: programDraft.cadence,
                        anchorDate: programDraft.anchorDate,
                        includeCalibration: programDraft.includeCalibration,
                        includeAcknowledgement: programDraft.includeAcknowledgement,
                        goalWeightRequired: '100',
                        ratingMin: '1',
                        ratingMax: '5',
                      },
                    });
                    setProgramDraft({ ...programDraft, name: '' });
                    await loadPrograms();
                  },
                  'Performance process saved.'
                )
              }
            >
              Save process
            </Button>
          </div>
          {programs.length > 0 && (
            <div className="mt-4 space-y-2">
              <label className="text-sm">
                Configure process
                <select
                  className={fieldClass}
                  value={selectedProgram}
                  onChange={(event) => setSelectedProgram(event.target.value)}
                >
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name} · {program.cadence} · {program.status}
                    </option>
                  ))}
                </select>
              </label>
              {activeProgram?.status === 'DRAFT' && (
                <Button
                  size="sm"
                  variant="outline"
                  busy={isBusy(`activate-program:${selectedProgram}`)}
                  onClick={() =>
                    void run(
                      `activate-program:${selectedProgram}`,
                      async () => {
                        await client.request(ActivatePerformanceProgramDocument, {
                          id: selectedProgram,
                        });
                        await loadPrograms();
                      },
                      'Performance process activated.'
                    )
                  }
                >
                  Activate process
                </Button>
              )}
            </div>
          )}
        </Card>
      )}

      {showSetup && selectedProgram && (
        <Card title="Appraisal questionnaire">
          <label className="text-sm">
            Template name
            <input
              className={fieldClass}
              value={templateName}
              onChange={(event) => setTemplateName(event.target.value)}
            />
          </label>
          <div className="mt-3 space-y-3">
            {questions.map((question, index) => (
              <div key={question.key} className="rounded-md border border-line p-3">
                <div className="grid gap-2 md:grid-cols-3">
                  <label className="text-sm md:col-span-2">
                    Question
                    <input
                      className={fieldClass}
                      value={question.prompt}
                      onChange={(event) => updateQuestion(index, { prompt: event.target.value })}
                    />
                  </label>
                  <label className="text-sm">
                    Type
                    <select
                      className={fieldClass}
                      value={question.type}
                      onChange={(event) => updateQuestion(index, { type: event.target.value })}
                    >
                      <option value="LONG_TEXT">Elaborative</option>
                      <option value="SHORT_TEXT">Short text</option>
                      <option value="RATING">Rating</option>
                      <option value="SINGLE_CHOICE">Single choice</option>
                      <option value="MULTIPLE_CHOICE">Multiple choice</option>
                    </select>
                  </label>
                  <label className="text-sm">
                    Answered by
                    <select
                      className={fieldClass}
                      value={question.answerer}
                      onChange={(event) => updateQuestion(index, { answerer: event.target.value })}
                    >
                      <option value="BOTH">Employee and manager</option>
                      <option value="EMPLOYEE">Employee</option>
                      <option value="MANAGER">Manager</option>
                    </select>
                  </label>
                  <label className="text-sm">
                    Subquestion of
                    <select
                      className={fieldClass}
                      value={question.parentKey}
                      onChange={(event) => updateQuestion(index, { parentKey: event.target.value })}
                    >
                      <option value="">Top-level question</option>
                      {questions
                        .slice(0, index)
                        .filter((candidate) => !candidate.parentKey)
                        .map((candidate) => (
                          <option key={candidate.key} value={candidate.key}>
                            {candidate.prompt || candidate.key}
                          </option>
                        ))}
                    </select>
                  </label>
                  {(question.type === 'SINGLE_CHOICE' || question.type === 'MULTIPLE_CHOICE') && (
                    <label className="text-sm">
                      Options (comma separated)
                      <input
                        className={fieldClass}
                        value={question.options}
                        onChange={(event) => updateQuestion(index, { options: event.target.value })}
                      />
                    </label>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-4 text-sm">
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
                  <label>
                    <input
                      type="checkbox"
                      checked={question.selfRating}
                      onChange={(event) =>
                        updateQuestion(index, { selfRating: event.target.checked })
                      }
                    />{' '}
                    Self rating
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={question.managerRating}
                      onChange={(event) =>
                        updateQuestion(index, { managerRating: event.target.checked })
                      }
                    />{' '}
                    Manager rating
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
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setQuestions((current) => [...current, blankQuestion(current.length + 1)])
              }
            >
              Add question
            </Button>
            <Button
              size="sm"
              busy={isBusy(`save-template:${selectedProgram}`)}
              onClick={() =>
                void run(
                  `save-template:${selectedProgram}`,
                  async () => {
                    await client.request(SaveAppraisalTemplateDocument, {
                      input: {
                        performanceProgramId: selectedProgram,
                        name: templateName,
                        sections: [
                          {
                            title: 'Appraisal',
                            questions: questions.map((question) => ({
                              clientKey: question.key,
                              parentClientKey: question.parentKey || null,
                              questionType: question.type,
                              prompt: question.prompt,
                              isRequired: question.isRequired,
                              answerer: question.answerer,
                              selfRatingEnabled: question.selfRating,
                              managerRatingEnabled: question.managerRating,
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
                    await loadTemplates();
                  },
                  'Appraisal template saved.'
                )
              }
            >
              Save template
            </Button>
          </div>
          {templates.length > 0 && (
            <ul className="mt-4 divide-y divide-line">
              {templates
                .filter((template) => template.performanceProgramId === selectedProgram)
                .map((template) => (
                  <li
                    key={template.id}
                    className="flex items-center justify-between gap-3 py-2 text-sm"
                  >
                    <span>
                      {template.name} v{template.version} · {template.status}
                    </span>
                    {template.status === 'DRAFT' && (
                      <Button
                        busy={isBusy(`publish:${template.id}`)}
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          void run(
                            `publish:${template.id}`,
                            async () => {
                              await client.request(PublishAppraisalTemplateDocument, {
                                id: template.id,
                              });
                              await loadTemplates();
                            },
                            'Template published.'
                          )
                        }
                      >
                        Publish
                      </Button>
                    )}
                  </li>
                ))}
            </ul>
          )}
        </Card>
      )}

      {showProcess && (
        <Card title="Process">
          <label className="text-sm">
            Performance program
            <select
              className={fieldClass}
              value={selectedProgram}
              onChange={(event) => {
                setSelectedProgram(event.target.value);
                setSelectedTemplate('');
              }}
            >
              <option value="">Select program</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name} · {program.status}
                </option>
              ))}
            </select>
          </label>
          {(!activeProgram || activeProgram.status !== 'ACTIVE' || !publishedTemplates.length) && (
            <p className="mt-3 text-sm text-content-secondary">
              Activate a program and publish its appraisal template in Setup before launching a
              cycle.
            </p>
          )}
        </Card>
      )}

      {showProcess && activeProgram?.status === 'ACTIVE' && publishedTemplates.length > 0 && (
        <Card title="Launch appraisal cycle">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-sm">
              Published template
              <select
                className={fieldClass}
                value={launchTemplateId}
                onChange={(event) => setSelectedTemplate(event.target.value)}
              >
                {publishedTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} v{template.version}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Period date
              <input
                type="date"
                className={fieldClass}
                value={periodDate}
                onChange={(event) => setPeriodDate(event.target.value)}
              />
            </label>
            <div className="self-end">
              <Button
                busy={isBusy(`launch-cycle:${selectedProgram}`)}
                onClick={() =>
                  void run(
                    `launch-cycle:${selectedProgram}`,
                    async () => {
                      await client.request(LaunchPerformanceCycleDocument, {
                        input: {
                          performanceProgramId: selectedProgram,
                          appraisalTemplateId: launchTemplateId,
                          periodDate,
                        },
                      });
                      await loadReviews();
                    },
                    'Appraisal cycle launched for eligible employees.'
                  )
                }
              >
                Launch cycle
              </Button>
            </div>
          </div>
        </Card>
      )}

      {(showSelf || showTeam) && (
        <Card title={showSelf ? 'My Performance' : showProcess ? 'Cycle progress' : 'Team reviews'}>
          {isBusy(`reviews:${tab}`) ? (
            <p role="status">Loading reviews…</p>
          ) : allReviews.length === 0 ? (
            <p className="text-sm text-content-secondary">No assigned performance reviews.</p>
          ) : (
            <ul className="divide-y divide-line">
              {allReviews.map(({ row, lane }) => (
                <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium">
                      {row.employeeName} · {row.cycleName}
                    </p>
                    <p className="text-xs text-content-secondary">
                      {row.cycleStage.replace(/_/g, ' ')} · {row.status}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {showProcess && lane === 'self' ? (
                      canSelf && (
                        <Link
                          className="rounded-md border border-line px-3 py-2 text-sm text-accent"
                          to={`/performance?tab=my&review=${encodeURIComponent(row.id)}`}
                        >
                          Open my review
                        </Link>
                      )
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        busy={isBusy(`open:${row.id}`)}
                        onClick={() => void openReview(row.id)}
                      >
                        Open {lane === 'self' ? 'my review' : 'evaluation'}
                      </Button>
                    )}
                    {canManage &&
                      (showProcess || tab === 'review') &&
                      row.cycleStage !== 'CLOSED' && (
                        <Button
                          busy={isBusy(`advance:${row.reviewCycleId}`)}
                          size="sm"
                          variant="quiet"
                          onClick={() =>
                            void run(
                              `advance:${row.reviewCycleId}`,
                              async () => {
                                await client.request(AdvancePerformanceCycleDocument, {
                                  id: row.reviewCycleId,
                                });
                                await loadReviews();
                                if (detail?.review.reviewCycleId === row.reviewCycleId)
                                  await loadReviewDetail(detail.review.id);
                              },
                              'Cycle moved to its next configured step.'
                            )
                          }
                        >
                          {row.cycleStage === 'HR_CALIBRATION'
                            ? 'Complete calibration'
                            : row.cycleStage === 'EMPLOYEE_ACKNOWLEDGEMENT'
                              ? 'Close cycle'
                              : 'Advance cycle'}
                        </Button>
                      )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {detail &&
        ((showSelf && detail.review.employeeId === actorEmployeeId) ||
          (showTeam && detail.review.employeeId !== actorEmployeeId)) && (
          <Card title={`${detail.review.employeeName} · ${detail.review.cycleName}`}>
            <p className="text-sm text-content-secondary">
              Stage: {detail.review.cycleStage.replace(/_/g, ' ')}
            </p>
            {detail.review.finalRating && (
              <p className="mt-2 text-sm">
                Final rating: {detail.review.finalRating}
                {detail.review.performanceBand ? ` · ${detail.review.performanceBand}` : ''}
              </p>
            )}
            <h3 className="mt-4 font-semibold">Goals</h3>
            {detail.goals.length ? (
              <ul className="mt-2 divide-y divide-line">
                {detail.goals.map((item) => (
                  <li key={item.id} className="py-2 text-sm">
                    {item.title} · {item.weightage ?? '0'}% · {item.status}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-content-secondary">No goals proposed.</p>
            )}
            {canSelf &&
              detail.review.employeeId === actorEmployeeId &&
              detail.review.cycleStage === 'GOAL_SETTING' && (
                <div className="mt-3 grid gap-2 md:grid-cols-[1fr_8rem_auto]">
                  <input
                    aria-label="Goal title"
                    placeholder="Goal"
                    className={fieldClass}
                    value={goal.title}
                    onChange={(event) => setGoal({ ...goal, title: event.target.value })}
                  />
                  <input
                    aria-label="Goal weight"
                    placeholder="Weight %"
                    className={fieldClass}
                    value={goal.weightage}
                    onChange={(event) => setGoal({ ...goal, weightage: event.target.value })}
                  />
                  <Button
                    busy={isBusy(`add-goal:${detail.review.id}`)}
                    onClick={() =>
                      void run(
                        `add-goal:${detail.review.id}`,
                        async () => {
                          await client.request(ProposePerformanceGoalDocument, {
                            input: {
                              participantId: detail.review.id,
                              title: goal.title,
                              weightage: goal.weightage,
                            },
                          });
                          if (selectedReviewId.current === detail.review.id)
                            setGoal({ title: '', weightage: '' });
                          await loadReviewDetail(detail.review.id);
                        },
                        'Goal proposed.'
                      )
                    }
                  >
                    Add goal
                  </Button>
                </div>
              )}
            {(canEvaluate || canManage) &&
              detail.review.employeeId !== actorEmployeeId &&
              detail.review.cycleStage === 'GOAL_SETTING' && (
                <Button
                  busy={isBusy(`approve-goals:${detail.review.id}`)}
                  className="mt-3"
                  size="sm"
                  onClick={() =>
                    void run(
                      `approve-goals:${detail.review.id}`,
                      async () => {
                        await client.request(ApprovePerformanceGoalsDocument, {
                          id: detail.review.id,
                        });
                        await loadReviewDetail(detail.review.id);
                      },
                      'Goals approved.'
                    )
                  }
                >
                  Approve goals
                </Button>
              )}

            <h3 className="mt-5 font-semibold">Manager feedback</h3>
            {detail.feedback.map((item) => (
              <p key={item.id} className="mt-2 rounded-md bg-surface-selected p-3 text-sm">
                <span className="font-medium">{item.observationDate}</span> · {item.comments}
              </p>
            ))}
            {(canEvaluate || canManage) && detail.review.employeeId !== actorEmployeeId && (
              <div className="mt-3 flex gap-2">
                <input
                  aria-label="Performance feedback"
                  className={fieldClass}
                  placeholder="Specific feedback against goals or observed work"
                  value={feedback}
                  onChange={(event) => setFeedback(event.target.value)}
                />
                <Button
                  busy={isBusy(`add-feedback:${detail.review.id}`)}
                  onClick={() =>
                    void run(
                      `add-feedback:${detail.review.id}`,
                      async () => {
                        await client.request(AddPerformanceFeedbackDocument, {
                          input: {
                            participantId: detail.review.id,
                            observationDate: new Date().toISOString().slice(0, 10),
                            comments: feedback,
                          },
                        });
                        if (selectedReviewId.current === detail.review.id) setFeedback('');
                        await loadReviewDetail(detail.review.id);
                      },
                      'Feedback recorded and visible to the employee.'
                    )
                  }
                >
                  Add feedback
                </Button>
              </div>
            )}

            {detail.template.sections.length > 0 && (
              <div className="mt-5 space-y-4">
                <h3 className="font-semibold">Appraisal questions</h3>
                {detail.template.sections
                  .flatMap((section) => section.questions)
                  .filter((question) => {
                    if (
                      detail.review.cycleStage !== 'SELF_REVIEW' &&
                      detail.review.cycleStage !== 'MANAGER_REVIEW'
                    )
                      return true;
                    const role =
                      detail.review.cycleStage === 'SELF_REVIEW' ? 'EMPLOYEE' : 'MANAGER';
                    return question.answerer === role || question.answerer === 'BOTH';
                  })
                  .map((question) => (
                    <QuestionAnswer
                      key={question.id}
                      question={question}
                      reviewerRole={
                        detail.review.cycleStage === 'SELF_REVIEW'
                          ? 'EMPLOYEE'
                          : detail.review.cycleStage === 'MANAGER_REVIEW'
                            ? 'MANAGER'
                            : null
                      }
                      value={responses[question.id] ?? {}}
                      employeeAnswer={detail.answers.find(
                        (answer) => answer.questionId === question.id
                      )}
                      readOnly={
                        !(
                          (detail.review.cycleStage === 'SELF_REVIEW' &&
                            canSelf &&
                            detail.review.employeeId === actorEmployeeId &&
                            !detail.review.selfSubmittedAt) ||
                          (detail.review.cycleStage === 'MANAGER_REVIEW' &&
                            (canEvaluate || canManage) &&
                            detail.review.employeeId !== actorEmployeeId &&
                            !detail.review.managerSubmittedAt)
                        )
                      }
                      onChange={(value) =>
                        setResponses((current) => ({ ...current, [question.id]: value }))
                      }
                    />
                  ))}
                {detail.review.cycleStage === 'SELF_REVIEW' &&
                  canSelf &&
                  detail.review.employeeId === actorEmployeeId &&
                  !detail.review.selfSubmittedAt && (
                    <Button
                      busy={isBusy(`submit-self:${detail.review.id}`)}
                      onClick={() =>
                        void run(
                          `submit-self:${detail.review.id}`,
                          async () => {
                            await client.request(SubmitSelfAppraisalDocument, {
                              id: detail.review.id,
                              answers: answerPayload('EMPLOYEE'),
                            });
                            await loadReviewDetail(detail.review.id);
                          },
                          'Self-appraisal submitted.'
                        )
                      }
                    >
                      Submit self-appraisal
                    </Button>
                  )}
                {detail.review.cycleStage === 'MANAGER_REVIEW' &&
                  (canEvaluate || canManage) &&
                  detail.review.employeeId !== actorEmployeeId &&
                  !detail.review.managerSubmittedAt && (
                    <div className="grid gap-2 md:grid-cols-[8rem_1fr_auto]">
                      <input
                        aria-label="Final rating"
                        className={fieldClass}
                        placeholder="Rating"
                        value={finalRating}
                        onChange={(event) => setFinalRating(event.target.value)}
                      />
                      <input
                        aria-label="Performance band"
                        className={fieldClass}
                        placeholder="Performance band (optional)"
                        value={performanceBand}
                        onChange={(event) => setPerformanceBand(event.target.value)}
                      />
                      <Button
                        busy={isBusy(`submit-manager:${detail.review.id}`)}
                        onClick={() =>
                          void run(
                            `submit-manager:${detail.review.id}`,
                            async () => {
                              await client.request(SubmitManagerAppraisalDocument, {
                                id: detail.review.id,
                                answers: answerPayload('MANAGER'),
                                rating: finalRating,
                                band: performanceBand || null,
                              });
                              await loadReviewDetail(detail.review.id);
                            },
                            'Manager appraisal submitted.'
                          )
                        }
                      >
                        Submit manager rating
                      </Button>
                    </div>
                  )}
              </div>
            )}
            {detail.review.cycleStage === 'EMPLOYEE_ACKNOWLEDGEMENT' &&
              canSelf &&
              detail.review.employeeId === actorEmployeeId &&
              !detail.review.acknowledgedAt && (
                <Button
                  busy={isBusy(`acknowledge:${detail.review.id}`)}
                  className="mt-4"
                  onClick={() =>
                    void run(
                      `acknowledge:${detail.review.id}`,
                      async () => {
                        await client.request(AcknowledgePerformanceReviewDocument, {
                          id: detail.review.id,
                          comment: null,
                        });
                        await loadReviewDetail(detail.review.id);
                      },
                      'Appraisal acknowledged.'
                    )
                  }
                >
                  Acknowledge appraisal
                </Button>
              )}
          </Card>
        )}
    </div>
  );
};

const QuestionAnswer = ({
  question,
  reviewerRole,
  value,
  employeeAnswer,
  readOnly,
  onChange,
}: {
  question: AppraisalQuestionRow;
  reviewerRole: 'EMPLOYEE' | 'MANAGER' | null;
  value: { text?: string; rating?: string; options?: string[] };
  employeeAnswer?: PerformanceReviewDetailRow['answers'][number];
  readOnly: boolean;
  onChange: (value: { text?: string; rating?: string; options?: string[] }) => void;
}) => {
  const isChoice =
    question.questionType === 'SINGLE_CHOICE' || question.questionType === 'MULTIPLE_CHOICE';
  const employeeChoiceLabels = question.options
    .filter((option) => employeeAnswer?.employeeSelectedOptionIds.includes(option.id))
    .map((option) => option.label);
  const employeeResponse = [
    employeeAnswer?.employeeTextAnswer,
    employeeChoiceLabels.length > 0 ? employeeChoiceLabels.join(', ') : undefined,
    employeeAnswer?.selfRating ? `Rating: ${employeeAnswer.selfRating}` : undefined,
  ].filter((item): item is string => Boolean(item));
  const managerResponse = [
    employeeAnswer?.managerTextAnswer,
    question.options
      .filter((option) => employeeAnswer?.managerSelectedOptionIds.includes(option.id))
      .map((option) => option.label)
      .join(', '),
    employeeAnswer?.managerRating ? `Rating: ${employeeAnswer.managerRating}` : undefined,
  ].filter(Boolean);
  return (
    <fieldset className="rounded-md border border-line p-3">
      <legend className="px-1 text-sm font-medium">
        {question.prompt}
        {question.isRequired ? ' *' : ''}
      </legend>
      {employeeResponse.length > 0 && (
        <p className="mb-2 text-xs text-content-secondary">
          Employee response: {employeeResponse.join(' | ')}
        </p>
      )}
      {managerResponse.length > 0 && (
        <p className="mb-2 text-xs text-content-secondary">
          Manager response: {managerResponse.join(' | ')}
        </p>
      )}
      {readOnly && !employeeResponse.length && !managerResponse.length && (
        <p className="text-sm text-content-secondary">No submitted answer.</p>
      )}
      {!readOnly && (
        <>
          {isChoice ? (
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
                        const options =
                          question.questionType === 'SINGLE_CHOICE'
                            ? event.target.checked
                              ? [option.id]
                              : []
                            : event.target.checked
                              ? [...current, option.id]
                              : current.filter((id) => id !== option.id);
                        onChange({ ...value, options });
                      }}
                    />{' '}
                    {option.label}
                  </label>
                );
              })}
            </div>
          ) : (
            <textarea
              className={fieldClass}
              rows={3}
              value={value.text ?? ''}
              onChange={(event) => onChange({ ...value, text: event.target.value })}
            />
          )}
          {(question.questionType === 'RATING' ||
            (reviewerRole === 'EMPLOYEE' && question.selfRatingEnabled) ||
            (reviewerRole === 'MANAGER' && question.managerRatingEnabled)) && (
            <label className="mt-2 block text-sm">
              Rating
              <input
                className={fieldClass}
                inputMode="decimal"
                value={value.rating ?? ''}
                onChange={(event) => onChange({ ...value, rating: event.target.value })}
              />
            </label>
          )}
        </>
      )}
    </fieldset>
  );
};

export default PerformanceLifecyclePanel;
