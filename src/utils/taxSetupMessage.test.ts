import { GraphQLError } from 'graphql';
import { ClientError } from 'graphql-request';
import { describe, expect, it } from 'vitest';

import { graphQlUserMessage } from './graphqlUserMessage';

const responseError = (code: string, message: string) =>
  new ClientError(
    {
      errors: [new GraphQLError(message, { extensions: { code } })],
      status: 200,
      headers: new Headers(),
    },
    { query: 'query TaxProjection { employeeTaxProjection }' }
  );

describe('missing employee tax setup', () => {
  const message = 'validation error: HR tax settings are not configured for this period';

  it('explains the missing setup without blaming an entered field', () => {
    expect(graphQlUserMessage(responseError('VALIDATION_ERROR', message))).toBe(
      'Employee tax settings are not configured for this period.'
    );
  });

  it('preserves permission denials even if their message resembles a setup error', () => {
    expect(graphQlUserMessage(responseError('FORBIDDEN', message))).toBe(
      'You do not have access to make this change. Contact your HR administrator if you need help.'
    );
  });

  it('does not expose arbitrary validation text', () => {
    expect(graphQlUserMessage(responseError('VALIDATION_ERROR', 'private payload details'))).toBe(
      'Check the entered details and try again.'
    );
  });

  it('keeps handling ordinary GraphQL errors without optional extensions', () => {
    const error = new ClientError(
      { errors: [{ message: 'database unavailable' }], status: 200, headers: new Headers() },
      { query: 'query TaxProjection { employeeTaxProjection }' }
    );
    expect(graphQlUserMessage(error)).toBe(
      'We could not complete this action right now. Please try again in a moment.'
    );
  });
});
