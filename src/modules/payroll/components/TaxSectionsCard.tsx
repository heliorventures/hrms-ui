import type { FormEvent } from 'react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Table from '../../../components/common/Table';
import type { TaxSectionDefRow } from '../payrollTaxTypes';

interface TaxSectionsCardProps {
  error: string | null;
  message: string | null;
  sectionCode: string;
  sectionLabel: string;
  sectionMax: string;
  sectionRegime: string;
  sections: TaxSectionDefRow[];
  submitting: boolean;
  onCodeChange: (value: string) => void;
  onLabelChange: (value: string) => void;
  onMaxChange: (value: string) => void;
  onRegimeChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const TaxSectionsCard = ({
  error,
  message,
  sectionCode,
  sectionLabel,
  sectionMax,
  sectionRegime,
  sections,
  submitting,
  onCodeChange,
  onLabelChange,
  onMaxChange,
  onRegimeChange,
  onSubmit,
}: TaxSectionsCardProps) => (
  <Card title="Income tax deduction sections">
    <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
      Maintain section labels for employee proofs. Use OLD, NEW, or ALL for regime scope.
    </p>
    {error && <p className="mb-2 text-sm text-amber-800 dark:text-amber-200">{error}</p>}
    {sections.length > 0 && (
      <div className="mb-4 overflow-x-auto">
        <Table
          data={sections}
          keyExtractor={(row) => row.id}
          columns={[
            { key: 'sectionCode', label: 'Code', render: (row) => row.sectionCode },
            { key: 'sectionLabel', label: 'Label', render: (row) => row.sectionLabel },
            { key: 'regimeScope', label: 'Regime', render: (row) => row.regimeScope ?? 'ALL' },
            { key: 'maxDeductionAmount', label: 'Cap', render: (row) => row.maxDeductionAmount ?? '-' },
            { key: 'isActive', label: 'Active', render: (row) => (row.isActive ? 'Yes' : 'No') },
          ]}
        />
      </div>
    )}
    <form className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end" onSubmit={onSubmit}>
      <Input label="Section code" value={sectionCode} onChange={(event) => onCodeChange(event.target.value)} />
      <div className="min-w-[14rem] flex-1">
        <Input label="Label" value={sectionLabel} onChange={(event) => onLabelChange(event.target.value)} />
      </div>
      <Input label="Regime" value={sectionRegime} onChange={(event) => onRegimeChange(event.target.value)} />
      <Input label="Max deduction" value={sectionMax} onChange={(event) => onMaxChange(event.target.value)} />
      <Button type="submit" variant="secondary" size="sm" disabled={submitting}>
        {submitting ? 'Saving...' : 'Upsert section'}
      </Button>
    </form>
    {message && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{message}</p>}
  </Card>
);

export default TaxSectionsCard;
