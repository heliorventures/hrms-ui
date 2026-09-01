import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';

interface ExitRequestCardProps {
  lastDay: string;
  reason: string;
  resignDay: string;
  sepType: string;
  submitBusy: boolean;
  onLastDayChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onResignDayChange: (value: string) => void;
  onSepTypeChange: (value: string) => void;
  onSubmit: () => void;
}

const ExitRequestCard = ({
  lastDay,
  reason,
  resignDay,
  sepType,
  submitBusy,
  onLastDayChange,
  onReasonChange,
  onResignDayChange,
  onSepTypeChange,
  onSubmit,
}: ExitRequestCardProps) => (
  <Card title="New Exit Request">
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
          Type
        </label>
        <select
          value={sepType}
          onChange={(event) => onSepTypeChange(event.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800/80"
        >
          <option value="RESIGNATION">Resignation</option>
          <option value="RETIREMENT">Retirement</option>
          <option value="END_OF_CONTRACT">End of contract</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
          Last working day <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={lastDay}
          onChange={(event) => onLastDayChange(event.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800/80"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
          Resignation submitted on (optional)
        </label>
        <input
          type="date"
          value={resignDay}
          onChange={(event) => onResignDayChange(event.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800/80"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
          Notes
        </label>
        <textarea
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
          rows={3}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800/80"
          placeholder="Optional context for HR"
        />
      </div>
      <Button variant="primary" disabled={submitBusy} onClick={onSubmit}>
        {submitBusy ? 'Submitting...' : 'Submit Request'}
      </Button>
    </div>
  </Card>
);

export default ExitRequestCard;
