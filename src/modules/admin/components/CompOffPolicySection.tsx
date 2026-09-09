import { useState } from 'react';

import { createPermissionService } from '../../../auth/permissionService';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import PageInformation from '../../../components/common/PageInformation';
import { useAuth } from '../../../contexts/AuthContext';
import {
  CompOffSettingsDocument,
  SaveCompOffPolicyDocument,
  type CompOffPolicy,
} from '../../leave/compOffDocuments';
import { useCompOffOwnerKey, useCompOffResource } from '../../leave/hooks/useCompOffResource';
import {
  compOffPolicyLabel,
  emptyCompOffPolicy,
  formFromCompOffPolicy,
  type CompOffPolicyForm,
  type CompOffSettings,
} from '../compOffPolicyForm';

import ApprovedCompOffLeaveSection from './ApprovedCompOffLeaveSection';
import CompOffPolicyModal from './CompOffPolicyModal';

const PolicyTable = ({
  data,
  busy,
  edit,
}: {
  data: CompOffSettings;
  busy: boolean;
  edit: (policy: CompOffPolicy) => void;
}) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[640px] text-left text-sm">
      <thead>
        <tr className="border-b border-line text-content-secondary">
          <th className="py-2">Applies to</th>
          <th>Status</th>
          <th>Validity</th>
          <th>Monthly / yearly / unused</th>
          <th className="text-right">Action</th>
        </tr>
      </thead>
      <tbody>
        {data.compOffPolicies.map((policy) => (
          <tr key={policy.id} className="border-b border-line">
            <td className="py-3 font-medium">
              {compOffPolicyLabel(policy, data.compOffPolicyTargets)}
            </td>
            <td>
              <Badge size="sm" variant={policy.enabled ? 'success' : 'neutral'}>
                {policy.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </td>
            <td>{policy.validityDays} days</td>
            <td>
              {policy.monthlyEarningLimit ?? 'No limit'} / {policy.yearlyEarningLimit ?? 'No limit'}{' '}
              / {policy.maxUnusedBalance ?? 'No limit'}
            </td>
            <td className="text-right">
              <Button size="sm" variant="quiet" disabled={busy} onClick={() => edit(policy)}>
                Edit
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {data.compOffPolicies.length === 0 && (
      <p className="py-4 text-sm text-content-secondary">
        No comp-off policy configured. Create a company default or a policy for a designation or
        employee.
      </p>
    )}
  </div>
);

const PolicySettings = () => {
  const board = useCompOffResource<CompOffSettings>(CompOffSettingsDocument, {});
  const [form, setForm] = useState<CompOffPolicyForm | null>(null);
  return (
    <Card title="Comp-off policies">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <PageInformation title="Comp-off policy">
          <p className="max-w-2xl text-sm text-content-secondary">
            Employee settings take priority over designation settings, followed by the company
            default. Credits use a separate comp-off balance.
          </p>
        </PageInformation>
        <Button
          size="sm"
          disabled={board.loading || board.busy || !board.data}
          onClick={() => setForm(emptyCompOffPolicy)}
        >
          New policy
        </Button>
      </div>
      {board.loading && (
        <p role="status" className="text-sm text-content-secondary">
          Loading policies…
        </p>
      )}
      {board.error && !form && (
        <div role="alert" className="flex items-center gap-3 text-sm text-status-danger">
          {board.error}
          <Button size="sm" variant="outline" onClick={board.reload}>
            Retry
          </Button>
        </div>
      )}
      {board.data && (
        <PolicyTable
          data={board.data}
          busy={board.busy}
          edit={(policy) => setForm(formFromCompOffPolicy(policy))}
        />
      )}
      {form && board.data && (
        <CompOffPolicyModal
          initial={form}
          targets={board.data.compOffPolicyTargets}
          busy={board.busy}
          error={board.error}
          close={() => setForm(null)}
          save={(input) => board.mutate(SaveCompOffPolicyDocument, { input })}
        />
      )}
    </Card>
  );
};

const CompOffPolicySection = () => {
  const { clientSession } = useAuth();
  const owner = useCompOffOwnerKey();
  if (!createPermissionService(clientSession).canCapability('action.leave.manage')) return null;
  return (
    <div key={owner} className="space-y-4">
      <PolicySettings />
      <ApprovedCompOffLeaveSection />
    </div>
  );
};
export default CompOffPolicySection;
