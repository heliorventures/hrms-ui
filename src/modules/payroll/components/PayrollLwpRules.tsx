import type { GraphQLClient } from 'graphql-request';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import Card from '../../../components/common/Card';
import Input from '../../../components/common/Input';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import type { PolicyVersion } from '../contributionTypes';

const PayrollLwpRules = ({ client }: { client: GraphQLClient }) => {
  const [versions, setVersions] = useState<PolicyVersion[]>([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    void client
      .request<{ companyPayrollPolicies: PolicyVersion[] }>(
        'query PayrollLwpRules { companyPayrollPolicies }'
      )
      .then((result) => {
        if (active) setVersions(result.companyPayrollPolicies);
      })
      .catch((cause: unknown) => {
        if (active) setError(graphQlUserMessage(cause));
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [client]);
  const date = `${month}-01`;
  const candidates = [...versions]
    .filter((row) => row.policy.effective_from <= date)
    .sort(
      (a, b) =>
        b.policy.effective_from.localeCompare(a.policy.effective_from) || b.revision - a.revision
    );
  const [first] = candidates;
  const latestStart = candidates.length ? first : undefined;
  const policy =
    latestStart &&
    (!latestStart.policy.effective_until || latestStart.policy.effective_until >= date)
      ? latestStart
      : undefined;
  return (
    <Card>
      <div className="space-y-3" data-tour-anchor="payroll.unpaid-leave-policy">
        <Input
          label="Payroll month"
          type="month"
          value={month}
          onChange={(event) => setMonth(event.target.value)}
        />
        {busy && <p role="status">Loading company rules...</p>}
        {error && <p role="alert">{error}</p>}
        {!busy &&
          !error &&
          (policy ? (
            <>
              <p>
                Automatic payroll deducts approved unpaid leave from gross earnings using the
                effective company divisor of <strong>{policy.policy.lwp_divisor}</strong>.
              </p>
              <p>
                Monthly regular gross ÷ {policy.policy.lwp_divisor} × unpaid days. The resulting
                reduction is allocated across salary components before configured deductions.
              </p>
              <p>
                Effective from {policy.policy.effective_from}. Reason: {policy.policy.reason}
              </p>
            </>
          ) : (
            <p role="status">
              No company calculation rules are effective for this month. Configure Contribution
              Rules before automatic payroll can calculate.
            </p>
          ))}
        <p>
          Reviewed source months keep their imported LWP amounts. Historical unpaid-leave usage is
          not deducted again. Monthly Inputs accepts a reasoned exception when required.
        </p>
        <Link className="text-indigo-600 underline" to="/payroll/pay?tab=contribution-rules">
          Review or configure company contribution and LWP rules
        </Link>
      </div>
    </Card>
  );
};
export default PayrollLwpRules;
