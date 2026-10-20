import { ClientError } from 'graphql-request';
import { expect, it } from 'vitest';

import { commandRecoveryMessage } from './organizationCommand';
import { organizationUserMessage } from './organizationDataError';

const error = (code: string) =>
  new ClientError(
    { status: 400, errors: [{ message: 'Private server details', extensions: { code } }] },
    { query: 'synthetic' }
  );

it('provides stable directory and reporting reassignment recovery without rendering server details', () => {
  expect(organizationUserMessage(error('ORGANIZATION_DIRECTORY_SYNC_REQUIRED'))).toContain(
    'Synchronize every joined company directory'
  );
  expect(organizationUserMessage(error('ORGANIZATION_REPORTS_REQUIRE_REASSIGNMENT'))).toContain(
    'install those changes'
  );
  expect(commandRecoveryMessage({ code: 'ORGANIZATION_REPORTS_REQUIRE_REASSIGNMENT' })).toContain(
    'before detaching'
  );
  expect(organizationUserMessage(error('INTERNAL_ERROR'))).not.toContain('Private server details');
  expect(organizationUserMessage(error('ORGANIZATION_INSTALLATION_UNCONFIRMED'))).toContain(
    'pending relationship installation'
  );
  expect(organizationUserMessage(error('ORGANIZATION_LIFECYCLE_CONFIRMATION_REQUIRED'))).toContain(
    'source membership retirement'
  );
});
