import { useCallback, useEffect, useRef, useState } from 'react';

import type { CommandReference } from './organizationCommand';
import type { TrackedOrganizationCommand } from './organizationCommandTransport';
import { companyCommandAllowed } from './organizationCompanyLifecycle';
import { beginPendingReconciliation } from './organizationPendingReconciliation';

interface CompanyAuthority {
  membershipId: string;
  status: string;
  capabilities: string[];
  version: number;
  runtimeStatus: string;
  installedVersion?: number | null;
}
export function useOrganizationCommandJournal(owner: string) {
  const active = useRef(owner);
  const mounted = useRef(true);
  const entries = useRef(new Map<string, TrackedOrganizationCommand>());
  const companyVersions = useRef(new Map<string, Map<string, number>>());
  const [state, setState] = useState({ owner, commands: [] as TrackedOrganizationCommand[] });
  if (active.current !== owner) {
    active.current = owner;
    entries.current.clear();
    companyVersions.current.clear();
  }
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const publish = useCallback(
    () => setState({ owner, commands: [...entries.current.values()] }),
    [owner]
  );
  const isCurrent = (entry: TrackedOrganizationCommand) =>
    mounted.current &&
    active.current === owner &&
    entries.current.get(entry.intent.commandId) === entry;
  const prune = useCallback(
    (retain: (entry: TrackedOrganizationCommand) => boolean) => {
      let removed = false;
      for (const [key, entry] of entries.current) {
        if (!retain(entry)) {
          entries.current.delete(key);
          removed = true;
        }
      }
      if (removed) publish();
    },
    [publish]
  );
  const retainOrganizations = useCallback(
    (ids: string[]) => {
      for (const id of companyVersions.current.keys())
        if (!ids.includes(id)) companyVersions.current.delete(id);
      prune((entry) => ids.includes(entry.organizationId));
    },
    [prune]
  );
  const retainCompanies = useCallback(
    (organizationId: string, companies: CompanyAuthority[]) => {
      companyVersions.current.set(
        organizationId,
        new Map(companies.map((company) => [company.membershipId, company.version]))
      );
      prune((entry) => {
        if (entry.organizationId !== organizationId) return true;
        const company = companies.find((item) => item.membershipId === entry.intent.membershipId);
        return (
          company !== undefined &&
          (entry.membershipVersion === undefined || entry.membershipVersion === company.version) &&
          companyCommandAllowed(company, entry.intent.operation)
        );
      });
    },
    [prune]
  );
  const reset = useCallback(() => {
    entries.current.clear();
    companyVersions.current.clear();
    publish();
  }, [publish]);
  const restorePending = useCallback(
    (organizationId: string, companyName: string, references: CommandReference[]) => {
      let added = false;
      for (const intent of references) {
        if (entries.current.has(intent.commandId)) continue;
        entries.current.set(
          intent.commandId,
          recoveredCommand(
            organizationId,
            companyName,
            intent,
            companyVersions.current.get(organizationId)?.get(intent.membershipId)
          )
        );
        added = true;
      }
      if (added) publish();
    },
    [publish]
  );
  return {
    entries,
    companyVersion: (organizationId: string, membershipId: string) =>
      companyVersions.current.get(organizationId)?.get(membershipId),
    commands: state.owner === owner ? state.commands : [],
    publish,
    isCurrent,
    retainOrganizations,
    retainCompanies,
    reset,
    restorePending,
    beginPendingRecovery: (organizationId: string) =>
      beginPendingReconciliation(entries.current, organizationId, isCurrent, publish),
  };
}

function recoveredCommand(
  organizationId: string,
  companyName: string,
  intent: CommandReference,
  membershipVersion?: number
): TrackedOrganizationCommand {
  return {
    organizationId,
    companyName,
    membershipVersion,
    intent: {
      commandId: intent.commandId,
      membershipId: intent.membershipId,
      resourceId: intent.resourceId,
      expectedVersion: intent.expectedVersion,
      operation: intent.operation,
    },
    canRetry: false,
    outcome: null,
    busy: false,
    error: null,
  };
}
