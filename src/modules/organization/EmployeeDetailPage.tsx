import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext';
import { mockEmployees } from '../../mocks/employees';
import { getMockUserProfile, getDefaultProfileFromEmployee } from '../../mocks/userProfile';
import Card from '../../components/common/Card';
import AboutTab from '../profile/components/AboutTab';
import ProfileTab from '../profile/components/ProfileTab';
import JobDetailsTab from '../profile/components/JobDetailsTab';
import DocumentsTab from '../profile/components/DocumentsTab';
import type { UserProfileFull } from '../../types';

type TabId = 'about' | 'profile' | 'job' | 'documents';

const tabs: { id: TabId; label: string }[] = [
  { id: 'about', label: 'About' },
  { id: 'profile', label: 'Profile' },
  { id: 'job', label: 'Job Details' },
  { id: 'documents', label: 'Documents' },
];

const EmployeeDetailPage = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const { currentTenant } = useTenant();
  const [activeTab, setActiveTab] = useState<TabId>('about');

  const employee = employeeId
    ? mockEmployees.find((e) => e.id === employeeId && e.tenantId === currentTenant.id)
    : undefined;

  const profile = employee
    ? getMockUserProfile(employee.id) ?? getDefaultProfileFromEmployee(employee, currentTenant.name)
    : null;

  if (!employeeId || !employee || !profile) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">Employee not found.</p>
        <Link
          to="/organization/employees"
          className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          ← Back to Employees
        </Link>
      </div>
    );
  }

  const data: UserProfileFull = profile;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/organization/employees"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            ← Back to Employees
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            Employee Details – {data.primaryDetails.name}
          </h1>
        </div>
      </div>

      {/* Top header: email, phone, company, employeeId */}
      <Card className="bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              Email
            </p>
            <p className="mt-1 font-medium text-gray-900 dark:text-white">
              {data.header.email}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              Phone
            </p>
            <p className="mt-1 font-medium text-gray-900 dark:text-white">
              {data.header.phone || '-'}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              Company
            </p>
            <p className="mt-1 font-medium text-gray-900 dark:text-white">
              {data.header.companyName}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              Employee ID
            </p>
            <p className="mt-1 font-medium text-gray-900 dark:text-white">
              {data.header.employeeId}
            </p>
          </div>
        </div>
      </Card>

      {/* Business unit, department, reporting manager */}
      <Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              Business Unit
            </p>
            <p className="mt-1 font-medium text-gray-900 dark:text-white">
              {data.org.businessUnit}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              Department
            </p>
            <p className="mt-1 font-medium text-gray-900 dark:text-white">
              {data.org.department}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              Reporting Manager
            </p>
            <p className="mt-1 font-medium text-gray-900 dark:text-white">
              {data.org.reportingManager}
            </p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex gap-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'about' && <AboutTab data={data} />}
      {activeTab === 'profile' && <ProfileTab data={data} />}
      {activeTab === 'job' && <JobDetailsTab data={data} />}
      {activeTab === 'documents' && <DocumentsTab />}
    </div>
  );
};

export default EmployeeDetailPage;
