import { authorizationStateKey, createPermissionService } from '../../auth/permissionService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../contexts/AuthContext';

import CompanyLocationDialogs from './CompanyLocationDialogs';
import CompanyLocationsTable from './CompanyLocationsTable';
import { useCompanyLocationsWorkspace } from './useCompanyLocationsWorkspace';
const LocationsWorkspace = () => {
  const {
    search,
    setSearch,
    page,
    setPage,
    activeOnly,
    setActiveOnly,
    resource,
    mutation,
    open,
    setOpen,
    editing,
    draft,
    setDraft,
    retiring,
    setRetiring,
    edit,
    save,
    retire,
  } = useCompanyLocationsWorkspace();
  return (
    <div className="space-y-5">
      <PageHeader
        title="Company Locations"
        description="Maintain offices and branches, then assign employees and configure their working calendars."
      />
      <Card title="Locations">
        <div
          className="mb-4 flex flex-wrap items-end gap-3"
          data-tour-anchor="company-locations.filters"
        >
          <Input
            label="Search locations"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
          <label className="text-sm">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(event) => {
                setActiveOnly(event.target.checked);
                setPage(1);
              }}
            />{' '}
            Active only
          </label>
          <Button data-tour-anchor="company-locations.add" onClick={() => edit(null)}>
            Add Location
          </Button>
        </div>
        {resource.error ? (
          <p role="alert">
            {resource.error} <Button onClick={resource.reload}>Reload</Button>
          </p>
        ) : null}
        <CompanyLocationsTable
          rows={resource.data?.companyLocations}
          loading={resource.loading}
          busy={mutation.busy}
          page={page}
          setPage={setPage}
          edit={edit}
          retire={(row) => {
            mutation.setError(null);
            setRetiring(row);
          }}
        />
      </Card>
      <CompanyLocationDialogs
        open={open}
        setOpen={setOpen}
        editing={editing}
        draft={draft}
        setDraft={setDraft}
        retiring={retiring}
        setRetiring={setRetiring}
        mutation={mutation}
        save={save}
        retire={retire}
        reload={resource.reload}
      />
    </div>
  );
};
const AdminCompanyLocationsPage = () => {
  const auth = useAuth();
  if (!createPermissionService(auth.clientSession).canRoute('/admin/company-locations'))
    return <p>You do not have permission to manage company locations.</p>;
  return (
    <LocationsWorkspace
      key={`${auth.tenantId}:${auth.user?.id}:${authorizationStateKey(auth.clientSession)}`}
    />
  );
};
export default AdminCompanyLocationsPage;
