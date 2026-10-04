import type { FormEvent } from 'react';

import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Input from '../../../components/common/Input';
import type { TaxSectionCatalogRow } from '../payrollTypes';
import type { TaxSubmissionContext } from '../taxSubmissionContext';

function hasCatalog(catalog: TaxSectionCatalogRow[] | null): boolean {
  return Boolean(catalog?.length);
}

export const EmployeeTaxProofFormCard = ({
  submissionContext,
  loading,
  catalog,
  sectionCode,
  declared,
  actual,
  proofFile,
  busy,
  message,
  onSectionCodeChange,
  onDeclaredChange,
  onActualChange,
  onProofFileChange,
  onSubmit,
}: {
  submissionContext: TaxSubmissionContext | null;
  loading: boolean;
  catalog: TaxSectionCatalogRow[] | null;
  sectionCode: string;
  declared: string;
  actual: string;
  proofFile: File | null;
  busy: boolean;
  message: string | null;
  onSectionCodeChange: (value: string) => void;
  onDeclaredChange: (value: string) => void;
  onActualChange: (value: string) => void;
  onProofFileChange: (file: File | null) => void;
  onSubmit: (event: FormEvent) => void;
}) => (
  <Card title="Submit Deduction Proof">
    {!submissionContext || loading ? (
      <p className="text-sm text-slate-500">
        {loading
          ? 'Loading...'
          : 'No employee tax settings apply to this financial year. Contact HR.'}
      </p>
    ) : (
      <form className="max-w-xl space-y-4" onSubmit={onSubmit}>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Record declared vs claimed amounts under an IT deduction section.{' '}
          {hasCatalog(catalog)
            ? 'Pick from your tenant catalogue; HR may cap amounts.'
            : 'No HR catalogue yet — enter a section code freely.'}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {hasCatalog(catalog) ? (
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
                    {row.maxDeductionAmount !== null ? ` (cap ₹${row.maxDeductionAmount})` : ''}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <Input
              label="Section Code"
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
          label="Actual / Invested (₹)"
          inputMode="decimal"
          placeholder="Same as declared if proof pending"
          value={actual}
          onChange={(event) => onActualChange(event.target.value)}
        />
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
          Proof File
          <input
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            onChange={(event) => onProofFileChange(event.target.files?.[0] ?? null)}
            className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:file:bg-slate-700 dark:file:text-slate-100"
            required={!proofFile}
          />
          <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
            PDF, JPG, or PNG up to 6 MB.
          </span>
        </label>
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
          {busy ? 'Submitting...' : 'Submit Proof Line'}
        </Button>
      </form>
    )}
  </Card>
);

export const EmployeeTaxDeclarationFormCard = ({
  submissionContext,
  fiscalYear,
  regime,
  gross,
  deductions,
  submitting,
  loading,
  message,
  onGrossChange,
  onDeductionsChange,
  onSubmit,
}: {
  submissionContext: TaxSubmissionContext | null;
  fiscalYear: string;
  regime: string;
  gross: string;
  deductions: string;
  submitting: boolean;
  loading: boolean;
  message: string | null;
  onGrossChange: (value: string) => void;
  onDeductionsChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}) => (
  <Card title="Estimated Declaration">
    {!submissionContext ? (
      <p className="text-sm text-slate-500">
        No employee tax settings apply to this financial year. Contact HR.
      </p>
    ) : (
      <form className="max-w-xl space-y-4" onSubmit={onSubmit}>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Save a rough gross and deduction estimate for the selected FY — HR can reconcile with
          payroll information and proof approvals separately. This declaration does not change your
          assigned regime.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Fiscal Year (India Anchor Year)"
            inputMode="numeric"
            value={fiscalYear}
            readOnly
          />
          <Input
            label="Assigned tax regime"
            placeholder="Configured by HR"
            value={regime}
            readOnly
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Gross Income (Estimated)"
            inputMode="decimal"
            placeholder="850000"
            value={gross}
            onChange={(event) => onGrossChange(event.target.value)}
          />
          <Input
            label="Total Deductions (Estimated)"
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
          {submitting ? 'Saving...' : 'Save Declaration'}
        </Button>
      </form>
    )}
  </Card>
);
