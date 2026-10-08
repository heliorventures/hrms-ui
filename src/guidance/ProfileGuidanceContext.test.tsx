// @vitest-environment jsdom
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { visibleGuidanceTabs } from './featureDestinations';
import {
  useProfileGuidanceAccess,
  useRegisterProfileGuidanceAccess,
} from './ProfileGuidanceContext';
import { ProfileGuidanceProvider } from './ProfileGuidanceProvider';
import { findTourForRoute } from './tourRegistry';

const auth = vi.hoisted(() => ({ tenantId: 'a', user: { id: 'reader' }, clientSession: null }));
vi.mock('../contexts/AuthContext', () => ({ useAuth: () => auth }));
const wrapper = ({ children }: PropsWithChildren) => (
  <ProfileGuidanceProvider>{children}</ProfileGuidanceProvider>
);
afterEach(cleanup);
describe('target-authorized profile guidance', () => {
  it.each(['SELF viewing another employee', 'TEAM viewing an employee outside the team'])(
    'hides private destinations for %s',
    () => {
      const context = {
        routePath: 'organization/employees/:employeeId',
        canScopedPermission: () => true,
        profileAccess: {
          canViewPrivateProfile: false,
          canEditPersonalProfile: false,
          canManageOrganizationFields: false,
          canReviewProfileChanges: false,
        },
      };
      expect(visibleGuidanceTabs(context.routePath, context)).toEqual([]);
      const tour = findTourForRoute(context.routePath, { ...context, allowedTabIds: () => [] });
      expect(tour?.steps.map((step) => step.id)).toEqual(['employee-profile-directory-details']);
    }
  );
  it('uses only a matching target and clears access immediately for a new owner', async () => {
    const access = {
      canViewPrivateProfile: true,
      canEditPersonalProfile: true,
      canManageOrganizationFields: false,
      canReviewProfileChanges: false,
      directoryEntry: { employeeId: 'employee-a' },
    };
    const view = renderHook(
      ({ target }) => {
        useRegisterProfileGuidanceAccess('employee-a', access);
        return useProfileGuidanceAccess(target);
      },
      { initialProps: { target: 'employee-a' }, wrapper }
    );
    await waitFor(() => expect(view.result.current?.canViewPrivateProfile).toBe(true));
    view.rerender({ target: 'employee-b' });
    expect(view.result.current).toBeUndefined();
    view.unmount();
    auth.tenantId = 'b';
    const next = renderHook(() => useProfileGuidanceAccess('employee-a'), { wrapper });
    expect(next.result.current).toBeUndefined();
    auth.tenantId = 'a';
  });
});
