import Input from '../../../components/common/Input';
import type { ContributionPolicy } from '../contributionTypes';

import ContributionFormulaFields from './ContributionFormulaFields';

interface Props {
  policy: ContributionPolicy;
  setPolicy: (value: ContributionPolicy) => void;
  classes: string;
  setClasses: (value: string) => void;
}
const EsiPolicyFields = ({ policy, setPolicy, classes, setClasses }: Props) => (
  <>
    <label className="flex gap-2">
      <input
        type="checkbox"
        checked={policy.company_esi_covered}
        onChange={(e) => setPolicy({ ...policy, company_esi_covered: e.target.checked })}
      />
      Company is covered by ESI
    </label>
    <label>
      ESI wage calculation
      <select
        className="block w-full rounded border p-2"
        value={policy.esi_mode}
        onChange={(e) => setPolicy({ ...policy, esi_mode: e.target.value })}
      >
        <option value="INDIA_COSS_2025">Statutory wage classifications</option>
        <option value="CUSTOM_COMPONENTS">Custom component formula (reason required)</option>
      </select>
    </label>
    {policy.esi_mode === 'CUSTOM_COMPONENTS' ? (
      <>
        <ContributionFormulaFields
          label="Employee ESI"
          value={policy.esi_basis}
          onChange={(value) => setPolicy({ ...policy, esi_basis: value })}
        />
        <Input
          required
          label="Employer ESI fractional rate"
          value={policy.esi_employer_rate}
          onChange={(e) => setPolicy({ ...policy, esi_employer_rate: e.target.value })}
        />
      </>
    ) : (
      <label className="block">
        ESI component classifications
        <textarea
          className="block w-full rounded border p-2"
          rows={4}
          value={classes}
          onChange={(e) => setClasses(e.target.value)}
          placeholder={'BASIC=INCLUDED\nHRA=EXCLUDED_WITH_ADDBACK'}
        />
        <span className="text-sm">
          Classify every remuneration component as INCLUDED, EXCLUDED_WITH_ADDBACK or
          EXCLUDED_OUTSIDE_ADDBACK. Unclassified amounts require review.
        </span>
      </label>
    )}
  </>
);
export default EsiPolicyFields;
