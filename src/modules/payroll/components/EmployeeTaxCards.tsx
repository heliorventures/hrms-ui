import Badge from '../../../components/common/Badge';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import { formatAmountString, formatInr } from '../payrollFormatters';
import type {
  PayslipIndiaFyTotals,
  TaxComputationSelfRow,
  TaxConfigurationRow,
  TaxProofLineSelfRow,
  TaxSlabRow,
} from '../payrollTypes';

function proofBadgeVariant(status: string) {
  switch (status) {
    case 'APPROVED':
      return 'success' as const;
    case 'REJECTED':
      return 'warning' as const;
    default:
      return 'neutral' as const;
  }
}

export const ActiveTaxConfigurationCard = ({
  activeTaxConfig,
  loadingShell,
}: {
  activeTaxConfig: TaxConfigurationRow | null;
  loadingShell: boolean;
}) => (
  <Card title="Active tax configuration">
    {loadingShell ? (
      <p className="text-sm text-slate-500">Loading…</p>
    ) : activeTaxConfig ? (
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant={activeTaxConfig.isActive ? 'success' : 'neutral'}>
          {activeTaxConfig.isActive ? 'Active' : 'Inactive'}
        </Badge>
        <Badge variant="info">{activeTaxConfig.regime ?? 'N/A'}</Badge>
        <Badge variant="neutral">{activeTaxConfig.countryCode}</Badge>
        <span className="text-sm text-slate-600 dark:text-slate-300">
          FY {activeTaxConfig.fiscalYear}
        </span>
      </div>
    ) : (
      <p className="text-sm text-slate-500">No active tax configuration found.</p>
    )}
  </Card>
);

export const TaxSlabsCard = ({
  activeTaxSlabs,
  loadingShell,
}: {
  activeTaxSlabs: TaxSlabRow[];
  loadingShell: boolean;
}) => (
  <Card title="Tax slabs">
    <Table
      data={activeTaxSlabs}
      loading={loadingShell}
      loadingMessage="Loading…"
      emptyMessage="No tax slabs found."
      keyExtractor={(row) => row.id}
      columns={[
        {
          key: 'incomeFrom',
          label: 'Income from',
          render: (row: TaxSlabRow) => formatInr(Number(row.incomeFrom)),
        },
        {
          key: 'incomeTo',
          label: 'Income to',
          render: (row: TaxSlabRow) =>
            row.incomeTo ? formatInr(Number(row.incomeTo)) : 'No upper limit',
        },
        {
          key: 'taxRate',
          label: 'Tax rate',
          render: (row: TaxSlabRow) => (row.taxRate ? `${row.taxRate}%` : '—'),
        },
      ]}
    />
  </Card>
);

export const PayslipFySummaryCard = ({
  totals,
  payslipError,
  payslipsLoading,
}: {
  totals: PayslipIndiaFyTotals;
  payslipError: string | null;
  payslipsLoading: boolean;
}) => (
  <Card title={`Payslip summary (India FY ${totals.fyAnchor}-${totals.fyAnchor + 1})`}>
    {payslipsLoading ? (
      <p className="text-sm text-slate-500">Loading payslip data…</p>
    ) : payslipError ? (
      <p className="text-sm text-amber-800 dark:text-amber-200">{payslipError}</p>
    ) : (
      <>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ['Gross (payslips in FY)', formatInr(totals.gross)],
            ['TDS withheld (payslips)', formatInr(totals.tds)],
            ['Payslip periods', String(totals.slipCount)],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {label}
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{value}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Rolled up from stored payslips for cycles in this FY anchor (April-March). Not a statutory
          certificate; use for planning next to your declaration above.
        </p>
      </>
    )}
  </Card>
);

export const EmployeeTaxTables = ({
  computations,
  loading,
  proofs,
  hasError,
}: {
  computations: TaxComputationSelfRow[] | null;
  loading: boolean;
  proofs: TaxProofLineSelfRow[] | null;
  hasError: boolean;
}) => (
  <>
    <Card title="Your tax declaration">
      <Table
        data={computations ?? []}
        loading={loading && !hasError}
        loadingMessage="Loading your declaration…"
        emptyMessage="No declaration yet — use the form below once HR has activated a tax regime."
        keyExtractor={(row) => row.id}
        columns={[
          { key: 'fy', label: 'FY', render: (row: TaxComputationSelfRow) => `FY ${row.fiscalYear}` },
          {
            key: 'taxRegimeChosen',
            label: 'Regime',
            render: (row: TaxComputationSelfRow) => row.taxRegimeChosen ?? '—',
          },
          {
            key: 'grossIncome',
            label: 'Gross declared',
            render: (row: TaxComputationSelfRow) => formatAmountString(row.grossIncome),
          },
          {
            key: 'totalDeductions',
            label: 'Deductions',
            render: (row: TaxComputationSelfRow) => formatAmountString(row.totalDeductions),
          },
          {
            key: 'finalTax',
            label: 'Estimated tax',
            render: (row: TaxComputationSelfRow) => formatAmountString(row.finalTax),
          },
          {
            key: 'tdsPerMonth',
            label: 'TDS / month',
            render: (row: TaxComputationSelfRow) => formatAmountString(row.tdsPerMonth),
          },
        ]}
      />
    </Card>
    <Card title="Proof submissions (FY)">
      <Table
        data={proofs ?? []}
        loading={loading && !hasError}
        loadingMessage="Loading proofs…"
        emptyMessage="No proofs for this FY yet — use Submit deduction proof below."
        keyExtractor={(row) => row.id}
        columns={[
          { key: 'sectionCode', label: 'Section' },
          {
            key: 'declaredAmount',
            label: 'Declared',
            render: (row: TaxProofLineSelfRow) => formatAmountString(row.declaredAmount),
          },
          {
            key: 'actualAmount',
            label: 'Actual (proof)',
            render: (row: TaxProofLineSelfRow) => formatAmountString(row.actualAmount),
          },
          {
            key: 'status',
            label: 'Status',
            render: (row: TaxProofLineSelfRow) => (
              <Badge variant={proofBadgeVariant(row.status)}>{row.status}</Badge>
            ),
          },
          {
            key: 'fiscalYear',
            label: 'FY',
            render: (row: TaxProofLineSelfRow) => String(row.fiscalYear),
          },
        ]}
      />
    </Card>
  </>
);
