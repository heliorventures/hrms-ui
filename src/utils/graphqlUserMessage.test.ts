import { GraphQLError } from 'graphql';
import { ClientError } from 'graphql-request';
import { describe, expect, it } from 'vitest';

import { graphQlUserMessage } from './graphqlUserMessage';

describe('graphQlUserMessage', () => {
  it('maps managed-attendance conflicts and denials without exposing target details', () => {
    expect(graphQlUserMessage({ code: 'CONFLICT' }, 'attendance-management')).toBe(
      'This attendance record changed. Refresh it before trying again.'
    );
    expect(graphQlUserMessage({ code: 'FORBIDDEN', message: 'employee-secret is outside TEAM scope' }, 'attendance-management')).toBe(
      'You do not have access to make this change. Contact your HR administrator if you need help.'
    );
  });
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

  it('does not lose the category cap message after a submit modal receives a plain Error', () => {
    expect(
      graphQlUserMessage(
        new Error('Amount exceeds the permitted category limit. Review the limit shown above.')
      )
    ).toBe('Amount exceeds the permitted category limit. Review the limit shown above.');
  });

  it('maps monthly category limit failures', () => {
    const err = Object.assign(new Error('Monthly category limit exceeded.'), {
      code: 'EXPENSE_MONTHLY_LIMIT_EXCEEDED',
    });

    expect(graphQlUserMessage(err)).toBe('This claim would exceed the monthly category limit.');
  });

  it('explains an asset tag conflict using the stable GraphQL code', () => {
    const err = new ClientError(
      {
        errors: [
          new GraphQLError('Unique constraint violated.', {
            extensions: { code: 'ASSET_TAG_CONFLICT' },
          }),
        ],
        status: 409,
        headers: new Headers(),
      },
      { query: 'mutation UpsertAsset { upsertAsset }' }
    );

    expect(graphQlUserMessage(err)).toBe(
      'An asset already uses this asset tag. Choose a different tag and try again.'
    );
  });

  it('tells the user to upload again when a company-document stage expires', () => {
    const err = Object.assign(new Error('Staged upload expired.'), {
      code: 'COMPANY_DOCUMENT_UPLOAD_EXPIRED',
    });

    expect(graphQlUserMessage(err)).toBe('This upload expired. Upload the file again.');
  });

  it('does not expose staged-upload ownership details', () => {
    const err = Object.assign(new Error('Staged upload belongs to another user.'), {
      code: 'COMPANY_DOCUMENT_UPLOAD_INVALID',
    });

    expect(graphQlUserMessage(err)).toBe(
      'This staged upload is not valid for this company document.'
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

  it('maps login email conflicts to a field-specific correction', () => {
    const err = Object.assign(new Error('email is already in use in this tenant'), {
      code: 'USER_EMAIL_CONFLICT',
    });

    expect(graphQlUserMessage(err)).toBe(
      'A login account already uses this email address. Use a different email or leave it blank.'
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

    expect(graphQlUserMessage(err)).toBe('Weekly timesheet total cannot exceed 40 hours.');
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

  it('gives a next step when an action is forbidden', () => {
    const err = Object.assign(new Error('forbidden'), { code: 'FORBIDDEN' });

    expect(graphQlUserMessage(err)).toBe(
      'You do not have access to make this change. Contact your HR administrator if you need help.'
    );
  });

  it('explains how to recover from a connectivity failure', () => {
    expect(graphQlUserMessage(new Error('TypeError: Failed to fetch'))).toBe(
      'We could not connect right now. Check your connection and try again.'
    );
  });

  it('explains how to recover from a timeout', () => {
    expect(graphQlUserMessage(new Error('request timed out after 30000ms'))).toBe(
      'This is taking longer than expected. Try again.'
    );
  });

  it('does not expose a database constraint name', () => {
    expect(
      graphQlUserMessage(
        new Error('duplicate key value violates unique constraint employee_email_key')
      )
    ).toBe('This information conflicts with an existing record. Review the details and try again.');
  });
});
