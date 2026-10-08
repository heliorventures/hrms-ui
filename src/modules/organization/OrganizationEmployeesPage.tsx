import { useMemo, useState } from 'react';

import { authorizationStateKey } from '../../auth/permissionService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import PageHeader from '../../components/common/PageHeader';
import PageNotice from '../../components/common/PageNotice';
import { useAuth } from '../../contexts/AuthContext';
import { useGraphClient } from '../../hooks/useGraphClient';

import EmployeeDirectoryBrowser from './employee-directory/EmployeeDirectoryBrowser';
import { matchesDirectorySearch } from './employee-directory/employeeDirectoryModel';
import { useEmployeeDirectory } from './employee-directory/useEmployeeDirectory';

const EmployeeDirectoryView = ({ ownerKey }: { ownerKey: string }) => {
  const client = useGraphClient('client');
  const query = useEmployeeDirectory(client, ownerKey);
  const [search, setSearch] = useState('');
  const rows = useMemo(
    () => query.data?.rows.filter((employee) => matchesDirectorySearch(employee, search)) ?? [],
    [query.data, search]
  );
  const loading = query.phase === 'initial-loading';
  return (
    <div className="space-y-3">
      <PageHeader
        title="Employee Directory"
        description="Search work identities, choose a card to see work details, or open the employee profile. Use arrow keys to move between cards and Enter or Space to select."
        actions={
          <>
            <Input
              aria-label="Search employees"
              data-tour-anchor="organization-employees-search"
              type="search"
              placeholder="Name, employee code, role or department…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full sm:w-72"
            />
            <span className="text-xs tabular-nums text-content-muted">{rows.length} employees</span>
            <Button
              size="sm"
              variant="quiet"
              busy={query.phase === 'refreshing'}
              onClick={() => void query.refresh()}
            >
              Refresh
            </Button>
          </>
        }
      />
      {query.error && (
        <PageNotice
          variant="error"
          title={query.data ? 'Directory refresh failed' : 'Employee directory could not be loaded'}
        >
          {query.error}
        </PageNotice>
      )}
      {query.data?.warning && (
        <PageNotice variant="warning" title="Directory is incomplete">
          {query.data.warning}
        </PageNotice>
      )}
      {loading && (
        <p role="status" className="py-4 text-sm text-content-muted">
          Loading employees…
        </p>
      )}
      {!loading && rows.length > 0 && <EmployeeDirectoryBrowser key={ownerKey} rows={rows} />}
      {!loading && !query.error && rows.length === 0 && (
        <p role="status" className="py-4 text-sm text-content-muted">
          {search.trim()
            ? 'No employees match your search. Try a different term.'
            : 'No employees found.'}
        </p>
      )}
    </div>
  );
};

const OrganizationEmployeesPage = () => {
  const { clientSession } = useAuth();
  const ownerKey = authorizationStateKey(clientSession);
  return <EmployeeDirectoryView key={ownerKey} ownerKey={ownerKey} />;
};
export default OrganizationEmployeesPage;
