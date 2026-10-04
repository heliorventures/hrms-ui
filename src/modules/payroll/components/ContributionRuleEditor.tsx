import { useState, type FormEvent } from 'react';

import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import {
  emptyFormula,
  type ContributionPolicy,
  type PolicyVersion,
  type WageClass,
} from '../contributionTypes';

import ContributionFormulaFields from './ContributionFormulaFields';
import EsiPolicyFields from './EsiPolicyFields';

const parseClassifications = (classes: string): Record<string, WageClass> | null => {
  const result: Record<string, WageClass> = {};
  for (const line of classes.split('\n').filter((value) => value.trim())) {
    const parts = line.split('=').map((part) => part.trim());
    const [code, value] = parts;
    if (
      parts.length !== 2 ||
      !code ||
      code in result ||
      !['INCLUDED', 'EXCLUDED_WITH_ADDBACK', 'EXCLUDED_OUTSIDE_ADDBACK'].includes(value)
    )
      return null;
    result[code] = value as WageClass;
  }
  return result;
};

const ContributionRuleEditor = ({
  current,
  busy,
  onSave,
}: {
  current: PolicyVersion | null;
  busy: boolean;
  onSave: (value: ContributionPolicy) => void;
}) => {
  const [policy, setPolicy] = useState<ContributionPolicy>(
    current?.policy ?? {
      effective_from: '',
      effective_until: null,
      lwp_divisor: 31,
      origin: 'HR_CONFIGURATION',
      reason: '',
      pf_employee: emptyFormula(),
      pf_employer: emptyFormula(),
      esi_basis: emptyFormula(),
      esi_employer_rate: '0.0325',
      company_esi_covered: false,
      esi_mode: 'INDIA_COSS_2025',
      classifications: {},
      professional_tax: null,
    }
  );
  const [classes, setClasses] = useState(
    Object.entries(policy.classifications)
      .map(([code, value]) => `${code}=${value}`)
      .join('\n')
  );
  const [error, setError] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    const classifications = parseClassifications(classes);
    if (!classifications) {
      setError('Review every ESI wage classification.');
      return;
    }
    onSave({ ...policy, classifications, origin: 'HR_CONFIGURATION' });
  };
  return (
    <form onSubmit={submit} className="space-y-4" data-tour-anchor="payroll.company-rules">
      <p className="text-sm">
        These company rules apply by effective date. Individual PF/ESI applicability is reviewed in
        monthly inputs. Imported custom rules require an HR explanation.
      </p>
      {current && (
        <p>
          Latest revision {current.revision} · {current.policy.origin.replace(/_/g, ' ')}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          required
          label="Rules effective from"
          type="date"
          value={policy.effective_from}
          onChange={(e) => setPolicy({ ...policy, effective_from: e.target.value })}
        />
        <Input
          label="Rules effective until (optional)"
          type="date"
          value={policy.effective_until ?? ''}
          onChange={(e) => setPolicy({ ...policy, effective_until: e.target.value || null })}
        />
        <Input
          required
          label="LWP day divisor"
          type="number"
          min={1}
          max={31}
          value={policy.lwp_divisor}
          onChange={(e) => setPolicy({ ...policy, lwp_divisor: Number(e.target.value) })}
        />
        <Input
          label="Monthly professional tax"
          value={policy.professional_tax ?? ''}
          onChange={(e) => setPolicy({ ...policy, professional_tax: e.target.value || null })}
        />
      </div>
      <Input
        required
        label="Rule reason"
        value={policy.reason}
        onChange={(e) => setPolicy({ ...policy, reason: e.target.value })}
        maxLength={2000}
      />
      <div className="grid gap-3 lg:grid-cols-2">
        <ContributionFormulaFields
          label="Employee PF"
          value={policy.pf_employee}
          onChange={(value) => setPolicy({ ...policy, pf_employee: value })}
        />
        <ContributionFormulaFields
          label="Employer PF"
          value={policy.pf_employer}
          onChange={(value) => setPolicy({ ...policy, pf_employer: value })}
        />
      </div>
      <EsiPolicyFields
        policy={policy}
        setPolicy={setPolicy}
        classes={classes}
        setClasses={setClasses}
      />
      {error && <p role="alert">{error}</p>}
      <Button type="submit" disabled={busy}>
        Save company rules
      </Button>
    </form>
  );
};
export default ContributionRuleEditor;
