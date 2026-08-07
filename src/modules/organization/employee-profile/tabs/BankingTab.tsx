import { useEffect, useState, type ChangeEvent } from 'react';
import type { GraphQLClient } from 'graphql-request';
import { Landmark, Pencil, Shield } from 'lucide-react';

import type { EmployeeProfileModel } from '../types';
import { InfoCard } from '../components/InfoCard';
import { VerificationBadge } from '../components/StatusBadge';
import Input from '../../../../components/common/Input';
import Button from '../../../../components/common/Button';
import { UpsertEmployeePrimaryBankDocument } from '../../../../api/graphql/graphql';
import { graphQlUserMessage } from '../../../../utils/graphqlUserMessage';

interface BankingTabProps {
  employeeId: string;
  client: GraphQLClient;
  model: EmployeeProfileModel;
  onSaved?: () => void;
}

export function BankingTab({ employeeId, client, model, onSaved }: BankingTabProps) {
  const b = model.banking;
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bankName, setBankName] = useState(b.bankName === '—' ? '' : b.bankName);
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState(b.ifscCode === '—' ? '' : b.ifscCode);
  const [accountType, setAccountType] = useState(b.accountType === '—' ? '' : b.accountType);

  useEffect(() => {
    if (!editing) {
      setBankName(b.bankName === '—' ? '' : b.bankName);
      setIfscCode(b.ifscCode === '—' ? '' : b.ifscCode);
      setAccountType(b.accountType === '—' ? '' : b.accountType);
      setAccountNumber('');
      setError(null);
    }
  }, [b.bankName, b.ifscCode, b.accountType, editing]);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await client.request(UpsertEmployeePrimaryBankDocument, {
        input: {
          employeeId,
          bankName: bankName.trim(),
          accountNumber: accountNumber.trim(),
          ifscCode: ifscCode.trim().toUpperCase(),
          accountType: accountType.trim() || undefined,
        },
      });
      setEditing(false);
      setAccountNumber('');
      onSaved?.();
    } catch (e) {
      setError(graphQlUserMessage(e));
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={() => setEditing(true)}
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden />
            {b.bankName === '—' ? 'Add account' : 'Update'}
          </Button>
        </div>
        <InfoCard
          title="Bank account"
          subtitle="Sensitive fields are masked in the UI"
          action={<VerificationBadge status={b.verificationStatus} />}
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="flex items-start gap-2 rounded-xl bg-slate-50/90 p-3 dark:bg-slate-800/50">
              <Landmark className="h-4 w-4 text-indigo-500" aria-hidden />
              <div>
                <p className="text-xs font-medium uppercase text-slate-400">Bank name</p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{b.bankName}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-xl bg-slate-50/90 p-3 dark:bg-slate-800/50">
              <Shield className="h-4 w-4 text-indigo-500" aria-hidden />
              <div>
                <p className="text-xs font-medium uppercase text-slate-400">Account number</p>
                <p className="font-mono text-sm font-medium tracking-wide text-slate-900 dark:text-slate-100">
                  {b.accountNumberMasked}
                </p>
              </div>
            </div>
            <div className="rounded-xl bg-slate-50/90 p-3 dark:bg-slate-800/50">
              <p className="text-xs font-medium uppercase text-slate-400">IFSC</p>
              <p className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100">
                {b.ifscCode}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50/90 p-3 dark:bg-slate-800/50">
              <p className="text-xs font-medium uppercase text-slate-400">Account type</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{b.accountType}</p>
            </div>
          </div>
        </InfoCard>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-2xl border border-red-200/80 bg-red-50/90 px-4 py-2 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100">
          {error}
        </div>
      ) : null}
      <InfoCard title="Edit primary bank" subtitle="Stored as the employee’s salary account">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            label="Bank name"
            value={bankName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setBankName(e.target.value)}
            fullWidth
          />
          <Input
            label="Account number"
            value={accountNumber}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setAccountNumber(e.target.value)}
            fullWidth
            placeholder="Full account number"
          />
          <Input
            label="IFSC"
            value={ifscCode}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setIfscCode(e.target.value)}
            fullWidth
          />
          <Input
            label="Account type (optional)"
            value={accountType}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setAccountType(e.target.value)}
            fullWidth
            placeholder="e.g. Savings"
          />
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => setEditing(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={
              saving ||
              !bankName.trim() ||
              !accountNumber.trim() ||
              !ifscCode.trim()
            }
            onClick={() => void save()}
          >
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </InfoCard>
    </div>
  );
}
