import { useState } from 'react';

import type { OrganizationOperation } from '../../api/organization/graphql';

import { readHrResource, records } from './organizationHrModel';
import { organizationScopeKey, type OrganizationScope } from './organizationTypes';
import { useOrganizationQuery } from './useOrganizationQuery';

export function useOrganizationSourceList(
  scope: OrganizationScope,
  operation: OrganizationOperation,
  collection: string
) {
  const [cursors, setCursors] = useState<(string | null)[]>([null]);
  const after = cursors[cursors.length - 1];
  const { company } = scope;
  const query = useOrganizationQuery(
    company ? `${organizationScopeKey(scope)}|${operation}|${after ?? ''}` : null,
    async () => {
      if (!company) return null;
      const result = await readHrResource(scope, operation, company.membershipId, company.version, {
        after,
        first: 25,
      });
      return { ...result, rows: records(result.record[collection]) };
    }
  );
  return {
    ...query,
    hasPrevious: cursors.length > 1,
    previous: () => setCursors((current) => (current.length > 1 ? current.slice(0, -1) : current)),
    next: () => {
      const cursor = query.data?.record.after;
      if (typeof cursor === 'string' && query.data?.record.has_more === true)
        setCursors((current) => [...current, cursor]);
    },
  };
}
