import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import { PERMISSIONS } from '../../auth/permissions';

const ASSETS_BOARD_QUERY = /* GraphQL */ `
  query AssetsBoard($withInventory: Boolean!, $limit: Int! = 100) {
    assetCategories(limit: 100) @include(if: $withInventory) {
      id
      name
      code
    }
    assets(limit: $limit) @include(if: $withInventory) {
      id
      name
      assetCategoryId
      serialNumber
      assetTag
      status
      purchaseDate
      purchaseValue
    }
    assetAssignments(limit: $limit, activeOnly: false) {
      id
      assetId
      employeeId
      assetName
      assetTag
      serialNumber
      purchaseValue
      allocatedOn
      expectedReturnOn
      conditionAtAllocation
      status
    }
  }
`;

const ASSIGN_ASSET_MUTATION = /* GraphQL */ `
  mutation AssignAssetToEmployee($input: AssignAssetInput!) {
    assignAssetToEmployee(input: $input) {
      id
      assetId
      employeeId
      assetName
      status
    }
  }
`;

const RETURN_ASSET_MUTATION = /* GraphQL */ `
  mutation ReturnEmployeeAsset($input: ReturnAssetInput!) {
    returnEmployeeAsset(input: $input) {
      id
      assetId
      employeeId
      assetName
      status
    }
  }
`;

const EMPLOYEE_OPTIONS_QUERY = /* GraphQL */ `
  query AssetsEmployeeOptions($limit: Int! = 200) {
    employees(limit: $limit) {
      id
      employeeCode
      fullName
      status
    }
  }
`;

interface AssetRow {
  id: string;
  name: string;
  assetCategoryId: string;
  serialNumber?: string | null;
  assetTag?: string | null;
  status: string;
  purchaseDate?: string | null;
  purchaseValue?: string | null;
}

interface AssetAssignmentRow {
  id: string;
  assetId: string;
  employeeId: string;
  assetName: string;
  assetTag?: string | null;
  serialNumber?: string | null;
  purchaseValue?: string | null;
  allocatedOn: string;
  expectedReturnOn?: string | null;
  conditionAtAllocation?: string | null;
  status: string;
}

interface EmployeeOption {
  id: string;
  employeeCode: string;
  fullName: string;
  status: string;
}

interface AssetsBoardResult {
  assetCategories?: { id: string; name: string; code?: string | null }[];
  assets?: AssetRow[];
  assetAssignments: AssetAssignmentRow[];
}

const today = () => new Date().toISOString().slice(0, 10);

const AssetsPage = () => {
  const client = useGraphClient('client');
  const { can } = useAuth();
  const canManageAssets = can(PERMISSIONS.assetsManage);
  const canReadInventory = canManageAssets || can(PERMISSIONS.assetsRead);
  const [data, setData] = useState<AssetsBoardResult | null>(null);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionOk, setActionOk] = useState<string | null>(null);
  const [assignForm, setAssignForm] = useState({
    assetId: '',
    employeeId: '',
    allocatedOn: today(),
    expectedReturnOn: '',
    conditionAtAllocation: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const boardRequest = client.request<AssetsBoardResult>(ASSETS_BOARD_QUERY, {
        withInventory: canReadInventory,
        limit: 200,
      });
      const employeeRequest = canManageAssets
        ? client.request<{ employees: EmployeeOption[] }>(EMPLOYEE_OPTIONS_QUERY, { limit: 300 })
        : Promise.resolve<{ employees: EmployeeOption[] }>({ employees: [] });
      const [result, employeeResult] = await Promise.all([boardRequest, employeeRequest]);
      setData(result);
      setEmployees(employeeResult.employees ?? []);
    } catch (e) {
      setError(graphQlUserMessage(e));
    } finally {
      setLoading(false);
    }
  }, [canManageAssets, canReadInventory, client]);

  useEffect(() => {
    void load();
  }, [load]);

  const availableAssets = useMemo(
    () =>
      (data?.assets ?? []).filter((asset) => asset.status.toUpperCase() !== 'ASSIGNED'),
    [data?.assets]
  );

  const activeAssignments = useMemo(
    () => (data?.assetAssignments ?? []).filter((row) => row.status === 'ACTIVE'),
    [data?.assetAssignments]
  );

  const submitAssign = async (event: FormEvent) => {
    event.preventDefault();
    if (!assignForm.assetId || !assignForm.employeeId) {
      setActionError('Select an asset and employee.');
      return;
    }
    setBusy(true);
    setActionError(null);
    setActionOk(null);
    try {
      await client.request(ASSIGN_ASSET_MUTATION, {
        input: {
          assetId: assignForm.assetId,
          employeeId: assignForm.employeeId,
          allocatedOn: assignForm.allocatedOn,
          expectedReturnOn: assignForm.expectedReturnOn || null,
          conditionAtAllocation: assignForm.conditionAtAllocation.trim() || null,
        },
      });
      setActionOk('Asset assigned.');
      setAssignForm({
        assetId: '',
        employeeId: '',
        allocatedOn: today(),
        expectedReturnOn: '',
        conditionAtAllocation: '',
      });
      await load();
    } catch (e) {
      setActionError(graphQlUserMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const returnAsset = async (assignmentId: string) => {
    setBusy(true);
    setActionError(null);
    setActionOk(null);
    try {
      await client.request(RETURN_ASSET_MUTATION, {
        input: {
          assetAllocationId: assignmentId,
          returnedOn: today(),
          conditionAtReturn: null,
          remarks: null,
        },
      });
      setActionOk('Asset returned.');
      await load();
    } catch (e) {
      setActionError(graphQlUserMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assets</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {canReadInventory
            ? 'Manage employee asset assignments and view inventory cost.'
            : 'View assets currently assigned to you.'}
        </p>
      </div>

      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}
      {actionError && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{actionError}</p>
        </Card>
      )}
      {actionOk && (
        <Card>
          <p className="text-sm text-emerald-700 dark:text-emerald-300">{actionOk}</p>
        </Card>
      )}

      {canManageAssets && (
        <Card title="Assign Asset">
          <form className="grid gap-4 md:grid-cols-5" onSubmit={submitAssign}>
            <select
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm md:col-span-2"
              value={assignForm.assetId}
              onChange={(event) => setAssignForm((form) => ({ ...form, assetId: event.target.value }))}
              disabled={loading || busy}
            >
              <option value="">Select available asset</option>
              {availableAssets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} {asset.assetTag ? `(${asset.assetTag})` : ''}
                </option>
              ))}
            </select>
            <select
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm md:col-span-2"
              value={assignForm.employeeId}
              onChange={(event) => setAssignForm((form) => ({ ...form, employeeId: event.target.value }))}
              disabled={loading || busy}
            >
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.employeeCode} - {employee.fullName}
                </option>
              ))}
            </select>
            <Button type="submit" disabled={busy || loading}>
              {busy ? 'Saving...' : 'Assign'}
            </Button>
            <input
              type="date"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={assignForm.allocatedOn}
              onChange={(event) => setAssignForm((form) => ({ ...form, allocatedOn: event.target.value }))}
              disabled={busy}
            />
            <input
              type="date"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={assignForm.expectedReturnOn}
              onChange={(event) => setAssignForm((form) => ({ ...form, expectedReturnOn: event.target.value }))}
              disabled={busy}
            />
            <input
              type="text"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm md:col-span-3"
              placeholder="Condition at allocation"
              value={assignForm.conditionAtAllocation}
              onChange={(event) =>
                setAssignForm((form) => ({ ...form, conditionAtAllocation: event.target.value }))
              }
              disabled={busy}
            />
          </form>
        </Card>
      )}

      <Card title={canReadInventory ? 'Active Assignments' : 'My Assigned Assets'}>
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : activeAssignments.length ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {activeAssignments.map((assignment) => (
              <li key={assignment.id} className="flex flex-col gap-2 py-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{assignment.assetName}</p>
                  <p className="text-xs text-gray-500">
                    {assignment.assetTag ? `Tag ${assignment.assetTag} · ` : ''}
                    {assignment.serialNumber ? `S/N ${assignment.serialNumber} · ` : ''}
                    Assigned {assignment.allocatedOn}
                    {canReadInventory && assignment.purchaseValue ? ` · Cost ${assignment.purchaseValue}` : ''}
                  </p>
                  {canReadInventory && (
                    <p className="mt-1 text-xs text-gray-500">Employee ID: {assignment.employeeId}</p>
                  )}
                </div>
                {canManageAssets && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => void returnAsset(assignment.id)}
                  >
                    Mark returned
                  </Button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No active asset assignments.</p>
        )}
      </Card>

      {canReadInventory && (
        <Card title="Inventory">
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : data?.assets?.length ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.assets.map((asset) => (
                <li key={asset.id} className="py-3">
                  <p className="font-medium text-gray-900 dark:text-white">{asset.name}</p>
                  <p className="text-xs text-gray-500">
                    {asset.status}
                    {asset.assetTag ? ` · tag ${asset.assetTag}` : ''}
                    {asset.serialNumber ? ` · S/N ${asset.serialNumber}` : ''}
                    {asset.purchaseValue ? ` · cost ${asset.purchaseValue}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No assets configured.</p>
          )}
        </Card>
      )}
    </div>
  );
};

export default AssetsPage;
