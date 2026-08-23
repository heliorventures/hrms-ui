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
    adminAnnouncements(limit: $annLim) {
      id
      title
      body
      targetAudience
      targetDepartmentId
      targetLocationId
      postSource
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
