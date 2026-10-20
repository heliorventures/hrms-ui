import { expect, it } from 'vitest';

import {
  payrollDraftPayload,
  payrollFinalizePayload,
  readPayrollDraft,
} from './organizationPayrollModel';

const source = {
  cycle: { id: 'cycle-a', name: 'October' },
  draft: {
    cycle_id: 'cycle-a',
    revision: 3,
    fingerprint: 'reviewed-fingerprint',
    can_finalize: true,
    employees: [
      {
        employee_id: 'employee-a',
        employee_label: 'Employee A',
        outcome: 'READY',
        prepared: { requires_tax_acknowledgement: true, calculation: { net: '45000.00' } },
      },
    ],
  },
};

it('finalizes exactly the reviewed source revision/fingerprint with employee tax acknowledgements', () => {
  const draft = readPayrollDraft(source, 'cycle-a');
  expect(() => payrollFinalizePayload(draft, new Set())).toThrow('tax acknowledgement');
  expect(payrollFinalizePayload(draft, new Set(['employee-a']))).toEqual({
    revision: 3,
    fingerprint: 'reviewed-fingerprint',
    acknowledgement: { provisional_tax_employees: ['employee-a'] },
  });
});

it('refuses mismatched, blocked, or incomplete reviewed drafts', () => {
  expect(() => readPayrollDraft(source, 'other-cycle')).toThrow('selected payroll cycle');
  expect(() =>
    readPayrollDraft({ ...source, draft: { ...source.draft, fingerprint: '' } }, 'cycle-a')
  ).toThrow('review fingerprint');
  const blocked = readPayrollDraft(
    { ...source, draft: { ...source.draft, can_finalize: false } },
    'cycle-a'
  );
  expect(() => payrollFinalizePayload(blocked, new Set(['employee-a']))).toThrow('not ready');
});

it('preserves an explicitly absent draft revision and does not fabricate one', () => {
  expect(payrollDraftPayload({ draft_revision: null })).toEqual({ expected_revision: null });
  expect(payrollDraftPayload({ draft_revision: 4 })).toEqual({ expected_revision: 4 });
  expect(() => payrollDraftPayload({})).toThrow('draft revision');
});
