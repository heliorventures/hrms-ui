import { useState } from 'react';

import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

import OrganizationAccountsAdmin from './OrganizationAccountsAdmin';
import { companyBusinessReady } from './organizationCompanyLifecycle';
import OrganizationEmployeesAdmin from './OrganizationEmployeesAdmin';
import { HR_SECTIONS, type HrSection } from './organizationHrModel';
import OrganizationSeparationsAdmin from './OrganizationSeparationsAdmin';
import type { OrganizationScope } from './organizationTypes';
import OrganizationWorkflowsAdmin from './OrganizationWorkflowsAdmin';

const OrganizationHrAdministration = ({ scope }: { scope: OrganizationScope }) => {
  const [selected, setSelected] = useState<HrSection>('employees');
  const { company } = scope;
  if (!company)
    return (
      <Card>
        <p>Select the business target company for HR administration.</p>
      </Card>
    );
  if (!companyBusinessReady(company))
    return (
      <Card>
        <p>Source membership setup must finish before company HR administration.</p>
      </Card>
    );
  const sections = HR_SECTIONS.filter((section) =>
    company.capabilities.includes(section.capability)
  );
  const first = sections.length > 0 ? sections[0].value : null;
  const task = sections.find((section) => section.value === selected)?.value ?? first;
  return (
    <div className="space-y-4">
      <Card title={`Company HR administration: ${company.name}`}>
        <nav aria-label="Company HR administration" className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <Button
              key={section.value}
              variant={task === section.value ? 'primary' : 'outline'}
              onClick={() => setSelected(section.value)}
            >
              {section.label}
            </Button>
          ))}
        </nav>
        {!task ? <p>No HR administration capability is granted for this company.</p> : null}
      </Card>
      {task === 'employees' ? <OrganizationEmployeesAdmin scope={scope} /> : null}
      {task === 'accounts' ? <OrganizationAccountsAdmin scope={scope} /> : null}
      {task === 'workflows' ? <OrganizationWorkflowsAdmin scope={scope} /> : null}
      {task === 'separations' ? <OrganizationSeparationsAdmin scope={scope} /> : null}
    </div>
  );
};

export default OrganizationHrAdministration;
