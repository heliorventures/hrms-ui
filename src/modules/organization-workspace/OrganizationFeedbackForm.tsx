import { useState } from 'react';

import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';

import { createCommandIntent } from './organizationCommand';
import { requiredString, sourceVersion, type OrganizationRecord } from './organizationDocuments';
import { latestSourceVersion, resourcePending } from './organizationResource';
import type { OrganizationScope } from './organizationTypes';
import SourceCompanyLabel from './SourceCompanyLabel';

const OrganizationFeedbackForm = ({
  scope,
  employee,
  onClose,
}: {
  scope: OrganizationScope;
  employee: OrganizationRecord;
  onClose: () => void;
}) => {
  const [date, setDate] = useState('');
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState('');
  const membershipId = requiredString(employee, 'membership_id');
  const employeeId = requiredString(employee, 'employee_id');
  const company = scope.companies.find((item) => item.membershipId === membershipId);
  const allowed =
    scope.company?.membershipId === membershipId &&
    company?.capabilities.includes('feedback:write');
  const pending = resourcePending(scope, membershipId, employeeId);
  const signature = JSON.stringify([date, comments.trim()]);
  const send = () => {
    if (!allowed) return;
    setSubmitted(signature);
    void scope.commands.submit(
      scope.organization.id,
      requiredString(employee, 'company_name'),
      createCommandIntent(
        membershipId,
        'feedback_create',
        employeeId,
        latestSourceVersion(scope, membershipId, employeeId, sourceVersion(employee)),
        { observation_date: date, comments: comments.trim() }
      )
    );
  };
  return (
    <Card title={`Feedback for ${requiredString(employee, 'display_name')}`}>
      <SourceCompanyLabel name={requiredString(employee, 'company_name')} />
      <p className="my-2 text-sm">
        This feedback is visible to the employee in their owning company.
      </p>
      {!allowed ? (
        <p>
          Select this employee&apos;s company as the business target and obtain an explicit feedback
          grant to continue.
        </p>
      ) : null}
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <Input
          label="Observation date"
          type="date"
          required
          value={date}
          onChange={(event) => setDate(event.target.value)}
          disabled={!allowed || pending}
        />
        <Textarea
          label="Employee-visible feedback"
          required
          maxLength={4000}
          rows={4}
          fullWidth
          value={comments}
          onChange={(event) => setComments(event.target.value)}
          disabled={!allowed || pending}
        />
        <div className="flex gap-2">
          <Button type="submit" disabled={!allowed || pending || signature === submitted}>
            Send to source company
          </Button>
          <Button variant="quiet" onClick={onClose}>
            Close
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default OrganizationFeedbackForm;
