import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import FeedbackToast from '../../components/common/FeedbackToast';
import Input from '../../components/common/Input';
import PageHeader from '../../components/common/PageHeader';
import PageTabs from '../../components/common/PageTabs';
import Select from '../../components/common/Select';

import LoanAccountDetail from './LoanAccountDetail';
import LoanAccountTable from './LoanAccountTable';
import LoanEditor from './LoanEditor';
import { choices } from './loanForm';
import LoanPager from './LoanPager';
import LoanRequestTable from './LoanRequestTable';
import { useLoanAccess } from './useLoanAccess';
import { useLoanAdministration } from './useLoanAdministration';

const tabs = [
  { id: 'requests', label: 'Requests' },
  { id: 'accounts', label: 'Accounts' },
  { id: 'disbursements', label: 'Disbursements' },
  { id: 'repayments', label: 'Repayments' },
  { id: 'deductions', label: 'Deductions' },
];
const LoanAdminWorkspace = () => {
  const {
    tab,
    setTab,
    searchText,
    setSearchText,
    setSearch,
    state,
    setState,
    error,
    current,
    requests,
    accounts,
    editor,
    setEditor,
    selected,
    setSelected,
    refresh,
    openAccount,
    requestActions,
  } = useLoanAdministration();
  return (
    <div className="space-y-4">
      <PageHeader
        title="Loan administration"
        description="Manage requests and record company loan payments. HR selects deductions under the approved policy."
      />
      <PageTabs
        tabs={tabs}
        value={tab}
        onValueChange={(next) => {
          setTab(next);
          setState('');
        }}
      />
      <Card>
        <form
          className="mb-4 flex flex-wrap items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            setSearch(searchText.trim());
          }}
        >
          <Input
            label="Employee, loan or purpose"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            maxLength={200}
          />
          <Select
            label="Status"
            value={state}
            onChange={(event) => setState(event.target.value)}
            options={[
              { value: '', label: 'All statuses' },
              ...choices(
                tab === 'requests'
                  ? ['SUBMITTED', 'APPROVED', 'RETURNED', 'REJECTED', 'WITHDRAWN']
                  : ['OPEN', 'CLOSED']
              ).slice(1),
            ]}
          />
          <Button type="submit" variant="secondary">
            Search
          </Button>
          <Button variant="quiet" onClick={() => void current.refresh()}>
            Refresh
          </Button>
        </form>
        {error && <FeedbackToast>{error}</FeedbackToast>}
        {tab === 'requests' ? (
          <LoanRequestTable
            rows={requests.data?.nodes ?? []}
            loading={requests.phase === 'initial-loading'}
            error={requests.error}
            actions={requestActions}
          />
        ) : (
          <LoanAccountTable
            rows={accounts.data?.nodes ?? []}
            loading={accounts.phase === 'initial-loading'}
            error={accounts.error}
            onOpen={openAccount}
          />
        )}
        <LoanPager
          page={current.page}
          hasNext={current.data?.pageInfo.hasNextPage ?? false}
          disabled={current.phase === 'initial-loading'}
          onNext={current.next}
          onPrevious={current.previous}
        />
      </Card>
      {editor && (
        <LoanEditor definition={editor} onClose={() => setEditor(null)} onSaved={refresh} />
      )}
      {selected && (
        <LoanAccountDetail
          accountId={selected}
          onClose={() => setSelected(null)}
          onSaved={refresh}
        />
      )}
    </div>
  );
};
const LoanAdminPage = () => {
  const { ownerKey } = useLoanAccess();
  return <LoanAdminWorkspace key={ownerKey} />;
};
export default LoanAdminPage;
