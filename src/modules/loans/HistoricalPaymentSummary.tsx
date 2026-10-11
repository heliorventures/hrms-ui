import type { historicalPaymentPreview } from './historicalPaymentPreview';

const HistoricalPaymentSummary = ({
  preview,
}: {
  preview: ReturnType<typeof historicalPaymentPreview>;
}) => (
  <section
    className="space-y-2 rounded-lg bg-canvas p-3"
    aria-label="Earlier payment financial review"
  >
    <p>
      Payment occurred on {preview.occurrenceDate}. This records a ledger correction on{' '}
      {preview.postingDate}.
    </p>
    <dl className="grid grid-cols-2 gap-3 text-sm">
      <div>
        <dt>Current principal</dt>
        <dd>
          {preview.currency} {preview.currentPrincipal}
        </dd>
      </div>
      <div>
        <dt>Corrected principal</dt>
        <dd>
          {preview.currency} {preview.correctedPrincipal}
        </dd>
      </div>
      <div>
        <dt>Current interest</dt>
        <dd>
          {preview.currency} {preview.currentInterest}
        </dd>
      </div>
      <div>
        <dt>Corrected interest</dt>
        <dd>
          {preview.currency} {preview.correctedInterest}
        </dd>
      </div>
    </dl>
    <p className="text-sm text-content-secondary">
      {preview.preservedCount} issued Payroll/FNF allocations remain unchanged. Review the corrected
      loan balance before confirming.
    </p>
  </section>
);
export default HistoricalPaymentSummary;
