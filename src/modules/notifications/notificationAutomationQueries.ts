export {
  MyCelebrationPreferencesDocument as MyCelebrationPreferencesSafeDocument,
  UpdateMyCelebrationPreferencesDocument as UpdateMyCelebrationPreferencesSafeDocument,
  NotificationAutomationSettingsDocument as NotificationAutomationSettingsSafeDocument,
  SaveNotificationAutomationSettingsDocument as SaveNotificationAutomationSettingsSafeDocument,
} from '../../api/graphql/graphql';
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
