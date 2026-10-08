import { useCallback, useEffect, useState } from 'react';

import {
  AdminWorkflowsDataDocument,
  AdminWorkflowsStepsDataDocument,
  type AdminWorkflowsDataQuery,
  type AdminWorkflowsStepsDataQuery,
} from '../../api/graphql/graphql';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

import { workflowBelongsToDomain, type WorkflowDomain } from './workflowSetup';

export function useWorkflowData(domain: WorkflowDomain) {
  const client = useGraphClient('client');
  const [data, setData] = useState<AdminWorkflowsDataQuery | null>(null);
  const [stepsData, setStepsData] = useState<AdminWorkflowsStepsDataQuery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    const response = await client.request(AdminWorkflowsDataDocument, { wl: 30, il: 50 });
    const base = {
      ...response,
      workflows: response.workflows.filter((workflow) =>
        workflowBelongsToDomain(workflow.entityType, domain)
      ),
      workflowInstances: response.workflowInstances.filter((instance) =>
        workflowBelongsToDomain(instance.entityType, domain)
      ),
    };
    try {
      const responseSteps = await client.request(AdminWorkflowsStepsDataDocument, { wl: 30 });
      return {
        base,
        withSteps: {
          ...responseSteps,
          workflowsWithSteps: responseSteps.workflowsWithSteps.filter(
            (row) =>
              workflowBelongsToDomain(row.workflow.entityType, domain) &&
              base.workflows.some(
                (workflow) =>
                  workflow.id === row.workflow.id && workflow.entityType === row.workflow.entityType
              )
          ),
        },
      };
    } catch {
      return { base, withSteps: null };
    }
  }, [client, domain]);
  const refresh = useCallback(async () => {
    const result = await load();
    setData(result.base);
    setStepsData(result.withSteps);
  }, [load]);
  useEffect(() => {
    const lifecycle = { cancelled: false };
    void load()
      .then((result) => {
        if (lifecycle.cancelled) return;
        setData(result.base);
        setStepsData(result.withSteps);
      })
      .catch((cause: unknown) => {
        if (!lifecycle.cancelled) setError(graphQlUserMessage(cause));
      })
      .finally(() => {
        if (!lifecycle.cancelled) setLoading(false);
      });
    return () => {
      lifecycle.cancelled = true;
    };
  }, [load]);
  return { client, data, stepsData, loading, error, refresh };
}
