import type { TourDefinition } from '../../../guidance/tourTypes';

export const profileSettingsTour: TourDefinition = {
  id: 'profile-settings',
  routePaths: ['profile/settings'],
  steps: [
    {
      id: 'profile-record',
      anchor: 'profile-settings-navigation',
      title: 'Find your profile sections',
      body: 'If your login is linked to an employee record, Profile contains the sections available to your account. If no employee profile is linked, ask your tenant administrator or HR team to link one.',
    },
    {
      id: 'profile-personal-info',
      anchor: 'profile-settings-navigation',
      title: 'Review personal information',
      body: 'If your login is linked to an employee record, return to Profile after the tour and choose Personal Info to review your contact and personal details. Changes to sensitive identity fields may be sent to HR for review.',
    },
    {
      id: 'profile-banking',
      anchor: 'profile-settings-navigation',
      title: 'Review banking details',
      body: 'If your login is linked to an employee record, return to Profile after the tour and choose Banking to review protected bank account details. Depending on your access, changes are saved directly or sent to HR for review.',
    },
    {
      id: 'profile-documents',
      anchor: 'profile-settings-navigation',
      title: 'Open your documents',
      body: 'If your login is linked to an employee record, return to Profile after the tour and choose Documents to view records available to your account. Upload and review controls are handled in that section.',
    },
    {
      id: 'profile-security',
      anchor: 'profile-settings-navigation',
      title: 'Open security settings',
      body: 'From Profile, use Security settings after the tour to open the password change form. A successful password change revokes active sessions and requires you to sign in again.',
    },
    {
      id: 'profile-password-form',
      anchor: 'profile-settings-navigation',
      title: 'Change your password',
      body: 'After this tour, select Security settings from Profile to open the form. If this page already shows Security Settings, use the form below. Enter your current password and confirm a different password. Saving changes the credential and signs active sessions out; this tour does not submit the form.',
    },
  ],
};
