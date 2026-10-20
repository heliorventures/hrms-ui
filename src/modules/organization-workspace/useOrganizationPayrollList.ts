import { useState } from 'react';

import { OrganizationOperation } from '../../api/organization/graphql';

import { readOrganizationResource } from './organizationApi';
import { OrganizationDataError } from './organizationDataError';
import { asRecord, sourceVersion } from './organizationDocuments';
import {
  organizationScopeKey,
  type OrganizationCompany,
  type OrganizationScope,
} from './organizationTypes';
import { useOrganizationQuery } from './useOrganizationQuery';

export function useOrganizationPayrollList(scope: OrganizationScope, company: OrganizationCompany) {
  const [cursors, setCursors] = useState<string[]>([]);
  const after = cursors.length > 0 ? cursors[cursors.length - 1] : null;
  const query = useOrganizationQuery(
    `${organizationScopeKey(scope)}|payroll|${after ?? ''}`,
    async () => {
      const outcome = await readOrganizationResource(
        scope.client,
        {
          organizationId: scope.organization.id,
          membershipId: company.membershipId,
          operation: OrganizationOperation.PayrollList,
          resourceId: company.membershipId,
          expectedVersion: company.version,
          payload: { after, first: 50 },
        },
        scope.refreshAccess
      );
      if (outcome.status !== 'COMMITTED' || outcome.resourceId !== company.membershipId)
        throw new OrganizationDataError('The source company has not confirmed payroll data.');
      const result = asRecord(outcome.result);
      if (!Array.isArray(result.cycles) || typeof result.has_more !== 'boolean')
        throw new OrganizationDataError('Invalid source payroll list.');
      const cycles = result.cycles.map(asRecord);
      cycles.forEach((cycle) => sourceVersion(cycle));
      if (result.has_more && typeof result.after !== 'string')
        throw new OrganizationDataError('The source payroll cursor is unavailable.');
      return { cycles, hasNextPage: result.has_more, endCursor: result.after };
    }
  );
  const next = () => {
    const cursor = query.data?.endCursor;
    if (query.data?.hasNextPage && typeof cursor === 'string')
      setCursors((previous) => [...previous, cursor]);
  };
  const previous = () => setCursors((history) => history.slice(0, -1));
  return { ...query, next, previous, canPrevious: cursors.length > 0 };
}
