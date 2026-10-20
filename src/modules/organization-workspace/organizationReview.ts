import { OrganizationDataError } from './organizationDataError';
import {
  asRecord,
  optionalString,
  requiredString,
  type OrganizationRecord,
} from './organizationDocuments';

export interface ManagerReviewQuestion {
  id: string;
  prompt: string;
  type: string;
  required: boolean;
  managerRating: boolean;
  options: { id: string; label: string }[];
}
export interface ManagerReviewAnswer {
  text?: string;
  rating?: string;
  options: string[];
}
export interface ManagerReviewDocument {
  review: OrganizationRecord;
  revision: number;
  questions: ManagerReviewQuestion[];
  responses: Partial<Record<string, ManagerReviewAnswer>>;
}

function records(value: unknown): OrganizationRecord[] {
  if (!Array.isArray(value))
    throw new OrganizationDataError('The source review is incomplete. Refresh source details.');
  return value.map(asRecord);
}
function optionIds(value: unknown): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string'))
    throw new OrganizationDataError('Source review options are unavailable.');
  return value as string[];
}
function readQuestion(question: OrganizationRecord): ManagerReviewQuestion {
  return {
    id: requiredString(question, 'id'),
    prompt: requiredString(question, 'prompt'),
    type: requiredString(question, 'question_type'),
    required: question.is_required === true,
    managerRating: question.manager_rating_enabled === true,
    options: records(question.options).map((option) => ({
      id: requiredString(option, 'id'),
      label: requiredString(option, 'label'),
    })),
  };
}
export function readManagerReview(value: unknown): ManagerReviewDocument {
  const document = asRecord(value);
  const review = asRecord(document.review);
  const revision = review.response_revision;
  if (typeof revision !== 'number' || !Number.isSafeInteger(revision) || revision < 0)
    throw new OrganizationDataError(
      'The source response revision is unavailable. Refresh source details.'
    );
  const questions = records(asRecord(document.template).sections)
    .flatMap((section) => records(section.questions))
    .filter((question) => question.answerer === 'MANAGER' || question.answerer === 'BOTH')
    .map(readQuestion);
  const responses = Object.fromEntries(
    records(document.answers).map((answer) => [
      requiredString(answer, 'question_id'),
      {
        text: optionalString(answer, 'manager_text_answer') ?? undefined,
        rating: optionalString(answer, 'manager_rating') ?? undefined,
        options: optionIds(answer.manager_selected_option_ids),
      },
    ])
  );
  return { review, revision, questions, responses };
}
export function managerReviewPayload(
  document: ManagerReviewDocument,
  answers: Partial<Record<string, ManagerReviewAnswer>>,
  finalRating: string,
  band: string
): Record<string, unknown> {
  return {
    expected_revision: document.revision,
    final_rating: finalRating.trim(),
    ...(band.trim() ? { performance_band: band.trim() } : {}),
    answers: document.questions.map((question) => {
      const response = answers[question.id] ?? { options: [] };
      return {
        question_id: question.id,
        selected_option_ids: response.options,
        ...(response.text?.trim() ? { text_answer: response.text.trim() } : {}),
        ...(response.rating?.trim() ? { rating: response.rating.trim() } : {}),
      };
    }),
  };
}
