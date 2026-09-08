export interface CelebrationPreferencesData {
  myCelebrationPreferences: {
    shareBirthday: boolean;
    shareWorkAnniversary: boolean;
  };
}

export interface UpdateCelebrationPreferencesData {
  updateMyCelebrationPreferences: CelebrationPreferencesData['myCelebrationPreferences'];
}

export interface NotificationAutomationSettingsData {
  notificationAutomationSettings: {
    birthdayEnabled: boolean;
    workAnniversaryEnabled: boolean;
    companySharingEnabled: boolean;
    deliveryLocalTime: string;
    birthdayTitleTemplate: string;
    birthdayMessageTemplate: string;
    anniversaryTitleTemplate: string;
    anniversaryMessageTemplate: string;
  };
}

export type NotificationAutomationSettings =
  NotificationAutomationSettingsData['notificationAutomationSettings'];

export const MyCelebrationPreferencesSafeDocument = `
  query MyCelebrationPreferences {
    myCelebrationPreferences {
      shareBirthday
      shareWorkAnniversary
    }
  }
`;

export const UpdateMyCelebrationPreferencesSafeDocument = `
  mutation UpdateMyCelebrationPreferences($input: UpdateCelebrationPreferencesInput!) {
    updateMyCelebrationPreferences(input: $input) {
      shareBirthday
      shareWorkAnniversary
    }
  }
`;

export const NotificationAutomationSettingsSafeDocument = `
  query NotificationAutomationSettings {
    notificationAutomationSettings {
      birthdayEnabled
      workAnniversaryEnabled
      companySharingEnabled
      deliveryLocalTime
      birthdayTitleTemplate
      birthdayMessageTemplate
      anniversaryTitleTemplate
      anniversaryMessageTemplate
    }
  }
`;

export const SaveNotificationAutomationSettingsSafeDocument = `
  mutation SaveNotificationAutomationSettings($input: SaveNotificationAutomationSettingsInput!) {
    saveNotificationAutomationSettings(input: $input) {
      birthdayEnabled
      workAnniversaryEnabled
      companySharingEnabled
      deliveryLocalTime
      birthdayTitleTemplate
      birthdayMessageTemplate
      anniversaryTitleTemplate
      anniversaryMessageTemplate
    }
  }
`;
