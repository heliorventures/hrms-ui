import { describe, expect, it } from 'vitest';
import { ClientError } from 'graphql-request';

import { graphQlUserMessage } from './graphqlUserMessage';

describe('graphQlUserMessage', () => {
  it('preserves timesheet validation detail when GraphQL exposes VALIDATION_ERROR', () => {
    const err = new ClientError(
      {
        errors: [
          {
            message: 'validation error: weekly timesheet hours cannot exceed 40 hours',
            extensions: { code: 'VALIDATION_ERROR' },
          },
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
          {
            message:
              'validation error: approved or submitted timesheet rows cannot be edited - reject the week submission first',
            extensions: { code: 'VALIDATION_ERROR' },
          },
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
          {
            message: 'validation error: manual attendance overlaps with an existing segment for this day',
            extensions: { code: 'VALIDATION_ERROR' },
          },
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
          {
            message:
              'forbidden: manual attendance is limited to the last 14 calendar days unless you hold attendance regularization permission',
            extensions: { code: 'FORBIDDEN' },
          },
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
