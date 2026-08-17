export const NotificationBoardWithAttachmentsDocument = `
  query NotificationBoardWithAttachments($limit: Int! = 20) {
    unreadNotificationCount
    announcements(limit: $limit) {
      id
      title
      body
      targetAudience
      targetDepartmentId
      targetLocationId
      postSource
      publishAt
      expiresAt
      imageAttachment {
        fileName
        mimeType
        fileSizeBytes
        contentBase64
      }
      documentAttachment {
        fileName
        mimeType
        fileSizeBytes
        contentBase64
      }
    }
    notifications(limit: $limit) {
      id
      kind
      title
      message
      actionUrl
      isRead
      createdAt
    }
  }
`;

export const NotificationDropdownDocument = `
  query NotificationDropdown($limit: Int! = 15) {
    unreadNotificationCount
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
