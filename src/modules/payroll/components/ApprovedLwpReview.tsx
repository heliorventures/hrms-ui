import type { GraphQLClient } from 'graphql-request';
import { useEffect, useState } from 'react';

import { PayrollApprovedLwpReviewDocument as query } from '../../../api/graphql/graphql';
import FeedbackToast from '../../../components/common/FeedbackToast';
import { useFeedbackState } from '../../../hooks/useFeedbackState';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import type { PeriodInput } from '../periodInputTypes';

interface Review {
  hash: string | null;
  days: string;
  source_days: { date: string; days: string }[];
}
interface Props {
  client: GraphQLClient;
  employeeId: string;
  draft: PeriodInput;
  disabled: boolean;
  onChange: (draft: PeriodInput) => void;
}

const ApprovedLwpReview = ({ client, employeeId, draft, disabled, onChange }: Props) => {
  const [review, setReview] = useState<Review | null>(null);
  const [error, setError] = useFeedbackState<string | null>(null, 'error');
  const { year, month } = draft;
  useEffect(() => {
    let active = true;
    client
      .request<{ payrollApprovedLwpReview: Review }>(query, { employeeId, year, month })
      .then((result) => {
        if (active) setReview(result.payrollApprovedLwpReview);
      })
      .catch((reason: unknown) => {
        if (active) setError(graphQlUserMessage(reason));
      });
    return () => {
      active = false;
    };
  }, [client, employeeId, year, month, setError]);
  if (error)
    return (
      <FeedbackToast variant={'error'} messageKey={error}>
        Approved LWP review: {error}
      </FeedbackToast>
    );
  if (!review)
    return (
      <p role="status" className="text-sm">
        Loading approved leave for this month...
      </p>
    );
  if (!review.hash)
    return (
      <p className="text-sm text-slate-600">
        No dated approved LWP was found for this month. Historical opening usage stays separate.
      </p>
    );
  return (
    <div className="space-y-2 rounded border border-slate-200 p-3 text-sm">
      <p className="font-semibold">Approved LWP in this month: {review.days} days</p>
      <p>{review.source_days.map((item) => `${item.date}: ${item.days} days`).join('; ')}</p>
      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          disabled={disabled}
          checked={draft.approved_lwp_review_hash === review.hash}
          onChange={(event) =>
            onChange({
              ...draft,
              approved_lwp_review_hash: event.target.checked ? review.hash : null,
            })
          }
        />
        These approved dates are included in the monthly LWP total above.
      </label>
      <p className="text-xs text-slate-600">
        The monthly total must cover these days. A changed approval or calendar requires review
        again. Payroll applies the configured gross adjustment once.
      </p>
    </div>
  );
};
export default ApprovedLwpReview;
