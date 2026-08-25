export const LeaveBoardRangeDocument = `
  query LeaveBoardRange($limit: Int! = 20, $balanceYear: Int, $fromDate: NaiveDate, $toDate: NaiveDate) {
    viewerEmployeeId
    upcomingHolidays(limit: 100) {
      id
      calendarId
      calendarName
      holidayDate
      name
      holidayType
    }
    leavePolicies(limit: 50) {
      id
      leaveTypeId
      applicableTo
      annualEntitlement
      accrualFrequency
      accrualDays
      maxConsecutiveDays
      minNoticeDays
    }
    leaveTypes(limit: $limit) {
      id
      name
      code
      isPaid
      carryForward
      requiresDocument
      halfDayAllowed
      sandwichRule
    }
    leaveRequests(limit: $limit, fromDate: $fromDate, toDate: $toDate) {
      id
      employeeId
      employeeName
      employeeCode
      leaveTypeId
      fromDate
      toDate
      daysRequested
      status
      reason
      rejectionReason
      isHalfDay
      halfDaySession
      appliedAt
      workflowInstanceId
      pendingApprovalStage
      viewerMayApprove
      supportingDocumentReference
    }
    leaveBalances(limit: $limit, year: $balanceYear) {
      id
      leaveTypeId
      year
      entitledDays
      usedDays
      pendingDays
      balanceDays
      carriedForwardDays
    }
  }
`;
