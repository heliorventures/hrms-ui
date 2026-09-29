import { Settings } from 'lucide-react';

import Button from '../../../components/common/Button';
import PageActionLink from '../../../components/common/PageActionLink';
import PageActions from '../../../components/common/PageActions';


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
    <PageActions>
      <h1 className="sr-only">Expenses & Travel</h1>
      <div className="flex flex-wrap items-center gap-3" data-tour-anchor="expenses.action-bar">
        {canManageExpense ? (
          <PageActionLink
            to="/admin/expense-categories"
            label="Configure categories"
            icon={<Settings className="h-5 w-5" />}
            tourAnchor="expenses.category-settings"
          />
        ) : null}
        {canSubmitExpense ? (
          <Button onClick={onOpenExpense} data-tour-anchor="expenses.submit-expense">
            Submit Expense
          </Button>
        ) : null}
        {canSubmitTravel ? (
          <Button
            variant="secondary"
            onClick={onOpenTravel}
            data-tour-anchor="expenses.request-travel"
          >
            Request travel
          </Button>
        ) : null}
      </div>
    </PageActions>
  );
};

export default ExpensesHeader;
