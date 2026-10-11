import { useState } from 'react';

import { FinanceFollowUpOwnersDocument } from '../../api/loans/graphql';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';

import type { FinanceOwner } from './exitFinanceModel';
import FinanceMessage from './FinanceMessage';
import FnfFinancialSummary from './FnfFinancialSummary';
import FnfSourceEditor from './FnfSourceEditor';
import { useFnfFinanceReview } from './useFnfFinanceReview';
import { useLoanOptions } from './useLoanOptions';

interface Props {
  separationId: string;
  onClose: () => void;
  onSaved: () => Promise<void>;
}
const FnfFinanceReview = ({ separationId, onClose, onSaved }: Props) => {
  const state = useFnfFinanceReview(separationId, onSaved);
  const owners = useLoanOptions<FinanceOwner>(
    FinanceFollowUpOwnersDocument,
    'financeFollowUpOwners'
  );
  const [date, setDate] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const issued = state.prepared?.settlement?.status === 'PROCESSED';
  return (
    <Modal
      isOpen
      title="Full and final financial review"
      size="xl"
      onClose={onClose}
      isDismissible={!state.busy}
    >
      <div className="space-y-4">
        <p className="text-sm text-content-secondary">
          Review approved benefit valuations, prior payments and source-specific set-off
          permissions. Issued salary remains in Payroll and must not be added again as FNF earnings.
        </p>
        <FinanceMessage messages={[state.error, state.query.error, owners.error]} />
        <FnfFinancialSummary financials={state.prepared?.settlement?.financials} />
        {issued ? (
          <p className="text-sm font-medium">
            Issued settlement — financial evidence is read-only.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-end gap-2">
              <Input
                label="Settlement value date"
                type="date"
                value={date}
                disabled={state.busy}
                onChange={(event) => {
                  setDate(event.target.value);
                  state.edit();
                  setAcknowledged(false);
                }}
              />
              <Button
                disabled={!date || state.busy || state.query.phase === 'initial-loading'}
                onClick={() => void state.prepare(date)}
              >
                Load and review sources
              </Button>
            </div>
            <FnfSourceEditor
              state={state}
              owners={owners}
              date={date}
              onEdit={() => setAcknowledged(false)}
            />
            {state.prepared?.fingerprint && (
              <div className="space-y-3 rounded-lg border border-line-subtle p-3">
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={acknowledged}
                    disabled={state.busy}
                    onChange={(event) => setAcknowledged(event.target.checked)}
                  />
                  I reviewed the saved payout, loan recovery and continuing balance. Finalization
                  makes this record immutable.
                </label>
                <Button
                  disabled={state.busy || !acknowledged || state.dirty}
                  onClick={() => void state.finalize()}
                >
                  Finalize reviewed FNF
                </Button>
              </div>
            )}
          </>
        )}
        <div className="flex justify-end">
          <Button variant="secondary" disabled={state.busy} onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
export default FnfFinanceReview;
