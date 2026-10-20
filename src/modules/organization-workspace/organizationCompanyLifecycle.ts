import { commandCapability, type BusinessOperation } from './organizationCommand';

interface CompanyAuthority {
  status: string;
  capabilities: readonly string[];
  version: number;
  runtimeStatus: string;
  installedVersion?: number | null;
}

export function companyBusinessReady(company: CompanyAuthority): boolean {
  return (
    company.status === 'ACTIVE' &&
    company.runtimeStatus === 'ACTIVE' &&
    Number.isSafeInteger(company.version) &&
    company.version > 0 &&
    company.installedVersion === company.version
  );
}

export function companyCommandAllowed(
  company: CompanyAuthority,
  operation: BusinessOperation
): boolean {
  const statusAllowed =
    operation === 'install_membership'
      ? ['ACTIVE', 'SUSPENDED', 'DETACHING'].includes(company.status)
      : companyBusinessReady(company);
  return statusAllowed && company.capabilities.includes(commandCapability(operation));
}

export function membershipNeedsInstallation(
  company: Pick<CompanyAuthority, 'status' | 'runtimeStatus' | 'version' | 'installedVersion'>
): boolean {
  const expectedStatus = company.status === 'DETACHING' ? 'DETACHED' : company.status;
  return (
    ['ACTIVE', 'SUSPENDED', 'DETACHING'].includes(company.status) &&
    (company.installedVersion !== company.version || company.runtimeStatus !== expectedStatus)
  );
}
