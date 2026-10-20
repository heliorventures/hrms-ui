import { useState } from 'react';

import Card from '../../components/common/Card';

import { companyBusinessReady } from './organizationCompanyLifecycle';
import OrganizationDateRangeForm from './OrganizationDateRangeForm';
import OrganizationHistory from './OrganizationHistory';
import OrganizationHistoryArchive from './OrganizationHistoryArchive';
import OrganizationOperationalProgress from './OrganizationOperationalProgress';
import OrganizationProgress from './OrganizationProgress';
import type { OrganizationDateRange } from './organizationReportingModel';
import type { OrganizationScope } from './organizationTypes';

const OrganizationReporting = ({
  scope,
  mode,
}: {
  scope: OrganizationScope;
  mode: 'progress' | 'history';
}) => {
  const [range, setRange] = useState<OrganizationDateRange | null>(null);
  const capability = mode === 'history' ? 'history:read' : 'analytics:read';
  const companies = (scope.company ? [scope.company] : scope.companies).filter(
    (company) => companyBusinessReady(company) && company.capabilities.includes(capability)
  );
  if (companies.length === 0)
    return (
      <Card>
        <p>
          No company in this selection grants{' '}
          {mode === 'history' ? 'business history' : 'progress reporting'} access.
        </p>
      </Card>
    );
  return (
    <div className="space-y-4">
      <Card title={mode === 'history' ? 'Business history period' : 'Company progress period'}>
        <OrganizationDateRangeForm history={mode === 'history'} onApply={setRange} />
      </Card>
      {range && mode === 'progress' ? (
        <>
          <OrganizationProgress scope={scope} companies={companies} range={range} />
          <OrganizationOperationalProgress scope={scope} companies={companies} range={range} />
        </>
      ) : null}
      {range && mode === 'history' ? (
        <>
          <OrganizationHistory scope={scope} companies={companies} range={range} />
          <OrganizationHistoryArchive scope={scope} range={range} />
        </>
      ) : null}
    </div>
  );
};

export default OrganizationReporting;
