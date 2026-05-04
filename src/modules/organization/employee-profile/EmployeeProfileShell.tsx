import { useEffect, useMemo, useState } from 'react';
import {
  Briefcase,
  FileText,
  GraduationCap,
  IdCard,
  Landmark,
  LayoutDashboard,
  Shield,
  TrendingUp,
  User,
} from 'lucide-react';

import { useAuth } from '../../../contexts/AuthContext';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { useEmployeeProfileData } from './hooks/useEmployeeProfileData';
import { EmployeeHeader } from './components/EmployeeHeader';
import { SidebarProfile } from './components/SidebarProfile';
import { TabNavigation, type ProfileTabDef } from './components/TabNavigation';
import { ProfileSectionSkeleton, ErrorSection } from './components/SectionStates';
import { OverviewTab } from './tabs/OverviewTab';
import { PersonalInfoTab } from './tabs/PersonalInfoTab';
import { BankingTab } from './tabs/BankingTab';
import { IdentityTab } from './tabs/IdentityTab';
import { EducationTab } from './tabs/EducationTab';
import { WorkExperienceTab } from './tabs/WorkExperienceTab';
import { GrowthTimelineTab } from './tabs/GrowthTimelineTab';
import { DocumentsTab } from './tabs/DocumentsTab';
import { EmploymentManagementTab } from './tabs/EmploymentManagementTab';
import Button from '../../../components/common/Button';

const TAB_DEFS: ProfileTabDef[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'banking', label: 'Banking', icon: Landmark },
  { id: 'identity', label: 'Identity', icon: IdCard },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'work', label: 'Work Experience', icon: Briefcase },
  { id: 'growth', label: 'Growth Timeline', icon: TrendingUp },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'employment', label: 'Employment (HR)', icon: Shield, hrOnly: true },
];

interface EmployeeProfileShellProps {
  employeeId: string | undefined;
}

export function EmployeeProfileShell({ employeeId }: EmployeeProfileShellProps) {
  const client = useGraphClient('client');
  const { can } = useAuth();
  const isHr = can('employee:write');
  const showSalary = isHr;

  const { loading, error, model, documentTypes, refetch } = useEmployeeProfileData(client, employeeId);

  const visibleTabs = useMemo(
    () => TAB_DEFS.filter((t) => (t.hrOnly ? isHr : true)),
    [isHr]
  );

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!visibleTabs.some((t) => t.id === activeTab)) {
      setActiveTab('overview');
    }
  }, [visibleTabs, activeTab]);

  if (!employeeId) {
    return <ErrorSection message="Missing employee id in route." />;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <EmployeeHeader employeeName="Loading…" employeeCode="—" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <ProfileSectionSkeleton rows={6} />
          </div>
          <div className="lg:col-span-9 space-y-2">
            <ProfileSectionSkeleton rows={2} />
            <ProfileSectionSkeleton rows={5} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="space-y-4">
        <EmployeeHeader employeeName="Employee" employeeCode="—" />
        <ErrorSection message={error ?? 'Employee not found.'} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] space-y-4 pb-8">
      <EmployeeHeader
        employeeName={model.core.fullName}
        employeeCode={model.core.employeeCode}
        actions={
          <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
            Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <SidebarProfile model={model} />
        </div>

        <div className="space-y-4 lg:col-span-9">
          <TabNavigation
            tabs={visibleTabs}
            activeId={activeTab}
            onChange={setActiveTab}
          />

          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/40 sm:p-6">
            {activeTab === 'overview' ? (
              <OverviewTab model={model} showSalary={showSalary} />
            ) : null}
            {activeTab === 'personal' ? (
              <PersonalInfoTab
                key={model.core.id}
                employeeId={model.core.id}
                client={client}
                initial={model.personal}
                onSaved={refetch}
              />
            ) : null}
            {activeTab === 'banking' ? (
              <BankingTab employeeId={model.core.id} client={client} model={model} onSaved={refetch} />
            ) : null}
            {activeTab === 'identity' ? (
              <IdentityTab
                employeeId={model.core.id}
                client={client}
                model={model}
                documentTypes={documentTypes}
                isHr={isHr}
                onChanged={refetch}
              />
            ) : null}
            {activeTab === 'education' ? (
              <EducationTab key={model.core.id} initial={model.education} readOnly={false} />
            ) : null}
            {activeTab === 'work' ? <WorkExperienceTab model={model} /> : null}
            {activeTab === 'growth' ? <GrowthTimelineTab nodes={model.growthTimeline} /> : null}
            {activeTab === 'documents' ? (
              <DocumentsTab
                key={model.core.id}
                employeeId={model.core.id}
                client={client}
                initial={model.documents}
                documentTypes={documentTypes}
                isHr={isHr}
                onChanged={refetch}
              />
            ) : null}
            {activeTab === 'employment' && isHr ? (
              <EmploymentManagementTab
                employeeId={model.core.id}
                client={client}
                model={model}
                onChanged={refetch}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
