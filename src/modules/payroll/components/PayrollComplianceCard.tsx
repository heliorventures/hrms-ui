import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Input from '../../../components/common/Input';
import type { PayrollComplianceFormState } from '../payrollTypes';

interface PayrollComplianceCardProps {
  form: PayrollComplianceFormState;
  loading: boolean;
  busy: boolean;
  error: string | null;
  ok: string | null;
  onChange: (field: keyof PayrollComplianceFormState, value: string) => void;
  onSave: () => void;
}

const PayrollComplianceCard = ({
  form,
  loading,
  busy,
  error,
  ok,
  onChange,
  onSave,
}: PayrollComplianceCardProps) => (
  <Card title="Employer branding & statutory (India)">
    <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
      Employer TAN / name drive Form 24Q / Form 16 CSV columns (empty → env fallback on the
      payroll process). <strong className="font-medium">Pay run</strong> posts one line against
      the <span className="font-mono">baseSalaryComponentCode</span> earning component
      (employment salary); arrear payouts use{' '}
      <span className="font-mono">arrearSalaryComponentCode</span>. Payslip PDF supports raster
      logos (<strong>PNG</strong>/<strong>JPEG</strong> directly; <strong>WebP</strong>/
      <strong>SVG</strong> are rasterized in-browser for PDF). Requires payroll statutory export
      role.
    </p>
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <Input
        label="Employer TAN"
        value={form.employerTanInput}
        onChange={(event) => onChange('employerTanInput', event.target.value)}
        placeholder="e.g. BDEL12345R"
        autoComplete="off"
        className="font-mono"
      />
      <Input
        label="Employer legal name"
        value={form.employerLegalNameInput}
        onChange={(event) => onChange('employerLegalNameInput', event.target.value)}
        placeholder="Registered name as per TAN"
        autoComplete="organization"
        className="min-w-[16rem]"
      />
      <Input
        label="Base earning code"
        value={form.baseComponentInput}
        onChange={(event) => onChange('baseComponentInput', event.target.value)}
        placeholder="BASIC"
        className="font-mono"
      />
      <Input
        label="Arrear earning code"
        value={form.arrearComponentInput}
        onChange={(event) => onChange('arrearComponentInput', event.target.value)}
        placeholder="ARREAR"
        className="font-mono"
      />
      <Input
        label="Payslip header (display name)"
        value={form.payslipHeaderInput}
        onChange={(event) => onChange('payslipHeaderInput', event.target.value)}
        placeholder="Company name as on payslip"
        className="min-w-[14rem]"
      />
      <Input
        label="Logo file UUID (optional)"
        value={form.payslipLogoIdInput}
        onChange={(event) => onChange('payslipLogoIdInput', event.target.value)}
        placeholder="file_storage.id after HR upload"
        className="min-w-[16rem] font-mono text-xs"
      />
      <Button
        type="button"
        variant="primary"
        size="sm"
        disabled={busy || loading}
        onClick={() => onSave()}
      >
        {busy ? 'Saving…' : 'Save'}
      </Button>
    </div>
    {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    {ok && !error && <p className="mt-2 text-sm text-green-700 dark:text-green-400">{ok}</p>}
  </Card>
);

export default PayrollComplianceCard;
