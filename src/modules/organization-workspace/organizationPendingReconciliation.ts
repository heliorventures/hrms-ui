import { commandPresentation } from './organizationCommand';
import type { TrackedOrganizationCommand } from './organizationCommandTransport';

/** Only a complete successful pending query may apply this single-use snapshot. */
export function beginPendingReconciliation(
  entries: Map<string, TrackedOrganizationCommand>,
  organizationId: string,
  isCurrent: (entry: TrackedOrganizationCommand) => boolean,
  publish: () => void
): (currentIds: string[]) => boolean {
  const snapshot = [...entries.values()]
    .filter(
      (entry) =>
        entry.organizationId === organizationId &&
        !entry.busy &&
        commandPresentation(entry.outcome?.status ?? '').pending
    )
    .map((entry) => ({ entry, activityVersion: entry.activityVersion }));
  return (currentIds) => {
    const retained = new Set(currentIds);
    let removed = false;
    for (const { entry, activityVersion } of snapshot) {
      if (
        !retained.has(entry.intent.commandId) &&
        isCurrent(entry) &&
        !entry.busy &&
        entry.activityVersion === activityVersion &&
        commandPresentation(entry.outcome?.status ?? '').pending
      ) {
        entries.delete(entry.intent.commandId);
        removed = true;
      }
    }
    snapshot.length = 0;
    if (removed) publish();
    return removed;
  };
}
