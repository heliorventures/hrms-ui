import { expect, it } from 'vitest';

import { proofInput } from './taxFormValidation';

it('sends the displayed assigned regime so the server can reject a stale proof submission', () => {
  const input = proofInput(
    {
      fiscal_year: 2026,
      settings: { regime: 'OLD', method: 'ANNUAL_PROJECTION', effective_from: '2026-04-01' },
      declaration: null,
    },
    '80C',
    '1000',
    '1000',
    'file'
  );
  expect(input).toMatchObject({ fiscalYear: 2026, taxRegimeChosen: 'OLD' });
});
