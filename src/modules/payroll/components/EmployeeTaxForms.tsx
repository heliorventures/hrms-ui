import type { FormEvent } from 'react';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Input from '../../../components/common/Input';
import type { TaxConfigurationRow, TaxSectionCatalogRow } from '../payrollTypes';

export const EmployeeTaxProofFormCard = ({
  activeTaxConfig,
  loading,
  catalog,
  sectionCode,
  declared,
  actual,
  busy,
  message,
  onSectionCodeChange,
  onDeclaredChange,
  onActualChange,
  onSubmit,
}: {
  activeTaxConfig: TaxConfigurationRow | null;
  loading: boolean;
  catalog: TaxSectionCatalogRow[] | null;
  sectionCode: string;
  declared: string;
  actual: string;
  busy: boolean;
  message: string | null;
  onSectionCodeChange: (value: string) => void;
  onDeclaredChange: (value: string) => void;
  onActualChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}) => (
  <Card title="Submit deduction proof">
    {!activeTaxConfig ? (
      <p className="text-sm text-slate-500">Tax configuration missing — HR must enable Manage Tax.</p>
    ) : loading ? (
      <p className="text-sm text-slate-500">Loading…</p>
    ) : (
      <form className="max-w-xl space-y-4" onSubmit={onSubmit}>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Record declared vs claimed amounts under an IT deduction section.{' '}
          {(catalog?.length ?? 0) > 0
            ? 'Pick from your tenant catalogue; HR may cap amounts.'
            : 'No HR catalogue yet — enter a section code freely.'}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {(catalog?.length ?? 0) > 0 ? (
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Section
              <select
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                value={sectionCode}
                onChange={(event) => onSectionCodeChange(event.target.value)}
              >
                {catalog?.map((row) => (
                  <option key={row.id} value={row.sectionCode}>
                    {row.sectionCode} - {row.sectionLabel}
                    {row.maxDeductionAmount != null ? ` (cap ₹${row.maxDeductionAmount})` : ''}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <Input
              label="Section code"
              placeholder="80C"
              value={sectionCode}
              onChange={(event) => onSectionCodeChange(event.target.value)}
            />
          )}
          <Input
            label="Declared (₹)"
            inputMode="decimal"
            placeholder="150000"
            value={declared}
            onChange={(event) => onDeclaredChange(event.target.value)}
          />
        </div>
        <Input
          label="Actual / invested (₹)"
          inputMode="decimal"
          placeholder="Same as declared if proof pending"
          value={actual}
          onChange={(event) => onActualChange(event.target.value)}
        />
        {message && (
          <p
            className={`text-sm ${
              message.startsWith('Proof line submitted')
                ? 'text-emerald-700 dark:text-emerald-300'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {message}
          </p>
        )}
        <Button type="submit" disabled={busy}>
          {busy ? 'Submitting…' : 'Submit proof line'}
        </Button>
      </form>
    )}
  </Card>
);

export const EmployeeTaxDeclarationFormCard = ({
  activeTaxConfig,
  fiscalYear,
  regime,
  gross,
  deductions,
  submitting,
  loading,
  message,
  onFiscalYearChange,
  onRegimeChange,
  onGrossChange,
  onDeductionsChange,
  onSubmit,
}: {
  activeTaxConfig: TaxConfigurationRow | null;
  fiscalYear: string;
  regime: string;
  gross: string;
  deductions: string;
  submitting: boolean;
  loading: boolean;
  message: string | null;
  onFiscalYearChange: (value: string) => void;
  onRegimeChange: (value: string) => void;
  onGrossChange: (value: string) => void;
  onDeductionsChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}) => (
  <Card title="Estimated declaration">
    {!activeTaxConfig ? (
      <p className="text-sm text-slate-500">
        Activate a tax configuration (HR → Manage Tax) before saving declarations.
      </p>
    ) : (
      <form className="max-w-xl space-y-4" onSubmit={onSubmit}>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Save a rough gross and deduction estimate for the selected FY — HR can reconcile with
          slabs and proof approvals separately.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Fiscal year (India anchor year)"
            inputMode="numeric"
            value={fiscalYear}
            onChange={(event) => onFiscalYearChange(event.target.value)}
          />
          <Input
            label="Regime (optional)"
            placeholder="NEW_REGIME / OLD_REGIME"
            value={regime}
            onChange={(event) => onRegimeChange(event.target.value)}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Gross income (estimated)"
            inputMode="decimal"
            placeholder="850000"
            value={gross}
            onChange={(event) => onGrossChange(event.target.value)}
          />
          <Input
            label="Total deductions (estimated)"
            inputMode="decimal"
            placeholder="175000"
            value={deductions}
            onChange={(event) => onDeductionsChange(event.target.value)}
          />
        </div>
        {message && (
          <p
            className={`text-sm ${
              message.startsWith('Saved')
                ? 'text-emerald-700 dark:text-emerald-300'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {message}
          </p>
        )}
        <Button type="submit" disabled={submitting || loading}>
          {submitting ? 'Saving…' : 'Save declaration'}
        </Button>
      </form>
    )}
  </Card>
);
