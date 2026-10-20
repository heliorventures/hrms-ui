import type {
  OrganizationCompaniesQuery,
  OrganizationWorkspacesQuery,
} from '../../api/organization/graphql';

import type { useOrganizationClient } from './useOrganizationClient';
import type { useOrganizationCommands } from './useOrganizationCommands';

export type OrganizationWorkspace = OrganizationWorkspacesQuery['organizationWorkspaces'][number];
export type OrganizationCompany = OrganizationCompaniesQuery['organizationCompanies'][number];
export type OrganizationClientScope = ReturnType<typeof useOrganizationClient>;
export type OrganizationCommands = ReturnType<typeof useOrganizationCommands>;

export interface OrganizationScope extends OrganizationClientScope {
  organization: OrganizationWorkspace;
  companies: OrganizationCompany[];
  company: OrganizationCompany | null;
  commands: OrganizationCommands;
  refreshAccess: () => void;
}

export function organizationScopeKey(scope: OrganizationScope): string {
  return JSON.stringify([
    scope.ownerKey,
    scope.organization.id,
    scope.organization.version,
    scope.company?.membershipId,
    scope.companies.map((company) => [
      company.membershipId,
      company.version,
      company.capabilities,
      company.runtimeStatus,
      company.installedVersion,
      company.directorySyncStatus,
    ]),
  ]);
}
