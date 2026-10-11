import { useState } from 'react';

import { LoanSchedulePreviewDocument } from '../../api/loans/graphql';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

import LoanProjectionSummary from './LoanProjectionSummary';

const LoanScheduleCard = ({ loanId }: { loanId: string }) => {
  const client = useGraphClient();
  const [date, setDate] = useState('');
  const [projection, setProjection] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const preview = async () => {
    setBusy(true);
    setError(null);
    setProjection(null);
    try {
      const result = await client.request(LoanSchedulePreviewDocument, {
        loanId,
        firstDueDate: date,
      });
      setProjection(result.loanSchedulePreview);
    } catch (failure) {
      setError(graphQlUserMessage(failure));
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end gap-2">
        <Input
          label="Projection first repayment date"
          type="date"
          value={date}
          disabled={busy}
          onChange={(event) => {
            setDate(event.target.value);
            setProjection(null);
          }}
        />
        <Button variant="secondary" disabled={!date || busy} onClick={() => void preview()}>
          Preview repayment schedule
        </Button>
      </div>
      {error && <p role="alert">{error}</p>}
      {projection !== null && <LoanProjectionSummary key={date} projection={projection} />}
    </section>
  );
};
export default LoanScheduleCard;
