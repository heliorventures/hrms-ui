import { appearanceTour } from '../appearance/guidance/AppearanceTour';
import { adminAttendancePolicyPageTour } from '../modules/admin/guidance/AdminAttendancePolicyPageTour';
import { adminCompanyLocationsPageTour } from '../modules/admin/guidance/AdminCompanyLocationsPageTour';
import { adminEmployeesPageTour } from '../modules/admin/guidance/AdminEmployeesPageTour';
import { adminExpenseCategoriesPageTour } from '../modules/admin/guidance/AdminExpenseCategoriesPageTour';
import { adminHrTimesheetSettingsPageTour } from '../modules/admin/guidance/AdminHrTimesheetSettingsPageTour';
import { adminLeaveSettingsPageTour } from '../modules/admin/guidance/AdminLeaveSettingsPageTour';
import { adminNotificationsPageTour } from '../modules/admin/guidance/AdminNotificationsPageTour';
import { adminReportsPageTour } from '../modules/admin/guidance/AdminReportsPageTour';
import { adminSettingsPageTour } from '../modules/admin/guidance/AdminSettingsPageTour';
import { adminWorkflowsPageTour } from '../modules/admin/guidance/AdminWorkflowsPageTour';
import { moduleHealthPageTour } from '../modules/admin/guidance/ModuleHealthPageTour';
import { attendancePageTour } from '../modules/attendance/guidance/AttendancePageTour';
import { dashboardTour } from '../modules/dashboard/guidance/DashboardTour';
import { expensesPageTour } from '../modules/expenses/guidance/ExpensesPageTour';
import { hrAccessManagementPageTour } from '../modules/hr/guidance/HrAccessManagementPageTour';
import { hrAttendanceManagementPageTour } from '../modules/hr/guidance/HrAttendanceManagementPageTour';
import { hrHomePageTour } from '../modules/hr/guidance/HrHomePageTour';
import { hrLeavesPageTour } from '../modules/hr/guidance/HrLeavesPageTour';
import { hrTimesheetProjectAssignmentsPageTour } from '../modules/hr/guidance/HrTimesheetProjectAssignmentsPageTour';
import { hrTimesheetsPageTour } from '../modules/hr/guidance/HrTimesheetsPageTour';
import { insightsTour } from '../modules/insights/guidance/InsightsTour';
import { leaveHolidaysPageTour } from '../modules/leave/guidance/LeaveHolidaysPageTour';
import { leavePageTour } from '../modules/leave/guidance/LeavePageTour';
import { leaveTeamCalendarPageTour } from '../modules/leave/guidance/LeaveTeamCalendarPageTour';
import { myWorkCompletedTour, myWorkTasksTour } from '../modules/my-work/guidance/MyWorkTour';
import { notificationsTour } from '../modules/notifications/guidance/NotificationsTour';
import { employeeDetailTour } from '../modules/organization/guidance/EmployeeDetailTour';
import { organizationDocumentsTour } from '../modules/organization/guidance/OrganizationDocumentsTour';
import { organizationEmployeesTour } from '../modules/organization/guidance/OrganizationEmployeesTour';
import { orgChartTour } from '../modules/organization/guidance/OrgChartTour';
import { profileReviewTour } from '../modules/organization/guidance/ProfileReviewTour';
import { payrollCompensationPageTour } from '../modules/payroll/guidance/PayrollCompensationPageTour';
import { payrollPageTour } from '../modules/payroll/guidance/PayrollPageTour';
import { payrollPayPageTour } from '../modules/payroll/guidance/PayrollPayPageTour';
import { payrollTaxPageTour } from '../modules/payroll/guidance/PayrollTaxPageTour';
import { prejoiningAdminPageTour } from '../modules/prejoining/admin/guidance/PrejoiningAdminPageTour';
import { profileSettingsTour } from '../modules/profile/guidance/ProfileSettingsTour';
import { timesheetPageTour } from '../modules/timesheet/guidance/TimesheetPageTour';
import { assetsPageTour } from '../modules/workplace/guidance/AssetsPageTour';
import { benefitsPageTour } from '../modules/workplace/guidance/BenefitsPageTour';
import { compensationPageTour } from '../modules/workplace/guidance/CompensationPageTour';
import { grievancePageTour } from '../modules/workplace/guidance/GrievancePageTour';
import { learningPageTour } from '../modules/workplace/guidance/LearningPageTour';
import { onboardingPageTour } from '../modules/workplace/guidance/OnboardingPageTour';
import { performancePageTour } from '../modules/workplace/guidance/PerformancePageTour';
import { recruitmentPageTour } from '../modules/workplace/guidance/RecruitmentPageTour';
import { successionPageTour } from '../modules/workplace/guidance/SuccessionPageTour';
import { surveysPageTour } from '../modules/workplace/guidance/SurveysPageTour';

import { withFeatureDestinations } from './featureDestinations';
import type { TourContext, TourDefinition } from './tourTypes';

/**
 * Every tenant page tour is explicitly registered here. The definition stays
 * beside its page owner; this table links route identities to those definitions.
 */
export const TOUR_REGISTRY: readonly TourDefinition[] = [
  appearanceTour,
  dashboardTour,
  myWorkTasksTour,
  myWorkCompletedTour,
  performancePageTour,
  insightsTour,
  attendancePageTour,
  timesheetPageTour,
  leaveHolidaysPageTour,
  leaveTeamCalendarPageTour,
  leavePageTour,
  payrollPayPageTour,
  payrollPageTour,
  payrollTaxPageTour,
  payrollCompensationPageTour,
  expensesPageTour,
  notificationsTour,
  profileSettingsTour,
  organizationEmployeesTour,
  employeeDetailTour,
  orgChartTour,
  organizationDocumentsTour,
  profileReviewTour,
  benefitsPageTour,
  recruitmentPageTour,
  prejoiningAdminPageTour,
  onboardingPageTour,
  surveysPageTour,
  successionPageTour,
  compensationPageTour,
  learningPageTour,
  assetsPageTour,
  grievancePageTour,
  adminWorkflowsPageTour,
  hrHomePageTour,
  adminEmployeesPageTour,
  hrLeavesPageTour,
  hrAttendanceManagementPageTour,
  hrTimesheetsPageTour,
  hrTimesheetProjectAssignmentsPageTour,
  adminLeaveSettingsPageTour,
  adminExpenseCategoriesPageTour,
  adminNotificationsPageTour,
  adminAttendancePolicyPageTour,
  adminCompanyLocationsPageTour,
  adminHrTimesheetSettingsPageTour,
  adminReportsPageTour,
  hrAccessManagementPageTour,
  adminSettingsPageTour,
  moduleHealthPageTour,
].map(withFeatureDestinations);

/**
 * Finds a tour using the matched tenant route identity supplied by the shell.
 * Permission and tab conditions are applied before the definition is returned.
 */
export function findTourForRoute(
  matchedRoutePath: string | null,
  context: TourContext = { routePath: matchedRoutePath },
  tours: readonly TourDefinition[] = TOUR_REGISTRY
): TourDefinition | null {
  if (!matchedRoutePath) return null;

  const definition = tours.find((tour) => tour.routePaths.includes(matchedRoutePath));
  if (!definition) return null;

  const tourContext = { ...context, routePath: matchedRoutePath };
  const steps = definition.steps.filter((step) => {
    const tabId = step.destination?.tabId;
    if (
      tabId &&
      tourContext.allowedTabIds &&
      !tourContext.allowedTabIds(matchedRoutePath)?.includes(tabId)
    )
      return false;
    return step.isVisible?.({ ...tourContext, activeTab: tabId ?? tourContext.activeTab }) ?? true;
  });
  if (steps.length === 0) return null;

  return steps.length === definition.steps.length ? definition : { ...definition, steps };
}
