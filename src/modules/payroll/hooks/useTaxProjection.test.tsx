// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { GraphQLClient } from 'graphql-request';
import { afterEach, expect, it, vi } from 'vitest';

import type { TaxProjection } from '../projectionViewTypes';

import { useTaxProjection } from './useTaxProjection';

afterEach(cleanup);
it('discards another employee response after the request key changes', async () => {
  let complete: ((value: { employeeTaxProjection: TaxProjection }) => void) | undefined;
  const prior = new Promise<{ employeeTaxProjection: TaxProjection }>((resolve) => {
    complete = resolve;
  });
  const request = vi
    .fn()
    .mockReturnValueOnce(prior)
    .mockReturnValueOnce(new Promise(() => {}));
  const client = new GraphQLClient('https://example.invalid');
  Object.defineProperty(client, 'request', { value: request });
  const { result, rerender } = renderHook(
    ({ employee }) => useTaxProjection(client, 'tenant', employee, 2026, 10),
    { initialProps: { employee: 'first' } }
  );
  rerender({ employee: 'second' });
  await act(async () => {
    complete?.({
      employeeTaxProjection: {
        fiscal_year: 2026,
        annual_earnings: '900000',
        tax: null,
        withholding: null,
        recorded_tds: '0',
        history_complete: false,
        selected_monthly_tds: null,
        limitations: [],
        note: 'Estimate',
        months: [],
        opening_history: [],
      },
    });
    await prior;
  });
  expect(result.current.data).toBeNull();
  expect(result.current.loading).toBe(true);
});
