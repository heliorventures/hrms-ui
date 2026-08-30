import { Link } from 'react-router-dom';
import Button from '../../../components/common/Button';

interface ExpensesHeaderProps {
  canManageExpense: boolean;
  canSubmitExpense: boolean;
  canSubmitTravel: boolean;
  onOpenExpense: () => void;
  onOpenTravel: () => void;
}

const ExpensesHeader = ({
  canManageExpense,
  canSubmitExpense,
  canSubmitTravel,
  onOpenExpense,
  onOpenTravel,
}: ExpensesHeaderProps) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses & Travel</h1>
      <div className="flex flex-wrap items-center gap-3">
        {canManageExpense ? (
          <Link to="/admin/expense-categories">
            <Button
              type="button"
              variant="outline"
            >
              Configure categories
            </Button>
          </Link>
        ) : null}
        {canSubmitExpense ? <Button onClick={onOpenExpense}>Submit Expense</Button> : null}
        {canSubmitTravel ? (
          <Button variant="secondary" onClick={onOpenTravel}>
            Request travel
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default ExpensesHeader;
