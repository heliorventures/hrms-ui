import PageNotice from '../../../components/common/PageNotice';
import type { ExpenseNotice as ExpenseNoticeModel } from '../types';

interface ExpenseNoticeProps {
  notice: ExpenseNoticeModel | null;
  onDismiss: () => void;
}

const ExpenseNotice = ({ notice, onDismiss }: ExpenseNoticeProps) => {
  if (!notice) return null;
  return (
    <PageNotice variant={notice.variant}>
      <div className="flex items-start gap-3">
        <p className="min-w-0 flex-1 leading-relaxed">{notice.message}</p>
        <button
          type="button"
          className="shrink-0 rounded-md px-2 py-0.5 text-sm font-medium opacity-70 hover:bg-black/10 hover:opacity-100 dark:hover:bg-white/10"
          onClick={onDismiss}
          aria-label="Dismiss Notification"
        >
          Close
        </button>
      </div>
    </PageNotice>
  );
};

export default ExpenseNotice;
