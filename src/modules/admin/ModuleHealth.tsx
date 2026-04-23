/**
 * Module Health panel.
 *
 * Probes every federated KabiPay subgraph via the stitching gateway.
 * Useful to confirm the full path — UI → gateway → subgraph → tenant DB
 * — after standing up `kabipay-gateway` and the Rust services.
 *
 * This component intentionally uses raw `gql` strings rather than the
 * codegen-generated helpers so it works even before `npm run codegen`
 * has been executed once.
 */
import { useEffect, useMemo, useState } from 'react';
import { gql } from 'graphql-request';
import { useGraphClient } from '@/hooks/useGraphClient';

interface ProbeConfig {
  key: string;
  label: string;
  plane: 'client' | 'operator';
  query: string;
  previewFields: string[];
}

const PROBES: ProbeConfig[] = [
  {
    key: 'leave',
    label: 'Leave',
    plane: 'client',
    query: gql`
      query LeaveHealth {
        leaveTypes(limit: 1) {
          id
          name
        }
      }
    `,
    previewFields: ['leaveTypes'],
  },
  {
    key: 'attendance',
    label: 'Attendance',
    plane: 'client',
    query: gql`
      query AttendanceHealth {
        shifts(limit: 1) {
          id
          name
        }
      }
    `,
    previewFields: ['shifts'],
  },
  {
    key: 'payroll',
    label: 'Payroll',
    plane: 'client',
    query: gql`
      query PayrollHealth {
        salaryComponents(limit: 1) {
          id
          name
        }
      }
    `,
    previewFields: ['salaryComponents'],
  },
  {
    key: 'tax',
    label: 'Tax',
    plane: 'client',
    query: gql`
      query TaxHealth {
        taxConfigurations(limit: 1) {
          id
          fiscalYear
          regime
        }
      }
    `,
    previewFields: ['taxConfigurations'],
  },
  {
    key: 'benefits',
    label: 'Benefits',
    plane: 'client',
    query: gql`
      query BenefitsHealth {
        benefitTypes(limit: 1) {
          id
          name
        }
      }
    `,
    previewFields: ['benefitTypes'],
  },
  {
    key: 'expense',
    label: 'Expense',
    plane: 'client',
    query: gql`
      query ExpenseHealth {
        expenseCategories(limit: 1) {
          id
          name
        }
      }
    `,
    previewFields: ['expenseCategories'],
  },
  {
    key: 'recruitment',
    label: 'Recruitment',
    plane: 'client',
    query: gql`
      query RecruitmentHealth {
        jobPostings(limit: 1) {
          id
          title
        }
      }
    `,
    previewFields: ['jobPostings'],
  },
  {
    key: 'performance',
    label: 'Performance',
    plane: 'client',
    query: gql`
      query PerformanceHealth {
        reviewCycles(limit: 1) {
          id
          name
        }
      }
    `,
    previewFields: ['reviewCycles'],
  },
  {
    key: 'lms',
    label: 'LMS',
    plane: 'client',
    query: gql`
      query LmsHealth {
        skills(limit: 1) {
          id
          name
        }
      }
    `,
    previewFields: ['skills'],
  },
  {
    key: 'succession',
    label: 'Succession',
    plane: 'client',
    query: gql`
      query SuccessionHealth {
        competencies(limit: 1) {
          id
          name
        }
      }
    `,
    previewFields: ['competencies'],
  },
  {
    key: 'compensation',
    label: 'Compensation',
    plane: 'client',
    query: gql`
      query CompensationHealth {
        salaryBands(limit: 1) {
          id
          grade
        }
      }
    `,
    previewFields: ['salaryBands'],
  },
  {
    key: 'assets',
    label: 'Assets',
    plane: 'client',
    query: gql`
      query AssetsHealth {
        assetCategories(limit: 1) {
          id
          name
        }
      }
    `,
    previewFields: ['assetCategories'],
  },
  {
    key: 'grievance',
    label: 'Grievance',
    plane: 'client',
    query: gql`
      query GrievanceHealth {
        grievanceCategories(limit: 1) {
          id
          name
        }
      }
    `,
    previewFields: ['grievanceCategories'],
  },
  {
    key: 'workflow',
    label: 'Workflow',
    plane: 'client',
    query: gql`
      query WorkflowHealth {
        workflows(limit: 1) {
          id
          name
        }
      }
    `,
    previewFields: ['workflows'],
  },
  {
    key: 'notification',
    label: 'Notifications',
    plane: 'client',
    query: gql`
      query NotificationHealth {
        announcements(limit: 1) {
          id
          title
        }
      }
    `,
    previewFields: ['announcements'],
  },
  {
    key: 'tenant',
    label: 'Tenants (ops)',
    plane: 'operator',
    query: gql`
      query TenantsHealth {
        tenants(limit: 1) {
          id
          name
        }
      }
    `,
    previewFields: ['tenants'],
  },
  {
    key: 'billing',
    label: 'Billing (ops)',
    plane: 'operator',
    query: gql`
      query BillingHealth {
        invoices(limit: 1) {
          id
          invoiceNumber
        }
      }
    `,
    previewFields: ['invoices'],
  },
  {
    key: 'operator',
    label: 'Operators (ops)',
    plane: 'operator',
    query: gql`
      query OperatorHealth {
        operatorUsers(limit: 1) {
          id
          email
        }
      }
    `,
    previewFields: ['operatorUsers'],
  },
];

type ProbeState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ok'; count: number; sample: string }
  | { status: 'error'; message: string };

const ModuleHealth = () => {
  const client = useGraphClient('client');
  const operatorClient = useGraphClient('operator');
  const [results, setResults] = useState<Record<string, ProbeState>>(() =>
    Object.fromEntries(PROBES.map((p) => [p.key, { status: 'idle' } as ProbeState]))
  );
  const [runToken, setRunToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const probe of PROBES) {
        if (cancelled) return;
        setResults((prev) => ({ ...prev, [probe.key]: { status: 'loading' } }));
        const c = probe.plane === 'operator' ? operatorClient : client;
        try {
          const data = await c.request<Record<string, unknown>>(probe.query);
          const [rootKey] = probe.previewFields;
          const rows = Array.isArray(data?.[rootKey]) ? (data[rootKey] as unknown[]) : [];
          setResults((prev) => ({
            ...prev,
            [probe.key]: {
              status: 'ok',
              count: rows.length,
              sample: JSON.stringify(rows[0] ?? null),
            },
          }));
        } catch (err) {
          setResults((prev) => ({
            ...prev,
            [probe.key]: {
              status: 'error',
              message: (err as Error).message.slice(0, 180),
            },
          }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, operatorClient, runToken]);

  const summary = useMemo(() => {
    const tally = { ok: 0, error: 0, pending: 0 };
    for (const r of Object.values(results)) {
      if (r.status === 'ok') tally.ok += 1;
      else if (r.status === 'error') tally.error += 1;
      else tally.pending += 1;
    }
    return tally;
  }, [results]);

  return (
    <div className="p-6 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Module Health</h1>
          <p className="text-sm text-gray-500">
            Live introspection of every KabiPay subgraph through the stitching gateway. Tenant-plane
            queries use the current tenant id; ops-plane queries use the operator plane headers.
          </p>
        </div>
        <button
          className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
          onClick={() => setRunToken((n) => n + 1)}
        >
          Re-run probes
        </button>
      </header>

      <div className="flex gap-3 text-sm">
        <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800">OK: {summary.ok}</span>
        <span className="px-2 py-1 rounded bg-rose-100 text-rose-800">Failed: {summary.error}</span>
        <span className="px-2 py-1 rounded bg-slate-100 text-slate-800">
          Pending: {summary.pending}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PROBES.map((probe) => {
          const state = results[probe.key];
          return (
            <div
              key={probe.key}
              className="rounded-lg border border-gray-200 p-4 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-medium">{probe.label}</h2>
                <StatusBadge state={state} />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                plane: <code>{probe.plane}</code>
              </p>
              {state.status === 'ok' && (
                <pre className="mt-2 max-h-32 overflow-auto text-xs bg-gray-50 rounded p-2">
                  {state.sample}
                </pre>
              )}
              {state.status === 'error' && (
                <pre className="mt-2 max-h-32 overflow-auto text-xs bg-rose-50 text-rose-800 rounded p-2">
                  {state.message}
                </pre>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StatusBadge = ({ state }: { state: ProbeState }) => {
  switch (state.status) {
    case 'ok':
      return (
        <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
          OK · {state.count}
        </span>
      );
    case 'error':
      return <span className="text-xs px-2 py-0.5 rounded bg-rose-100 text-rose-800">Error</span>;
    case 'loading':
      return (
        <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800">Loading</span>
      );
    default:
      return <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800">Idle</span>;
  }
};

export default ModuleHealth;
