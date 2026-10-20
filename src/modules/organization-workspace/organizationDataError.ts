import { ClientError } from 'graphql-request';

import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

/** These messages describe validated contract failures and contain no server exception text. */
export class OrganizationDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrganizationDataError';
  }
}

export function organizationUserMessage(error: unknown): string {
  if (error instanceof OrganizationDataError) return error.message;
  if (error instanceof ClientError) {
    for (const item of error.response.errors ?? []) {
      const message = organizationCodeMessage(item.extensions.code);
      if (message) return message;
    }
  }
  return graphQlUserMessage(error);
}

export function organizationCodeMessage(code: unknown): string | null {
  if (code === 'ORGANIZATION_INSTALLATION_UNCONFIRMED')
    return 'Confirm the pending relationship installation in the source company before editing this assignment. Use the original command reference to check its source status.';
  if (code === 'ORGANIZATION_LIFECYCLE_CONFIRMATION_REQUIRED')
    return 'Finish source membership retirement and confirm its status before changing the organization reporting graph.';
  if (code === 'ORGANIZATION_DIRECTORY_SYNC_REQUIRED')
    return 'Synchronize every joined company directory to completion before changing manager relationships. Resume and synchronize a suspended company with incomplete directory proof, or detach it.';
  if (code === 'ORGANIZATION_REPORTS_REQUIRE_REASSIGNMENT')
    return 'Reassign or end the incoming manager relationships and install those changes in their source companies before detaching this company.';
  return null;
}
