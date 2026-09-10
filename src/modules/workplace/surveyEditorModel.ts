import type { SurveyAudienceRow, SurveyDetailRow, SurveyQuestionRow } from './surveyQueries';

export interface EditorOption {
  key: string;
  label: string;
  score: string;
}
export interface EditorQuestion {
  key: string;
  dimension: string;
  prompt: string;
  description: string;
  commentEnabled: boolean;
  type: string;
  isRequired: boolean;
  ratingMin: string;
  ratingMax: string;
  options: EditorOption[];
}
export interface EditorSection {
  key: string;
  title: string;
  questions: EditorQuestion[];
}
export interface SurveyDraft {
  id?: string;
  title: string;
  description: string;
  responseReviewMode: 'AGGREGATE_ONLY' | 'ANONYMOUS_SUBMISSIONS';
  threshold: number;
  audience: string[];
  audienceKind: 'ALL' | 'DEPARTMENT' | 'LOCATION' | 'EMPLOYEE';
  locations: string[];
  employees: string[];
  sourceSurveyId?: string | null;
  opensAt: string;
  closesAt: string;
  originalOpensAt?: string | null;
  originalClosesAt?: string | null;
  sections: EditorSection[];
}
export const blankOption = (): EditorOption => ({ key: crypto.randomUUID(), label: '', score: '' });
export const blankQuestion = (): EditorQuestion => ({
  key: crypto.randomUUID(),
  dimension: 'Engagement',
  prompt: '',
  description: '',
  commentEnabled: true,
  type: 'RATING',
  isRequired: true,
  ratingMin: '1',
  ratingMax: '5',
  options: [],
});
export const blankSection = (): EditorSection => ({
  key: crypto.randomUUID(),
  title: 'Survey',
  questions: [blankQuestion()],
});
export const blankSurvey = (): SurveyDraft => ({
  title: '',
  description: '',
  responseReviewMode: 'ANONYMOUS_SUBMISSIONS',
  threshold: 5,
  audience: [],
  audienceKind: 'ALL',
  locations: [],
  employees: [],
  opensAt: '',
  closesAt: '',
  sections: [blankSection()],
});
export const isChoice = (type: string) => type === 'SINGLE_CHOICE' || type === 'MULTIPLE_CHOICE';

export function tenantLocalTime(iso: string | null | undefined, timezone: string): string {
  if (!iso) return '';
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(iso));
  const part = (name: string) => parts.find((p) => p.type === name)?.value;
  return `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}`;
}

// Enumerate zone offsets around the requested wall time. Reject DST gaps/overlaps
// rather than silently scheduling at a different or ambiguous instant.
export function tenantTimeToIso(
  local: string,
  timezone: string,
  original?: string | null
): string | null {
  if (!local) return null;
  if (original && tenantLocalTime(original, timezone) === local) return original;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local))
    throw new Error('Enter a valid schedule date and time.');
  const wall = Date.parse(`${local}:00Z`);
  if (!Number.isFinite(wall)) throw new Error('Enter a valid schedule date and time.');
  const candidates = new Set<number>();
  for (let hours = -36; hours <= 36; hours += 6) {
    const probe = wall + hours * 3_600_000;
    const offset =
      Date.parse(`${tenantLocalTime(new Date(probe).toISOString(), timezone)}:00Z`) - probe;
    const instant = wall - offset;
    if (tenantLocalTime(new Date(instant).toISOString(), timezone) === local)
      candidates.add(instant);
  }
  if (candidates.size !== 1)
    throw new Error(
      'This time is ambiguous or does not exist in the tenant timezone. Choose another time.'
    );
  return new Date([...candidates][0]).toISOString();
}

const audienceKind = (audience: SurveyAudienceRow): SurveyDraft['audienceKind'] => {
  const kind = audience.audienceKind;
  if (kind === 'ALL' || kind === 'DEPARTMENT' || kind === 'LOCATION' || kind === 'EMPLOYEE')
    return kind;
  throw new Error(
    'Survey audience is missing or invalid. Review the saved audience before editing.'
  );
};
const hydrateQuestion = (q: SurveyQuestionRow): EditorQuestion => ({
  key: crypto.randomUUID(),
  dimension: q.dimension,
  prompt: q.prompt,
  description: q.description ?? '',
  commentEnabled: q.commentEnabled ?? false,
  type: q.questionType,
  isRequired: q.isRequired,
  ratingMin: q.ratingMin ?? '1',
  ratingMax: q.ratingMax ?? '5',
  options: q.options.map((o) => ({
    key: crypto.randomUUID(),
    label: o.label,
    score: o.score ?? '',
  })),
});

export function hydrateSurvey(
  detail: SurveyDetailRow,
  timezone: string,
  copy: boolean,
  audience: SurveyAudienceRow
): SurveyDraft {
  if (!copy && detail.summary.status !== 'DRAFT')
    throw new Error('Only drafts can be edited. Copy this survey as a new draft instead.');
  const schedule = copy
    ? { opensAt: '', closesAt: '', originalOpensAt: null, originalClosesAt: null }
    : {
        opensAt: tenantLocalTime(detail.summary.opensAt, timezone),
        closesAt: tenantLocalTime(detail.summary.closesAt, timezone),
        originalOpensAt: detail.summary.opensAt,
        originalClosesAt: detail.summary.closesAt,
      };
  return {
    ...(copy ? {} : { id: detail.summary.id }),
    title: copy ? `${detail.summary.title} (copy)` : detail.summary.title,
    description: detail.summary.description ?? '',
    responseReviewMode:
      detail.summary.responseReviewMode === 'ANONYMOUS_SUBMISSIONS'
        ? 'ANONYMOUS_SUBMISSIONS'
        : 'AGGREGATE_ONLY',
    threshold: detail.summary.minimumReportGroupSize,
    audience: [...audience.departmentIds],
    locations: [...audience.locationIds],
    employees: [...audience.employeeIds],
    audienceKind: audienceKind(audience),
    sourceSurveyId: copy ? detail.summary.id : audience.sourceSurveyId,
    ...schedule,
    sections: detail.sections.map((section) => ({
      key: crypto.randomUUID(),
      title: section.title,
      questions: section.questions.map(hydrateQuestion),
    })),
  };
}

const decimal = (value: string, label: string) => {
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value.trim()) || !Number.isFinite(Number(value)))
    throw new Error(`${label} must be a valid number.`);
  return value.trim();
};
const buildOption = (o: EditorOption) => {
  if (!o.label.trim()) throw new Error('Every option needs a label.');
  return { label: o.label.trim(), score: o.score.trim() ? decimal(o.score, 'Option score') : null };
};
const buildRatingRange = (q: EditorQuestion) => {
  if (q.type !== 'RATING') return { ratingMin: null, ratingMax: null };
  const ratingMin = decimal(q.ratingMin, 'Rating minimum');
  const ratingMax = decimal(q.ratingMax, 'Rating maximum');
  if (Number(ratingMax) <= Number(ratingMin))
    throw new Error('Rating maximum must be greater than minimum.');
  return { ratingMin, ratingMax };
};
const buildQuestion = (q: EditorQuestion) => {
  if (!q.prompt.trim() || !q.dimension.trim())
    throw new Error('Every question needs a prompt and an area.');
  if (isChoice(q.type) && q.options.length < 2)
    throw new Error('Choice questions need at least two options.');
  return {
    dimension: q.dimension.trim(),
    prompt: q.prompt.trim(),
    description: q.description.trim() || null,
    commentEnabled: (q.type === 'RATING' || isChoice(q.type)) && q.commentEnabled,
    questionType: q.type,
    isRequired: q.isRequired,
    ...buildRatingRange(q),
    options: isChoice(q.type) ? q.options.map(buildOption) : [],
  };
};
const buildSection = (section: EditorSection) => {
  if (!section.title.trim() || section.questions.length === 0)
    throw new Error('Each section needs a title and a question.');
  return { title: section.title.trim(), questions: section.questions.map(buildQuestion) };
};
const validateDraft = (draft: SurveyDraft) => {
  if (
    draft.audienceKind !== 'ALL' &&
    !(draft.audience.length + draft.locations.length + draft.employees.length)
  )
    throw new Error('Select at least one audience member or choose all employees.');
  if (!draft.title.trim()) throw new Error('Survey title is required.');
  if (!Number.isInteger(draft.threshold) || draft.threshold < 3)
    throw new Error('Minimum reporting group must be a whole number of at least 3.');
};
export function buildSurveyInput(draft: SurveyDraft, timezone: string) {
  validateDraft(draft);
  const opensAt = tenantTimeToIso(draft.opensAt, timezone, draft.originalOpensAt);
  const closesAt = tenantTimeToIso(draft.closesAt, timezone, draft.originalClosesAt);
  if (opensAt && closesAt && Date.parse(closesAt) <= Date.parse(opensAt))
    throw new Error('Closing time must be after opening time.');
  return {
    ...(draft.id ? { id: draft.id } : {}),
    title: draft.title.trim(),
    description: draft.description.trim() || null,
    responseReviewMode: draft.responseReviewMode,
    minimumReportGroupSize: draft.threshold,
    audienceDepartmentIds: draft.audience,
    audienceLocationIds: draft.locations,
    audienceEmployeeIds: draft.employees,
    ...(!draft.id && draft.sourceSurveyId ? { sourceSurveyId: draft.sourceSurveyId } : {}),
    opensAt,
    closesAt,
    sections: draft.sections.map(buildSection),
  };
}
