// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import type { GraphQLClient } from 'graphql-request';
import { afterEach, expect, it, vi } from 'vitest';

import { EmployeeProfileAccessDocument } from '../../../../api/graphql/graphql';
import { EmployeePrivateProfileLocationDocument } from '../profileDocuments';

import { useEmployeeProfileData } from './useEmployeeProfileData';

const auth = vi.hoisted(() => ({
  tenantId: 'tenant-a',
  user: { id: 'reader' },
  clientSession: null,
}));
vi.mock('../../../../contexts/AuthContext', () => ({ useAuth: () => auth }));
vi.mock('../lib/mapBundleToModel', () => ({
  mapBundleToEmployeeProfileModel: (bundle: { employee: { locationName: string } }) => ({
    companyAssignment: { locationName: bundle.employee.locationName },
  }),
}));
const access = {
  isSelf: true,
  canViewPrivateProfile: true,
  canViewPayrollSensitive: false,
  canEditPersonalProfile: true,
  canManageOrganizationFields: false,
  canReviewProfileChanges: false,
  directoryEntry: { employeeId: 'employee-a' },
};
afterEach(() => {
  cleanup();
  auth.tenantId = 'tenant-a';
});
it('loads location from the canonical private profile document after target access', async () => {
  const request = vi
    .fn()
    .mockImplementation((document) =>
      Promise.resolve(
        document === EmployeeProfileAccessDocument
          ? { employeeProfileAccess: access }
          : { employee: { locationName: 'Pune' }, documentTypes: [] }
      )
    );
  const client = { request } as unknown as GraphQLClient;
  const view = renderHook(() => useEmployeeProfileData(client, 'employee-a'));
  await waitFor(() =>
    expect(view.result.current.model?.companyAssignment.locationName).toBe('Pune')
  );
  expect(request.mock.calls[0][0]).toBe(EmployeeProfileAccessDocument);
  expect(request.mock.calls[1][0]).toBe(EmployeePrivateProfileLocationDocument);
  expect(EmployeePrivateProfileLocationDocument).toContain('locationAssignmentEffectiveFrom');
});
it('hides private state on owner change and rejects an earlier completion', async () => {
  let finishOld: ((value: object) => void) | undefined;
  const request = vi.fn().mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finishOld = resolve;
      })
  );
  const client = { request } as unknown as GraphQLClient;
  const view = renderHook(() => useEmployeeProfileData(client, 'employee-a'));
  await waitFor(() => expect(request).toHaveBeenCalledOnce());
  request.mockResolvedValueOnce({
    employeeProfileAccess: { ...access, canViewPrivateProfile: false },
  });
  auth.tenantId = 'tenant-b';
  view.rerender();
  expect(view.result.current.access).toBeNull();
  expect(view.result.current.model).toBeNull();
  await waitFor(() => expect(view.result.current.access?.canViewPrivateProfile).toBe(false));
  await act(async () => {
    finishOld?.({ employeeProfileAccess: access });
    await Promise.resolve();
  });
  expect(view.result.current.access?.canViewPrivateProfile).toBe(false);
  expect(view.result.current.model).toBeNull();
  expect(request).toHaveBeenCalledTimes(2);
});
