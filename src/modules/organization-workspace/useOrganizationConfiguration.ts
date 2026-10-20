import {
  OrganizationConfigurationDocument,
  type OrganizationConfigurationKind,
} from '../../api/organization/graphql';

import { organizationScopeKey, type OrganizationScope } from './organizationTypes';
import { useOrganizationPage } from './useOrganizationPage';

export function useOrganizationConfiguration(
  scope: OrganizationScope,
  kind: OrganizationConfigurationKind
) {
  return useOrganizationPage(
    `${organizationScopeKey(scope)}|configuration|${kind}`,
    async (after) => {
      const page = (
        await scope.client.request(OrganizationConfigurationDocument, {
          organizationId: scope.organization.id,
          kind,
          after,
          first: 50,
        })
      ).organizationConfiguration;
      return {
        ...page,
        endCursor: page.nextCursor,
        hasNextPage: page.nextCursor !== null && page.nextCursor !== undefined,
      };
    }
  );
}
