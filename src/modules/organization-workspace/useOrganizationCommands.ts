import { useActionFeedback } from '../../hooks/useActionFeedback';

import {
  commandPresentation,
  commandReference,
  sameCommand,
  type CommandIntent,
} from './organizationCommand';
import { acceptCommandReceipt, pendingOutcome } from './organizationCommandReceipt';
import {
  markCommandInFlight,
  sendTrackedCommand,
  type CommandActivity,
  type OrganizationCommandTransport,
  type TrackedOrganizationCommand,
} from './organizationCommandTransport';
import { organizationUserMessage } from './organizationDataError';
import { useOrganizationCommandJournal } from './useOrganizationCommandJournal';

function mayPerform(
  entry: TrackedOrganizationCommand,
  activity: CommandActivity,
  transientIntent?: CommandIntent
) {
  if (entry.busy || !commandPresentation(entry.outcome?.status ?? '').pending) return false;
  return activity !== 'execute' || entry.canRetry || transientIntent !== undefined;
}

export function useOrganizationCommands(owner: string, transport: OrganizationCommandTransport) {
  const feedback = useActionFeedback();
  const {
    entries: journal,
    companyVersion,
    commands,
    publish,
    isCurrent,
    retainOrganizations,
    retainCompanies,
    reset,
    restorePending,
    beginPendingRecovery,
  } = useOrganizationCommandJournal(owner);
  const perform = async (
    entry: TrackedOrganizationCommand,
    activity: CommandActivity,
    transientIntent?: CommandIntent
  ) => {
    if (!mayPerform(entry, activity, transientIntent)) return;
    markCommandInFlight(entry, activity);
    journal.current.set(entry.intent.commandId, entry);
    publish();
    try {
      const result = transientIntent
        ? await transport.execute(entry.organizationId, transientIntent)
        : await sendTrackedCommand(transport, entry, activity);
      if (!isCurrent(entry)) return;
      journal.current.set(entry.intent.commandId, acceptCommandReceipt(entry, result, feedback));
      publish();
    } catch (error) {
      if (!isCurrent(entry)) return;
      entry.outcome = pendingOutcome(entry.intent);
      entry.error = organizationUserMessage(error);
    } finally {
      if (isCurrent(entry)) {
        entry.busy = false;
        entry.activity = undefined;
        publish();
      }
    }
  };
  const submit = async (organizationId: string, companyName: string, intent: CommandIntent) => {
    const duplicate = [...journal.current.values()].find(
      (item) =>
        item.organizationId === organizationId &&
        item.intent.membershipId === intent.membershipId &&
        item.intent.resourceId === intent.resourceId &&
        commandPresentation(item.outcome?.status ?? '').pending
    );
    if (duplicate) return;
    // Account passwords exist only in this request. The journal retains a reference,
    // including on transport uncertainty, so status/cancellation never require a secret.
    const sensitive =
      intent.operation === 'account_create' || intent.operation === 'employee_login_provision';
    await perform(
      {
        organizationId,
        membershipVersion: companyVersion(organizationId, intent.membershipId),
        companyName,
        ...(sensitive
          ? { intent: commandReference(intent), canRetry: false as const }
          : { intent: sameCommand(intent), canRetry: true as const }),
        outcome: null,
        busy: false,
        error: null,
      },
      'execute',
      sensitive ? intent : undefined
    );
  };
  const retry = async (commandId: string) => {
    const entry = journal.current.get(commandId);
    if (entry) await perform(entry, 'execute');
  };
  const check = async (commandId: string) => {
    const entry = journal.current.get(commandId);
    if (entry) await perform(entry, 'status');
  };
  const cancel = async (commandId: string) => {
    const entry = journal.current.get(commandId);
    if (
      !entry ||
      entry.activity === 'cancel' ||
      !commandPresentation(entry.outcome?.status ?? '').pending
    )
      return;
    await perform({ ...entry, busy: false, error: null }, 'cancel');
  };
  return {
    commands,
    submit,
    retry,
    check,
    cancel,
    retainOrganizations,
    retainCompanies,
    reset,
    restorePending,
    beginPendingRecovery,
  };
}
