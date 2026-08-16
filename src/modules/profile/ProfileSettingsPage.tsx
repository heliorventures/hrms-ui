import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import { EmployeeProfileShell } from '../organization/employee-profile/EmployeeProfileShell';
import SecurityTab from './components/SecurityTab';
import { MyEmployeeDocument, type MyEmployeeQuery } from './myEmployeeQuery';

type ProfileView = 'profile' | 'security';

const ProfileSettingsPage = () => {
  const { clientSession, user, logout } = useAuth();
  const client = useGraphClient('client');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeView, setActiveView] = useState<ProfileView>(
    searchParams.get('tab') === 'security' ? 'security' : 'profile'
  );
  const [employeeId, setEmployeeId] = useState<string | null | undefined>(undefined);
  const [profileError, setProfileError] = useState<string | null>(null);
  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      setEmployeeId(null);
      setProfileError(null);
      return;
    }

    let cancelled = false;
    setEmployeeId(undefined);
    setProfileError(null);
    void client
      .request<MyEmployeeQuery>(MyEmployeeDocument)
      .then((response) => {
        if (!cancelled) setEmployeeId(response.myEmployee?.id ?? null);
      })
      .catch((error) => {
        if (!cancelled) {
          setEmployeeId(null);
          setProfileError(graphQlUserMessage(error));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [client, userId]);

  if (!user) {
    return (
      <Card>
        <p className="text-center text-gray-500 dark:text-gray-400">
          Please log in to view profile.
        </p>
      </Card>
    );
  }

  if (activeView === 'security') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security Settings</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Change your password and revoke existing sessions.
            </p>
          </div>
          {!clientSession?.mustChangePassword && employeeId ? (
            <Button type="button" variant="outline" onClick={() => setActiveView('profile')}>
              Back to profile
            </Button>
          ) : null}
        </div>
        <Card>
          <SecurityTab
            forced={clientSession?.mustChangePassword === true}
            onPasswordChanged={async () => {
              await logout();
              navigate('/login', { replace: true, state: { passwordChanged: true } });
            }}
          />
        </Card>
      </div>
    );
  }

  if (employeeId === undefined) {
    return (
      <Card>
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading your employee profile...</p>
      </Card>
    );
  }

  if (profileError) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <Button type="button" variant="outline" onClick={() => setActiveView('security')}>
            Security settings
          </Button>
        </div>
        <Card>
          <p className="font-medium text-red-700 dark:text-red-300">
            We could not load your employee profile.
          </p>
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{profileError}</p>
        </Card>
      </div>
    );
  }

  if (!employeeId) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <Button type="button" variant="outline" onClick={() => setActiveView('security')}>
            Security settings
          </Button>
        </div>
        <Card>
          <p className="font-medium text-gray-900 dark:text-white">
            No employee profile is linked to this login.
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Ask your tenant administrator or HR team to link an employee record to {user.email}.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Edit your personal profile, upload documents, and maintain your employment records.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => setActiveView('security')}>
          Security settings
        </Button>
      </div>
      <EmployeeProfileShell employeeId={employeeId} />
    </div>
  );
};

export default ProfileSettingsPage;
