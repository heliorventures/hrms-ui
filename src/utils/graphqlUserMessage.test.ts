import { GraphQLError } from 'graphql';
import { ClientError } from 'graphql-request';
import { describe, expect, it } from 'vitest';

import { graphQlUserMessage } from './graphqlUserMessage';

describe('graphQlUserMessage', () => {
  it('distinguishes an incorrect current password from an expired session', () => {
    const err = Object.assign(new Error('The current password is incorrect.'), {
      code: 'CURRENT_PASSWORD_INCORRECT',
    });

    expect(graphQlUserMessage(err)).toBe('The current password is incorrect.');
  });

  it('explains that the new password must differ from the current password', () => {
    const err = Object.assign(new Error('New password must be different.'), {
      code: 'PASSWORD_REUSE_NOT_ALLOWED',
    });

    expect(graphQlUserMessage(err)).toBe(
      'New password must be different from the current password.'
    );
  });

  it('maps category cap failures without exposing a generic validation message', () => {
    const err = Object.assign(new Error('Amount exceeds the permitted category limit.'), {
      code: 'EXPENSE_CLAIM_LIMIT_EXCEEDED',
    });

    expect(graphQlUserMessage(err)).toBe(
      'Amount exceeds the permitted category limit. Review the limit shown above.'
    );
  });

  it('maps monthly category limit failures', () => {
    const err = Object.assign(new Error('Monthly category limit exceeded.'), {
      code: 'EXPENSE_MONTHLY_LIMIT_EXCEEDED',
    });

    expect(graphQlUserMessage(err)).toBe(
      'This claim would exceed the monthly category limit.'
    );
  });

  it('maps overlapping leave requests to a date-specific message', () => {
    const err = Object.assign(new Error('Active leave request overlaps.'), {
      code: 'LEAVE_DATE_OVERLAP',
    });

    expect(graphQlUserMessage(err)).toBe(
      'An active leave request already covers all or part of those dates.'
    );
  });

  it('preserves timesheet validation detail when GraphQL exposes VALIDATION_ERROR', () => {
    const err = new ClientError(
      {
        errors: [
          new GraphQLError('validation error: weekly timesheet hours cannot exceed 40 hours', {
            extensions: { code: 'VALIDATION_ERROR' },
          }),
        ],
        status: 400,
        headers: new Headers(),
      },
      { query: 'mutation SubmitTimesheetWeek { submitTimesheetWeek }' }
    );

    expect(graphQlUserMessage(err)).toBe(
      'Weekly timesheet total cannot exceed 40 hours.'
    );
  });

  it('maps submitted timesheet edit validation to an action-oriented message', () => {
    const err = new ClientError(
      {
        errors: [
          new GraphQLError(
            'validation error: approved or submitted timesheet rows cannot be edited - reject the week submission first',
            { extensions: { code: 'VALIDATION_ERROR' } }
          ),
        ],
        status: 400,
        headers: new Headers(),
      },
      { query: 'mutation UpdateTimesheetEntry { updateTimesheetEntry }' }
    );

    expect(graphQlUserMessage(err)).toBe(
      'This entry is already submitted. Ask the approver to reject the week before editing it.'
    );
  });

  it('preserves manual attendance overlap validation detail', () => {
    const err = new ClientError(
      {
        errors: [
          new GraphQLError(
            'validation error: manual attendance overlaps with an existing segment for this day',
            { extensions: { code: 'VALIDATION_ERROR' } }
          ),
        ],
        status: 400,
        headers: new Headers(),
      },
      { query: 'mutation AddManualAttendanceSegment { addManualAttendanceSegment }' }
    );

    expect(graphQlUserMessage(err)).toBe(
      'This punch range overlaps an existing attendance segment for the day.'
    );
  });

  it('preserves manual attendance self-service window detail from forbidden errors', () => {
    const err = new ClientError(
      {
        errors: [
          new GraphQLError(
            'forbidden: manual attendance is limited to the last 14 calendar days unless you hold attendance regularization permission',
            { extensions: { code: 'FORBIDDEN' } }
          ),
        ],
        status: 403,
        headers: new Headers(),
      },
      { query: 'mutation AddManualAttendanceSegment { addManualAttendanceSegment }' }
    );

    expect(graphQlUserMessage(err)).toBe(
      'This date is outside the self-service attendance adjustment window. Contact HR to regularize it.'
    );
  });
});
