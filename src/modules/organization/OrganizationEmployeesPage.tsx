import { useState, useMemo } from 'react';
import { useMockApi } from '../../hooks/useMockApi';
import { useTenant } from '../../contexts/TenantContext';
import { mockEmployees } from '../../mocks/employees';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Input from '../../components/common/Input';
import type { Employee } from '../../types';

const matchSearch = (employee: Employee, query: string): boolean => {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  const fields = [
    employee.name,
    employee.department,
    employee.location ?? '',
    employee.costCenter ?? '',
    employee.legalEntity ?? '',
    employee.businessUnit ?? '',
  ].filter(Boolean);
  return fields.some((f) => f.toLowerCase().includes(q));
};

const OrganizationEmployeesPage = () => {
  const { currentTenant } = useTenant();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: employees, loading } = useMockApi(
    () =>
      mockEmployees
        .filter((e) => e.tenantId === currentTenant.id)
        .sort((a, b) => a.name.localeCompare(b.name)),
    { delay: 300 }
  );

  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    return employees.filter((e) => matchSearch(e, searchQuery));
  }, [employees, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Employees
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            All employees in your organization
          </p>
        </div>
        <div className="w-full sm:w-80">
          <Input
            type="search"
            placeholder="Search by name, department, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            className="rounded-lg border-gray-300 dark:border-gray-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredEmployees.map((employee: Employee) => (
          <Card key={employee.id} className="flex flex-col">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100 text-lg font-semibold text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                {employee.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {employee.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {employee.designation}
                </p>
              </div>
            </div>
            <dl className="mt-4 space-y-2 border-t border-gray-200 pt-4 dark:border-gray-700">
              <div>
                <dt className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Email
                </dt>
                <dd className="mt-0.5 text-sm text-gray-900 dark:text-white">
                  {employee.email}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Department
                </dt>
                <dd className="mt-0.5 text-sm text-gray-900 dark:text-white">
                  {employee.department}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Mobile (Personal)
                </dt>
                <dd className="mt-0.5 text-sm text-gray-900 dark:text-white">
                  {employee.phone || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Mobile (Work)
                </dt>
                <dd className="mt-0.5 text-sm text-gray-900 dark:text-white">
                  {employee.workPhone || '—'}
                </dd>
              </div>
              {(employee.location || employee.costCenter || employee.legalEntity || employee.businessUnit) && (
                <>
                  {employee.location && (
                    <div>
                      <dt className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Location</dt>
                      <dd className="mt-0.5 text-sm text-gray-900 dark:text-white">{employee.location}</dd>
                    </div>
                  )}
                  {employee.costCenter && (
                    <div>
                      <dt className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Cost Center</dt>
                      <dd className="mt-0.5 text-sm text-gray-900 dark:text-white">{employee.costCenter}</dd>
                    </div>
                  )}
                  {employee.legalEntity && (
                    <div>
                      <dt className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Legal Entity</dt>
                      <dd className="mt-0.5 text-sm text-gray-900 dark:text-white">{employee.legalEntity}</dd>
                    </div>
                  )}
                  {employee.businessUnit && (
                    <div>
                      <dt className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Business Unit</dt>
                      <dd className="mt-0.5 text-sm text-gray-900 dark:text-white">{employee.businessUnit}</dd>
                    </div>
                  )}
                </>
              )}
            </dl>
          </Card>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <Card>
          <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            {searchQuery.trim()
              ? 'No employees match your search. Try a different term.'
              : 'No employees found.'}
          </p>
        </Card>
      )}
    </div>
  );
};

export default OrganizationEmployeesPage;
