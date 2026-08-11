import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import type {
  ClearanceItemRow,
  FnfFormState,
  FnfSettlementRow,
  SeparationRow,
} from '../onboardingTypes';

interface SeparationRequestsCardProps {
  actionId: string | null;
  canManageOnboarding: boolean;
  clBusy: string | null;
  ensureBusy: boolean;
  fnfBusy: boolean;
  fnfForm: FnfFormState;
  loading: boolean;
  obCl: ClearanceItemRow[];
  obErr: string | null;
  obFnf: FnfSettlementRow | null;
  obLoading: boolean;
  openObId: string | null;
  separations: SeparationRow[];
  onEnsureRows: (separationId: string) => void;
  onFinalizeFnf: (separationId: string) => void;
  onHrAction: (id: string, approve: boolean) => void;
  onOpenObIdChange: (id: string | null) => void;
  onSaveFnf: (separationId: string) => void;
  onToggleClearance: (separationId: string, clearanceId: string, next: boolean) => void;
  onUpdateFnfForm: (patch: Partial<FnfFormState>) => void;
}

const statusClassName = (status: string) => {
  if (status === 'APPROVED') return 'text-emerald-600 dark:text-emerald-400';
  if (status === 'REJECTED') return 'text-red-600 dark:text-red-400';
  return 'text-amber-600 dark:text-amber-400';
};

const SeparationRequestsCard = ({
  actionId,
  canManageOnboarding,
  clBusy,
  ensureBusy,
  fnfBusy,
  fnfForm,
  loading,
  obCl,
  obErr,
  obFnf,
  obLoading,
  openObId,
  separations,
  onEnsureRows,
  onFinalizeFnf,
  onHrAction,
  onOpenObIdChange,
  onSaveFnf,
  onToggleClearance,
  onUpdateFnfForm,
}: SeparationRequestsCardProps) => (
  <Card title="Your Requests">
    {loading ? (
      <p className="text-sm text-gray-500">Loading...</p>
    ) : separations.length ? (
      <ul className="space-y-3">
        {separations.map((separation) => (
          <li
            key={separation.id}
            className="rounded-lg border border-slate-200/90 bg-slate-50/30 p-3 dark:border-slate-600 dark:bg-slate-800/30"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {separation.separationType} -{' '}
                  <span className={statusClassName(separation.status)}>{separation.status}</span>
                </p>
                <p className="text-xs text-gray-500">
                  LWD {String(separation.lastWorkingDate)}
                  {separation.resignationDate != null
                    ? ` - submitted ${String(separation.resignationDate)}`
                    : ''}
                </p>
                {separation.reason ? (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {separation.reason}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                {separation.status === 'APPROVED' && (
                  <Button
                    variant="secondary"
                    onClick={() =>
                      onOpenObIdChange(openObId === separation.id ? null : separation.id)
                    }
                  >
                    {openObId === separation.id ? 'Hide' : 'Clearance & FNF'}
                  </Button>
                )}
                {canManageOnboarding && separation.status === 'PENDING' && (
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="primary"
                      disabled={actionId === separation.id}
                      onClick={() => onHrAction(separation.id, true)}
                    >
                      {actionId === separation.id ? '...' : 'Approve'}
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={actionId === separation.id}
                      onClick={() => onHrAction(separation.id, false)}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
            {separation.status === 'APPROVED' && openObId === separation.id ? (
              <div className="mt-3 border-t border-slate-200/90 pt-3 dark:border-slate-600">
                {obLoading ? (
                  <p className="text-sm text-gray-500">Loading Clearance & FNF...</p>
                ) : obErr ? (
                  <p className="text-sm text-red-600 dark:text-red-400">{obErr}</p>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Department clearance
                      </p>
                      {obCl.length === 0 && canManageOnboarding && !obLoading ? (
                        <p className="mb-2 text-sm text-amber-700 dark:text-amber-300">
                          If this was approved before FNF was enabled, create rows once.
                        </p>
                      ) : null}
                      {obCl.length === 0 && canManageOnboarding ? (
                        <Button
                          variant="secondary"
                          disabled={ensureBusy}
                          onClick={() => onEnsureRows(separation.id)}
                        >
                          {ensureBusy ? '...' : 'Create Clearance & FNF Records'}
                        </Button>
                      ) : null}
                      {obCl.length ? (
                        <ul className="space-y-2">
                          {obCl.map((clearance) => (
                            <li
                              key={clearance.id}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200/80 bg-white/50 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900/40"
                            >
                              <span>
                                <span className="font-medium text-slate-800 dark:text-slate-100">
                                  {clearance.department}
                                </span>
                                <span className="text-slate-600 dark:text-slate-300">
                                  {' '}
                                  - {clearance.taskName}
                                </span>
                              </span>
                              {canManageOnboarding ? (
                                <label className="flex items-center gap-2 text-xs">
                                  <input
                                    type="checkbox"
                                    checked={clearance.isCleared}
                                    disabled={clBusy === clearance.id}
                                    onChange={(event) =>
                                      onToggleClearance(
                                        separation.id,
                                        clearance.id,
                                        event.target.checked
                                      )
                                    }
                                  />
                                  Cleared
                                </label>
                              ) : (
                                <span
                                  className={
                                    clearance.isCleared
                                      ? 'text-xs text-emerald-600'
                                      : 'text-xs text-amber-600'
                                  }
                                >
                                  {clearance.isCleared ? 'Cleared' : 'Pending'}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-slate-500">No Clearance Rows.</p>
                      )}
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Full & final (FNF)
                      </p>
                      {!obFnf && !obLoading ? (
                        <p className="text-sm text-slate-500">
                          {canManageOnboarding
                            ? 'No FNF Row Yet. Create Clearance And FNF Records First.'
                            : 'HR will publish your full and final details here after processing.'}
                        </p>
                      ) : null}
                      {obFnf ? (
                        <div className="space-y-2">
                          <p className="text-xs text-slate-500">
                            Status: <strong>{obFnf.status}</strong>
                            {obFnf.netPayable != null ? ` - Net ${obFnf.netPayable}` : ''}
                            {obFnf.processedAt ? ` - processed ${obFnf.processedAt}` : ''}
                          </p>
                          {canManageOnboarding && obFnf.status === 'DRAFT' ? (
                            <div className="grid gap-2 sm:grid-cols-2">
                              {[
                                ['le', 'Leave encashment'],
                                ['g', 'Gratuity'],
                                ['b', 'Bonus payable'],
                                ['r', 'Recovery (deduct)'],
                              ].map(([key, label]) => (
                                <label key={key} className="block text-xs">
                                  <span className="text-slate-500">{label}</span>
                                  <input
                                    type="text"
                                    value={fnfForm[key as keyof FnfFormState]}
                                    onChange={(event) =>
                                      onUpdateFnfForm({ [key]: event.target.value })
                                    }
                                    className="mt-0.5 w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800"
                                    placeholder="0.00"
                                  />
                                </label>
                              ))}
                            </div>
                          ) : null}
                          {canManageOnboarding && obFnf.status === 'DRAFT' ? (
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="primary"
                                disabled={fnfBusy}
                                onClick={() => onSaveFnf(separation.id)}
                              >
                                {fnfBusy ? '...' : 'Save Amounts'}
                              </Button>
                              <Button
                                variant="secondary"
                                disabled={fnfBusy}
                                onClick={() => onFinalizeFnf(separation.id)}
                              >
                                Finalize FNF
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-sm text-gray-500">No Separation Requests Yet.</p>
    )}
  </Card>
);

export default SeparationRequestsCard;
