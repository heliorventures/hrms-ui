import { useState } from 'react';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

import { createCommandIntent } from './organizationCommand';
import { optionalString } from './organizationDocuments';
import { resourcePending, type OrganizationResourceReference } from './organizationResource';
import {
  managerReviewPayload,
  type ManagerReviewAnswer,
  type ManagerReviewDocument,
} from './organizationReview';
import OrganizationReviewQuestion from './OrganizationReviewQuestion';
import type { OrganizationScope } from './organizationTypes';

interface Props {
  scope: OrganizationScope;
  reference: OrganizationResourceReference;
  document: ManagerReviewDocument;
  version: number;
}
const OrganizationManagerReviewForm = ({ scope, reference, document, version }: Props) => {
  const [answers, setAnswers] = useState(document.responses);
  const [rating, setRating] = useState(optionalString(document.review, 'final_rating') ?? '');
  const [band, setBand] = useState(optionalString(document.review, 'performance_band') ?? '');
  const company = scope.companies.find((item) => item.membershipId === reference.membershipId);
  const allowed =
    scope.company?.membershipId === reference.membershipId &&
    company?.capabilities.includes('performance:evaluate');
  const pending = resourcePending(scope, reference.membershipId, reference.resourceId);
  const respond = (id: string, value: ManagerReviewAnswer) =>
    setAnswers((previous) => ({ ...previous, [id]: value }));
  const submit = () => {
    if (allowed)
      void scope.commands.submit(
        scope.organization.id,
        reference.companyName,
        createCommandIntent(
          reference.membershipId,
          'review_submit',
          reference.resourceId,
          version,
          managerReviewPayload(document, answers, rating, band)
        )
      );
  };
  return (
    <form
      className="mt-4 space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      {!allowed ? (
        <p>
          Select {reference.companyName} as the business target and obtain its review capability to
          submit.
        </p>
      ) : null}
      <fieldset disabled={!allowed || pending} className="space-y-3">
        <legend className="mb-2 font-medium">Manager appraisal</legend>
        {document.questions.map((question) => (
          <OrganizationReviewQuestion
            key={question.id}
            question={question}
            value={answers[question.id] ?? { options: [] }}
            onChange={(value) => respond(question.id, value)}
          />
        ))}
        <Input
          label="Final rating"
          required
          inputMode="decimal"
          value={rating}
          onChange={(event) => setRating(event.target.value)}
        />
        <Input
          label="Performance band"
          value={band}
          onChange={(event) => setBand(event.target.value)}
        />
        <Button type="submit">Submit review to {reference.companyName}</Button>
      </fieldset>
    </form>
  );
};

export default OrganizationManagerReviewForm;
