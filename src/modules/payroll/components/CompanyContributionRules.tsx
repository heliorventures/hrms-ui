import type { GraphQLClient } from 'graphql-request';
import { useEffect, useRef, useState } from 'react';

import Card from '../../../components/common/Card';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import type { ContributionPolicy, PolicyVersion } from '../contributionTypes';

import ContributionRuleEditor from './ContributionRuleEditor';

const CompanyContributionRules = ({ client }: { client: GraphQLClient }) => {
  const [versions, setVersions] = useState<PolicyVersion[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const lifetime = useRef(0);
  useEffect(() => {
    const generation = ++lifetime.current;
    setBusy(true);
    setVersions([]);
    setError('');
    void client
      .request<{ companyPayrollPolicies: PolicyVersion[] }>(
        'query CompanyPayrollPolicies { companyPayrollPolicies }'
      )
      .then((value) => {
        if (lifetime.current === generation) setVersions(value.companyPayrollPolicies);
      })
      .catch((cause: unknown) => {
        if (lifetime.current === generation) setError(graphQlUserMessage(cause));
      })
      .finally(() => {
        if (lifetime.current === generation) setBusy(false);
      });
    return () => {
      lifetime.current = generation + 1;
    };
  }, [client]);
  const latest = versions.reduce<PolicyVersion | null>(
    (prior, row) => (!prior || row.revision > prior.revision ? row : prior),
    null
  );
  const save = async (input: ContributionPolicy) => {
    const generation = lifetime.current;
    setBusy(true);
    setError('');
    try {
      const value = await client.request<{ saveCompanyPayrollPolicy: PolicyVersion }>(
        'mutation SaveCompanyPayrollPolicy($input:JSON!,$expectedRevision:Int){saveCompanyPayrollPolicy(input:$input,expectedRevision:$expectedRevision)}',
        { input, expectedRevision: latest?.revision ?? null }
      );
      if (lifetime.current === generation)
        setVersions((prior) => [...prior, value.saveCompanyPayrollPolicy]);
    } catch (cause) {
      if (lifetime.current === generation) setError(graphQlUserMessage(cause));
    } finally {
      if (lifetime.current === generation) setBusy(false);
    }
  };
  return (
    <Card title="Company contribution rules">
      {error && <p role="alert">{error}</p>}
      {busy ? (
        <p role="status">Loading or saving rules…</p>
      ) : (
        <ContributionRuleEditor
          key={latest?.revision ?? 'new'}
          current={latest}
          busy={busy}
          onSave={(value) => void save(value)}
        />
      )}
    </Card>
  );
};
export default CompanyContributionRules;
