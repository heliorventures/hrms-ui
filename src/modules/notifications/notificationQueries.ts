export const AnnouncementPreviewDocument = `
  query AnnouncementDrawerPreview($limit: Int!) {
    announcements(limit: $limit) {
      id title body hasImageAttachment hasDocumentAttachment
    }
  }
`;

export const UnreadNotificationCountDocument = `
  query NotificationUnreadCount {
    unreadNotificationCount
  }
`;

export const NotificationPreviewDocument = `
  query NotificationPreview($limit: Int! = 15) {
    notifications(limit: $limit) {
      id
      title
      message
      actionUrl
      isRead
      createdAt
    }
  }
`;

export const AdminNotificationsConsoleSafeDocument = `
  query AdminNotificationsConsoleSafe(
    $annLim: Int! = 100
    $notLim: Int! = 150
    $empLim: Int! = 200
    $deptLim: Int! = 50
  ) {
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
    adminAnnouncements(limit: $annLim) {
      id
      title
      body
      targetAudience
      targetDepartmentId
      targetLocationId
      postSource
      hasVideoAttachment
      videoLink
      publishAt
      expiresAt
      createdAt
    }
    adminNotifications(limit: $notLim) {
      id
      userId
      kind
      title
      message
      actionUrl
      isRead
      createdAt
    }
    employees(limit: $empLim) {
      id
      fullName
      userId
      linkedUserEmail
      linkedUserUsername
    }
    departments(limit: $deptLim) {
      id
      name
    }
  }
`;

export const CreateAnnouncementSafeDocument = `
  mutation CreateAnnouncementSafe($input: CreateAnnouncementInput!) {
    createAnnouncement(input: $input) {
      id
      title
      body
      postSource
    }
  }
`;
