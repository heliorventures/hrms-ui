import type { GuidanceTabSet, StepDestination } from '../../../guidance/tabTypes';
import { organizationGuidanceTabs } from '../../organization/guidance/features';

export const profileGuidanceTabs: readonly GuidanceTabSet[] = [
  {
    routePaths: ['profile/settings'],
    anchor: 'profile-settings-navigation',
    tabs: [
      ...organizationGuidanceTabs[0].tabs,
      {
        id: 'security',
        label: 'Security settings',
        body: 'Open the password form, enter the current password and confirm a different password. Saving signs active sessions out.',
      },
    ],
  },
];
export const profileStepDestinations: Readonly<Record<string, StepDestination>> = {
  'profile-security': { tabId: 'security', keywords: ['password', 'change password', 'security'] },
  'profile-password-form': {
    tabId: 'security',
    keywords: ['password', 'change password', 'security'],
  },
};
