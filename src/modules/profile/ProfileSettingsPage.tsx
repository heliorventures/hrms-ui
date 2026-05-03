import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { getDefaultUserProfile } from '../../profile/defaultUserProfile';
import Card from '../../components/common/Card';
import AboutTab from './components/AboutTab';
import ProfileTab from './components/ProfileTab';
import JobDetailsTab from './components/JobDetailsTab';
import DocumentsTab from './components/DocumentsTab';
import SecurityTab from './components/SecurityTab';
import NotificationsTab from './components/NotificationsTab';

type TabId = 'about' | 'profile' | 'job' | 'documents' | 'notifications' | 'security';

const tabs: { id: TabId; label: string }[] = [
  { id: 'about', label: 'About' },
  { id: 'profile', label: 'Profile' },
  { id: 'job', label: 'Job Details' },
  { id: 'documents', label: 'Documents' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'security', label: 'Security' },
];

const ProfileSettingsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const [activeTab, setActiveTab] = useState<TabId>('about');

  const data = user ? getDefaultUserProfile(user, currentTenant.name) : null;

  if (!user || !data) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">Please log in to view profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>

      {/* Top header: email, phone, company, employeeId */}
      <Card className="bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Email</p>
            <p className="mt-1 font-medium text-gray-900 dark:text-white">{data.header.email}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Phone</p>
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
            <p className="mt-1 font-medium text-gray-900 dark:text-white">{data.org.department}</p>
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
      {activeTab === 'notifications' && <NotificationsTab />}
      {activeTab === 'security' && (
        <SecurityTab
          onPasswordChanged={async () => {
            await logout();
            navigate('/login', { replace: true });
          }}
        />
      )}
    </div>
  );
};

export default ProfileSettingsPage;
