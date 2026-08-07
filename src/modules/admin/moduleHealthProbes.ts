import { gql } from 'graphql-request';
import type { ProbeConfig } from './moduleHealthTypes';

export const MODULE_HEALTH_PROBES: ProbeConfig[] = [
  {
    key: 'leave',
    label: 'Leave',
    plane: 'client',
    query: gql`
      query LeaveHealth {
        leaveTypes(limit: 1) {
          id
          name
        }
      }
    `,
    previewFields: ['leaveTypes'],
  },
  {
    key: 'attendance',
    label: 'Attendance',
    plane: 'client',
    query: gql`
      query AttendanceHealth {
        shifts(limit: 1) {
          id
          name
        }
      }
    `,
    previewFields: ['shifts'],
  },
  {
    key: 'payroll',
    label: 'Payroll',
    plane: 'client',
    query: gql`
      query PayrollHealth {
        salaryComponents(limit: 1) {
          id
          name
        }
      }
    `,
    previewFields: ['salaryComponents'],
  },
  {
    key: 'tax',
    label: 'Tax',
    plane: 'client',
    query: gql`
      query TaxHealth {
        taxConfigurations(limit: 1) {
          id
          fiscalYear
          regime
        }
      }
    `,
    previewFields: ['taxConfigurations'],
  },
  {
    key: 'benefits',
    label: 'Benefits',
    plane: 'client',
    query: gql`
      query BenefitsHealth {
        benefitTypes(limit: 1) {
          id
          name
        }
      }
    `,
    previewFields: ['benefitTypes'],
  },
  {
    key: 'expense',
    label: 'Expense',
    plane: 'client',
    query: gql`
      query ExpenseHealth {
        expenseCategories(limit: 1) {
          id
          name
        }
      }
    `,
    previewFields: ['expenseCategories'],
  },
  {
    key: 'recruitment',
    label: 'Recruitment',
    plane: 'client',
    query: gql`
      query RecruitmentHealth {
        jobPostings(limit: 1) {
          id
          title
        }
      }
    `,
    previewFields: ['jobPostings'],
  },
  {
    key: 'performance',
    label: 'Performance',
    plane: 'client',
    query: gql`
      query PerformanceHealth {
        reviewCycles(limit: 1) {
          id
          name
        }
      }
    `,
    previewFields: ['reviewCycles'],
  },
  {
    key: 'lms',
    label: 'LMS',
    plane: 'client',
    query: gql`
      query LmsHealth {
        skills(limit: 1) {
          id
          name
        }
      }
    `,
    previewFields: ['skills'],
  },
  {
    key: 'succession',
    label: 'Succession',
    plane: 'client',
    query: gql`
      query SuccessionHealth {
        competencies(limit: 1) {
          id
          name
        }
      }
    `,
    previewFields: ['competencies'],
  },
  {
    key: 'compensation',
    label: 'Compensation',
    plane: 'client',
    query: gql`
      query CompensationHealth {
        salaryBands(limit: 1) {
          id
          grade
        }
      }
    `,
    previewFields: ['salaryBands'],
  },
  {
    key: 'assets',
    label: 'Assets',
    plane: 'client',
    query: gql`
      query AssetsHealth {
        assetCategories(limit: 1) {
          id
          name
        }
      }
    `,
    previewFields: ['assetCategories'],
  },
  {
    key: 'grievance',
    label: 'Grievance',
    plane: 'client',
    query: gql`
      query GrievanceHealth {
        grievanceCategories(limit: 1) {
          id
          name
        }
      }
    `,
    previewFields: ['grievanceCategories'],
  },
  {
    key: 'workflow',
    label: 'Workflow',
    plane: 'client',
    query: gql`
      query WorkflowHealth {
        workflows(limit: 1) {
          id
          name
        }
      }
    `,
    previewFields: ['workflows'],
  },
  {
    key: 'notification',
    label: 'Notifications',
    plane: 'client',
    query: gql`
      query NotificationHealth {
        announcements(limit: 1) {
          id
          title
        }
      }
    `,
    previewFields: ['announcements'],
  },
  {
    key: 'analytics',
    label: 'Analytics',
    plane: 'client',
    query: gql`
      query AnalyticsHealth {
        webhookDeliveryLogs(limit: 1) {
          id
        }
      }
    `,
    previewFields: ['webhookDeliveryLogs'],
  },
  {
    key: 'tenant',
    label: 'Tenants (ops)',
    plane: 'operator',
    query: gql`
      query TenantsHealth {
        tenants(limit: 1) {
          id
          name
        }
      }
    `,
    previewFields: ['tenants'],
  },
  {
    key: 'billing',
    label: 'Billing (ops)',
    plane: 'operator',
    query: gql`
      query BillingHealth {
        invoices(limit: 1) {
          id
          invoiceNumber
        }
      }
    `,
    previewFields: ['invoices'],
  },
  {
    key: 'operator',
    label: 'Operators (ops)',
    plane: 'operator',
    query: gql`
      query OperatorHealth {
        operatorUsers(limit: 1) {
          id
          email
        }
      }
    `,
    previewFields: ['operatorUsers'],
  },
];
