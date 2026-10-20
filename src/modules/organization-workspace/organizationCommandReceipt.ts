import {
  commandPresentation,
  type CommandOutcome,
  type CommandReference,
} from './organizationCommand';
import type { TrackedOrganizationCommand } from './organizationCommandTransport';
import { OrganizationDataError } from './organizationDataError';
import { sourceVersion } from './organizationDocuments';

export function pendingOutcome(intent: CommandReference): CommandOutcome {
  return {
    commandId: intent.commandId,
    resourceId: intent.resourceId,
    status: 'AWAITING_CONFIRMATION',
    resourceVersion: intent.expectedVersion,
    result: null,
  };
}

export function acceptCommandReceipt(
  entry: TrackedOrganizationCommand,
  result: CommandOutcome | null,
  feedback: (action: 'updated', message: string) => void
): TrackedOrganizationCommand {
  if (result) validateReceipt(entry.intent, result);
  const outcome = result ?? pendingOutcome(entry.intent);
  if (outcome.status === 'COMMITTED' && entry.outcome?.status !== 'COMMITTED')
    feedback('updated', 'Source company confirmed the change.');
  if (outcome.status === 'CANCELLED_NOT_EXECUTED')
    feedback('updated', 'Source company confirmed this command was not executed.');
  const next = { ...entry, outcome, busy: false, activity: undefined, error: null };
  if (commandPresentation(outcome.status).pending) return next;
  return {
    ...next,
    canRetry: false,
    intent: {
      commandId: entry.intent.commandId,
      membershipId: entry.intent.membershipId,
      resourceId: entry.intent.resourceId,
      expectedVersion: entry.intent.expectedVersion,
      operation: entry.intent.operation,
    },
  };
}

function validateReceipt(intent: CommandReference, result: CommandOutcome) {
  if (result.commandId !== intent.commandId || result.resourceId !== intent.resourceId)
    throw new OrganizationDataError('The source receipt did not match this command.');
  sourceVersion({ version: result.resourceVersion });
  if (result.status === 'CANCELLED_NOT_EXECUTED' && result.resourceVersion < intent.expectedVersion)
    throw new OrganizationDataError(
      'The source cancellation receipt version did not match this command.'
    );
}
