import type { FormEvent } from 'react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';

interface TaxDeclarationFormCardProps {
  deductions: string;
  fiscalYear: string;
  grossIncome: string;
  message: string | null;
  regime: string;
  selectedConfigId: string;
  submitting: boolean;
  onDeductionsChange: (value: string) => void;
  onFiscalYearChange: (value: string) => void;
  onGrossIncomeChange: (value: string) => void;
  onRegimeChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const TaxDeclarationFormCard = ({
  deductions,
  fiscalYear,
  grossIncome,
  message,
  regime,
  selectedConfigId,
  submitting,
  onDeductionsChange,
  onFiscalYearChange,
  onGrossIncomeChange,
  onRegimeChange,
  onSubmit,
}: TaxDeclarationFormCardProps) => (
  <Card title="Update declaration">
    <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
      Uses the tax configuration selected above. Requires a signed-in employee.
    </p>
    <form onSubmit={onSubmit} className="max-w-lg space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="Fiscal year"
          value={fiscalYear}
          onChange={(event) => onFiscalYearChange(event.target.value)}
          inputMode="numeric"
          fullWidth
          required
        />
        <Input
          label="Regime"
          value={regime}
          onChange={(event) => onRegimeChange(event.target.value)}
          fullWidth
          placeholder="e.g. NEW_REGIME"
        />
      </div>
      <Input
        label="Gross income"
        value={grossIncome}
        onChange={(event) => onGrossIncomeChange(event.target.value)}
        fullWidth
        inputMode="decimal"
      />
      <Input
        label="Total deductions"
        value={deductions}
        onChange={(event) => onDeductionsChange(event.target.value)}
        fullWidth
        inputMode="decimal"
      />
      {message && <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>}
      <Button type="submit" variant="primary" disabled={submitting || !selectedConfigId}>
        {submitting ? 'Saving...' : 'Save'}
      </Button>
    </form>
  </Card>
);

export default TaxDeclarationFormCard;
