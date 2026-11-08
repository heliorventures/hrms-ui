import { useState } from 'react';

import { LoanSchedulePreviewDocument } from '../../api/loans/graphql';
import Button from '../../components/common/Button';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

import LoanProjectionSummary from './LoanProjectionSummary';

const LoanScheduleCard = ({ loanId }: { loanId: string }) => {
  const client = useGraphClient();
  const [projection, setProjection] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const preview = async () => {
    setBusy(true);
    setError(null);
    setProjection(null);
    try {
      const result = await client.request(LoanSchedulePreviewDocument, { loanId });
      setProjection(result.loanSchedulePreview);
    } catch (failure) {
      setError(graphQlUserMessage(failure));
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="space-y-3">
      <p className="text-sm text-content-secondary">
        Uses current contractual repayment dates and approved arrangements.
      </p>
      <Button variant="secondary" disabled={busy} onClick={() => void preview()}>
        Preview repayment schedule
      </Button>
      {error && <p role="alert">{error}</p>}
      {projection !== null && <LoanProjectionSummary projection={projection} />}
    </section>
  );
};
export default LoanScheduleCard;
