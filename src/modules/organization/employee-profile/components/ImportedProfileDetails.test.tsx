// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { GraphQLClient } from 'graphql-request';
import { afterEach, expect, it, vi } from 'vitest';

import type { ImportedProfile } from '../importedProfile';

import ImportedProfileDetails from './ImportedProfileDetails';

afterEach(cleanup);
const details = (holder: string): ImportedProfile => ({
  account_holder: holder,
  bank_branch: 'Fictional branch',
  confirmation_date: null,
  source_exit_date: null,
  source_last_working_date: null,
});
it('clears previous employee details immediately and ignores a stale response', async () => {
  const client = new GraphQLClient('https://example.invalid/graphql');
  let resolveFirst: (value: { employeeImportedProfile: ImportedProfile }) => void = () => undefined;
  const request = vi.fn((_document: unknown, variables: { employeeId: string }) => {
    if (variables.employeeId === 'first')
      return new Promise<{ employeeImportedProfile: ImportedProfile }>((resolve) => {
        resolveFirst = resolve;
      });
    return Promise.resolve({ employeeImportedProfile: details('Second fictional employee') });
  });
  Object.defineProperty(client, 'request', { value: request });
  const { rerender } = render(
    <ImportedProfileDetails client={client} employeeId="first" section="banking" />
  );
  rerender(<ImportedProfileDetails client={client} employeeId="second" section="banking" />);
  await screen.findByText('Second fictional employee');
  await act(async () => {
    resolveFirst({ employeeImportedProfile: details('First fictional employee') });
    await Promise.resolve();
  });
  expect(screen.queryByText('First fictional employee')).toBeNull();
  expect(screen.getByText('Second fictional employee')).toBeTruthy();
});
