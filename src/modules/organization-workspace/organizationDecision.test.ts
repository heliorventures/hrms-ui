import { expect, it } from 'vitest';

import { organizationDecisionPayload } from './organizationDecision';

it('uses the source current workflow step and requires a rejection reason', () => {
  const source = { expected_workflow_step_id: 'step-current' };
  expect(organizationDecisionPayload(source, 'approve', '')).toEqual({
    decision: 'approve',
    expected_workflow_step_id: 'step-current',
  });
  expect(organizationDecisionPayload(source, 'reject', ' Needs correction ')).toEqual({
    decision: 'reject',
    expected_workflow_step_id: 'step-current',
    rejection_reason: 'Needs correction',
  });
  expect(() => organizationDecisionPayload(source, 'reject', '  ')).toThrow('rejection reason');
  expect(() => organizationDecisionPayload({}, 'approve', '')).toThrow('source reference');
});
