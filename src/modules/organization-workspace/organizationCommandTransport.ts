import {
  sameCommand,
  type CommandIntent,
  type CommandOutcome,
  type CommandReference,
} from './organizationCommand';

export type CommandActivity = 'execute' | 'status' | 'cancel';

export interface OrganizationCommandTransport {
  execute: (organizationId: string, intent: CommandIntent) => Promise<CommandOutcome>;
  status: (commandId: string) => Promise<CommandOutcome | null>;
  cancel: (commandId: string) => Promise<CommandOutcome>;
}

interface TrackedCommandState {
  membershipVersion?: number;
  organizationId: string;
  companyName: string;
  outcome: CommandOutcome | null;
  busy: boolean;
  activity?: CommandActivity;
  activityVersion?: number;
  error: string | null;
}

export type TrackedOrganizationCommand = TrackedCommandState &
  ({ canRetry: true; intent: CommandIntent } | { canRetry: false; intent: CommandReference });

export function markCommandInFlight(entry: TrackedOrganizationCommand, activity: CommandActivity) {
  entry.busy = true;
  entry.activityVersion = (entry.activityVersion ?? 0) + 1;
  entry.activity = activity;
  entry.error = null;
}

export function sendTrackedCommand(
  transport: OrganizationCommandTransport,
  entry: TrackedOrganizationCommand,
  activity: CommandActivity
): Promise<CommandOutcome | null> {
  if (activity === 'cancel') return transport.cancel(entry.intent.commandId);
  if (activity === 'status') return transport.status(entry.intent.commandId);
  if (!entry.canRetry) return Promise.resolve(null);
  return transport.execute(entry.organizationId, sameCommand(entry.intent));
}
