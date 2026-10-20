import { describe, expect, it } from 'vitest';

import {
  commandCapability,
  commandPresentation,
  createCommandIntent,
  sameCommand,
} from './organizationCommand';

describe('source company commands', () => {
  it('keeps login provisioning under explicit account administration authority', () => {
    expect(commandCapability('employee_login_provision')).toBe('role:manage');
    expect(commandCapability('employee_create')).toBe('employee:manage');
  });
  it('does not describe submitted delivery or an unknown status as a business approval', () => {
    expect(commandPresentation('SUBMITTED')).toEqual({
      confirmed: false,
      pending: true,
      label: 'Submitted; awaiting source confirmation',
    });
    expect(commandPresentation('HTTP_ACCEPTED').confirmed).toBe(false);
    expect(commandPresentation('COMMITTED').confirmed).toBe(true);
    expect(commandPresentation('REJECTED').pending).toBe(false);
    expect(commandPresentation('ACCEPTED')).toMatchObject({ confirmed: false, pending: false });
    expect(commandPresentation('ACCEPTED').label).toContain('check its processing status');
  });

  it('keeps the original command ID, version, and payload for an uncertain retry', () => {
    const intent = createCommandIntent('membership-a', 'leave_decision', 'leave-a', 7, {
      decision: 'approve',
      expected_workflow_step_id: 'step-a',
    });
    const retry = sameCommand(intent);
    expect(retry).toEqual(intent);
    expect(retry.commandId).toBe(intent.commandId);
    expect(retry.payload).not.toBe(intent.payload);
    expect(retry.expectedVersion).toBe(7);
  });

  it.each([0, -1, 1.5, Number.NaN])('rejects invalid source versions: %s', (version) => {
    expect(() =>
      createCommandIntent('company-a', 'leave_decision', 'leave-a', version, {})
    ).toThrow('Refresh the source record');
  });
});
