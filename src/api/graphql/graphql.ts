/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /**
   * Implement the DateTime<Utc> scalar
   *
   * The input/output is a string in RFC3339 format.
   */
  DateTime: { input: any; output: any; }
  /** A scalar that can represent any JSON value. */
  JSON: { input: any; output: any; }
  /**
   * ISO 8601 calendar date without timezone.
   * Format: %Y-%m-%d
   *
   * # Examples
   *
   * * `1994-11-13`
   * * `2000-02-24`
   */
  NaiveDate: { input: any; output: any; }
  /**
   * ISO 8601 time without timezone.
   * Allows for the nanosecond precision and optional leap second representation.
   * Format: %H:%M:%S%.f
   *
   * # Examples
   *
   * * `08:59:60.123`
   */
  NaiveTime: { input: any; output: any; }
  /**
   * The `_Any` scalar is used to pass representations of entities from external
   * services into the root `_entities` field for execution.
   */
  _Any: { input: any; output: any; }
};

/**
 * Log a **completed** check-in and check-out for a **past or today** `workDate` when both
 * live punches were missed. Same calendar day only: check-in time must be before check-out.
 */
export type AddManualAttendanceSegmentInput = {
  checkInTime: Scalars['NaiveTime']['input'];
  checkOutTime: Scalars['NaiveTime']['input'];
  workDate: Scalars['NaiveDate']['input'];
};

export type AdjustLeaveBalanceEntitlementInput = {
  /**
   * When true, adds `entitled_delta` to **balance_days** as well as **entitled_days** (simple grant).
   * When false, recomputes **balance_days** from entitled / carried / used / pending.
   */
  alsoCreditBalance: Scalars['Boolean']['input'];
  employeeId: Scalars['ID']['input'];
  entitledDelta: Scalars['String']['input'];
  leaveTypeId: Scalars['ID']['input'];
  year: Scalars['Int']['input'];
};

export type Announcement = {
  __typename?: 'Announcement';
  body?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<Scalars['ID']['output']>;
  /** Authenticated document bytes for client-side Blob download. No storage or signed URL is exposed. */
  documentAttachment?: Maybe<AnnouncementAttachment>;
  documentFileStorageId?: Maybe<Scalars['ID']['output']>;
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  /** Authenticated image bytes for inline preview. No storage or signed URL is exposed. */
  imageAttachment?: Maybe<AnnouncementAttachment>;
  imageFileStorageId?: Maybe<Scalars['ID']['output']>;
  postSource: Scalars['String']['output'];
  publishAt?: Maybe<Scalars['DateTime']['output']>;
  targetAudience?: Maybe<Scalars['String']['output']>;
  targetDepartmentId?: Maybe<Scalars['ID']['output']>;
  targetLocationId?: Maybe<Scalars['ID']['output']>;
  tenantId: Scalars['ID']['output'];
  title: Scalars['String']['output'];
};

export type AnnouncementAttachment = {
  __typename?: 'AnnouncementAttachment';
  contentBase64: Scalars['String']['output'];
  fileName: Scalars['String']['output'];
  fileSizeBytes?: Maybe<Scalars['Int']['output']>;
  mimeType: Scalars['String']['output'];
};

export type Application = {
  __typename?: 'Application';
  appliedAt: Scalars['DateTime']['output'];
  candidateEmail: Scalars['String']['output'];
  candidateName: Scalars['String']['output'];
  candidatePhone?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  jobId: Scalars['ID']['output'];
  source?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
};

export type Asset = {
  __typename?: 'Asset';
  assetCategoryId: Scalars['ID']['output'];
  assetTag?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  purchaseDate?: Maybe<Scalars['NaiveDate']['output']>;
  purchaseValue?: Maybe<Scalars['String']['output']>;
  serialNumber?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
};

export type AssetAssignment = {
  __typename?: 'AssetAssignment';
  allocatedOn: Scalars['NaiveDate']['output'];
  assetId: Scalars['ID']['output'];
  assetName: Scalars['String']['output'];
  assetTag?: Maybe<Scalars['String']['output']>;
  conditionAtAllocation?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  employeeId: Scalars['ID']['output'];
  expectedReturnOn?: Maybe<Scalars['NaiveDate']['output']>;
  id: Scalars['ID']['output'];
  purchaseValue?: Maybe<Scalars['String']['output']>;
  serialNumber?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type AssetCategory = {
  __typename?: 'AssetCategory';
  code?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type AssignAssetInput = {
  allocatedOn: Scalars['NaiveDate']['input'];
  assetId: Scalars['ID']['input'];
  conditionAtAllocation?: InputMaybe<Scalars['String']['input']>;
  employeeId: Scalars['ID']['input'];
  expectedReturnOn?: InputMaybe<Scalars['NaiveDate']['input']>;
};

export type AssignEmployeeSalaryStructureInput = {
  annualCtc: Scalars['String']['input'];
  effectiveFrom: Scalars['NaiveDate']['input'];
  effectiveTo?: InputMaybe<Scalars['NaiveDate']['input']>;
  employeeId: Scalars['ID']['input'];
  overrides: Array<EmployeeSalaryComponentOverrideInput>;
  salaryStructureId: Scalars['ID']['input'];
};

export type Attendance = {
  __typename?: 'Attendance';
  /** WGS84 latitude for punch-in, when recorded (string decimal, matches DB `NUMERIC`). */
  checkInLat?: Maybe<Scalars['String']['output']>;
  checkInLng?: Maybe<Scalars['String']['output']>;
  checkInTime?: Maybe<Scalars['NaiveTime']['output']>;
  /** WGS84 coordinates for punch-out, when recorded. */
  checkOutLat?: Maybe<Scalars['String']['output']>;
  checkOutLng?: Maybe<Scalars['String']['output']>;
  checkOutTime?: Maybe<Scalars['NaiveTime']['output']>;
  employeeId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  lateMinutes?: Maybe<Scalars['Int']['output']>;
  shiftId?: Maybe<Scalars['ID']['output']>;
  source?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['ID']['output'];
  workDate: Scalars['NaiveDate']['output'];
};

export type AttendanceAdjustmentPolicy = {
  __typename?: 'AttendanceAdjustmentPolicy';
  maxSelfAdjustDays: Scalars['Int']['output'];
};

/** Tenant policy for live punch: optional geofence around a site and/or IP allowlist. */
export type AttendancePunchPolicy = {
  __typename?: 'AttendancePunchPolicy';
  /** Set after the first successful `upsertAttendancePunchPolicy`. */
  id?: Maybe<Scalars['ID']['output']>;
  /** Comma-separated IPs or CIDRs (e.g. `203.0.113.10,192.168.0.0/24`). */
  ipAllowlist?: Maybe<Scalars['String']['output']>;
  isEnforced: Scalars['Boolean']['output'];
  maxDistanceMeters?: Maybe<Scalars['Int']['output']>;
  siteLatitude?: Maybe<Scalars['Float']['output']>;
  siteLongitude?: Maybe<Scalars['Float']['output']>;
  tenantId: Scalars['ID']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type AuditLogRow = {
  __typename?: 'AuditLogRow';
  action: Scalars['String']['output'];
  afterJson?: Maybe<Scalars['String']['output']>;
  beforeJson?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  entityId?: Maybe<Scalars['ID']['output']>;
  entityType: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  ipAddress?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['ID']['output']>;
};

export type BenefitEnrollment = {
  __typename?: 'BenefitEnrollment';
  benefitPlanId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  effectiveFrom: Scalars['NaiveDate']['output'];
  effectiveTo?: Maybe<Scalars['NaiveDate']['output']>;
  employeeContributionAmount?: Maybe<Scalars['String']['output']>;
  employeeId: Scalars['ID']['output'];
  employerContributionAmount?: Maybe<Scalars['String']['output']>;
  enrolledOn?: Maybe<Scalars['NaiveDate']['output']>;
  id: Scalars['ID']['output'];
  status: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type BenefitPlan = {
  __typename?: 'BenefitPlan';
  benefitTypeId: Scalars['ID']['output'];
  contributionType?: Maybe<Scalars['String']['output']>;
  employeeContribution?: Maybe<Scalars['String']['output']>;
  employerContribution?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isMandatory: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
};

export type BenefitType = {
  __typename?: 'BenefitType';
  category?: Maybe<Scalars['String']['output']>;
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type BillingCycle = {
  __typename?: 'BillingCycle';
  createdAt: Scalars['DateTime']['output'];
  frequency: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  periodEnd: Scalars['NaiveDate']['output'];
  periodStart: Scalars['NaiveDate']['output'];
  status: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
};

export type ClearanceChecklistItem = {
  __typename?: 'ClearanceChecklistItem';
  clearedAt?: Maybe<Scalars['DateTime']['output']>;
  clearedBy?: Maybe<Scalars['ID']['output']>;
  createdAt: Scalars['DateTime']['output'];
  department: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isCleared: Scalars['Boolean']['output'];
  separationId: Scalars['ID']['output'];
  taskName: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type CompanyDocument = {
  __typename?: 'CompanyDocument';
  category: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  fileSizeBytes?: Maybe<Scalars['Int']['output']>;
  fileStorageId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  mimeType?: Maybe<Scalars['String']['output']>;
  originalFileName?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  uploadedByUserId?: Maybe<Scalars['ID']['output']>;
  visibleToEmployees: Scalars['Boolean']['output'];
};

export type CompensationReviewCycle = {
  __typename?: 'CompensationReviewCycle';
  budgetPercentage?: Maybe<Scalars['String']['output']>;
  endDate: Scalars['NaiveDate']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  startDate: Scalars['NaiveDate']['output'];
  status: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  year: Scalars['Int']['output'];
};

export type Competency = {
  __typename?: 'Competency';
  category?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type Course = {
  __typename?: 'Course';
  category?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  deliveryMode?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  durationMinutes?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isMandatory: Scalars['Boolean']['output'];
  tenantId: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type CreateAnnouncementInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  documentContentBase64?: InputMaybe<Scalars['String']['input']>;
  documentFileName?: InputMaybe<Scalars['String']['input']>;
  documentMimeType?: InputMaybe<Scalars['String']['input']>;
  /** When true (default), marks the row as an employee bulletin (`post_source=employee_post`). */
  employeePost?: Scalars['Boolean']['input'];
  expiresAt?: InputMaybe<Scalars['DateTime']['input']>;
  /** Standard base64 (not data URL). Max ~6MB decoded. */
  imageContentBase64?: InputMaybe<Scalars['String']['input']>;
  imageFileName?: InputMaybe<Scalars['String']['input']>;
  imageMimeType?: InputMaybe<Scalars['String']['input']>;
  publishAt?: InputMaybe<Scalars['DateTime']['input']>;
  targetAudience?: InputMaybe<Scalars['String']['input']>;
  /** Broadcast to one department (`employee.department_id` must match). HR / comms only unless left empty. */
  targetDepartmentId?: InputMaybe<Scalars['ID']['input']>;
  targetLocationId?: InputMaybe<Scalars['ID']['input']>;
  /** When set with `employee_post=false`, stored as `target_audience` `ROLE:<code>` (e.g. `HR_ADMIN`). */
  targetRoleCode?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type CreateCompanyDocumentInput = {
  category: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  fileStorageId: Scalars['ID']['input'];
  title: Scalars['String']['input'];
  visibleToEmployees?: Scalars['Boolean']['input'];
};

export type CreateDirectNotificationsInput = {
  actionUrl?: InputMaybe<Scalars['String']['input']>;
  kind?: InputMaybe<Scalars['String']['input']>;
  message?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  userIds: Array<Scalars['ID']['input']>;
};

export type CreateEmployeeInput = {
  dateOfJoining: Scalars['NaiveDate']['input'];
  departmentId?: InputMaybe<Scalars['ID']['input']>;
  designationId?: InputMaybe<Scalars['ID']['input']>;
  employeeCode: Scalars['String']['input'];
  employmentType?: InputMaybe<Scalars['String']['input']>;
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  loginAccount?: InputMaybe<EmployeeLoginAccountInput>;
  /** Must be another active employee in the tenant; cannot be self (enforced after id is chosen). */
  reportingManagerId?: InputMaybe<Scalars['ID']['input']>;
  /** Defaults to `ACTIVE` when omitted. */
  status?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};

export type CreateInvoiceInput = {
  /** When omitted, uses or creates the current calendar month cycle for the tenant. */
  billingCycleId?: InputMaybe<Scalars['ID']['input']>;
  currency: Scalars['String']['input'];
  discountTotal?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  subtotal: Scalars['String']['input'];
  taxAmount?: InputMaybe<Scalars['String']['input']>;
  tenantId: Scalars['ID']['input'];
  totalAmount: Scalars['String']['input'];
};

export type CreateOperatorUserInput = {
  email: Scalars['String']['input'];
  fullName: Scalars['String']['input'];
  password: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
};

/** Create a `PENDING` arrear; paid out on the next pay run that includes the employee. */
export type CreatePayrollArrearInput = {
  /** Decimal string, e.g. "5000.00" */
  amount: Scalars['String']['input'];
  employeeId: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};

/** Create a new tenant payroll period row (`DRAFT`). One cycle per (tenant, month, year) in v1. */
export type CreatePayrollCycleInput = {
  /** Calendar month 1–12 */
  month: Scalars['Int']['input'];
  /** Display label, e.g. "April 2026 payroll" */
  name: Scalars['String']['input'];
  /** Optional pay-out date */
  paymentDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  year: Scalars['Int']['input'];
};

export type CreateTimesheetEntryInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  hoursWorked: Scalars['String']['input'];
  projectCode?: InputMaybe<Scalars['String']['input']>;
  workDate: Scalars['NaiveDate']['input'];
};

/** Create a new workflow **definition** (e.g. `LEAVE_REQUEST`, `EXPENSE`). */
export type CreateWorkflowInput = {
  /** Typically `LEAVE_REQUEST`, `EXPENSE`, etc. (must match runtime consumers). */
  entityType: Scalars['String']['input'];
  isActive?: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
};

/** Add a **step** to a workflow. `sequence_order` must be unique per workflow. */
export type CreateWorkflowStepInput = {
  approverRoleId?: InputMaybe<Scalars['ID']['input']>;
  approverType?: InputMaybe<Scalars['String']['input']>;
  canSkip?: Scalars['Boolean']['input'];
  sequenceOrder: Scalars['Int']['input'];
  slaHours?: InputMaybe<Scalars['Int']['input']>;
  stepName: Scalars['String']['input'];
  workflowId: Scalars['ID']['input'];
};

export type DashboardRow = {
  __typename?: 'DashboardRow';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isDefault: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
};

export type DashboardWidgetRow = {
  __typename?: 'DashboardWidgetRow';
  colSpan?: Maybe<Scalars['Int']['output']>;
  dashboardId: Scalars['ID']['output'];
  gridCol?: Maybe<Scalars['Int']['output']>;
  gridRow?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  reportDefinitionId?: Maybe<Scalars['ID']['output']>;
  rowSpan?: Maybe<Scalars['Int']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  widgetType?: Maybe<Scalars['String']['output']>;
};

export type Department = {
  __typename?: 'Department';
  code: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  parentDepartmentId?: Maybe<Scalars['ID']['output']>;
  tenantId: Scalars['ID']['output'];
};

export type Designation = {
  __typename?: 'Designation';
  departmentId: Scalars['ID']['output'];
  grade?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  level?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['ID']['output'];
  title: Scalars['String']['output'];
};

export type DocumentType = {
  __typename?: 'DocumentType';
  category?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  expiryAlertDays?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  isRequired: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  systemKey?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

/** Federated `Employee` type. `id` is the canonical cross-service identifier (Gap A). */
export type Employee = {
  __typename?: 'Employee';
  bloodGroup?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  currentAddress?: Maybe<Scalars['String']['output']>;
  dateOfBirth?: Maybe<Scalars['NaiveDate']['output']>;
  dateOfJoining: Scalars['NaiveDate']['output'];
  departmentId?: Maybe<Scalars['ID']['output']>;
  /** Department display name when `department_id` is set (batch-resolved for directory queries). */
  departmentName?: Maybe<Scalars['String']['output']>;
  designationId?: Maybe<Scalars['ID']['output']>;
  designationTitle?: Maybe<Scalars['String']['output']>;
  emergencyContactName?: Maybe<Scalars['String']['output']>;
  emergencyContactPhone?: Maybe<Scalars['String']['output']>;
  emergencyContactRelation?: Maybe<Scalars['String']['output']>;
  employeeCode: Scalars['String']['output'];
  employmentType?: Maybe<Scalars['String']['output']>;
  firstName: Scalars['String']['output'];
  /** Computed convenience field: `first_name` + space + `last_name`. */
  fullName: Scalars['String']['output'];
  gender?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
  /** Linked login email when `user_id` is set. */
  linkedUserEmail?: Maybe<Scalars['String']['output']>;
  /** Linked login username when `user_id` is set. This is the sign-in identifier. */
  linkedUserUsername?: Maybe<Scalars['String']['output']>;
  nationality?: Maybe<Scalars['String']['output']>;
  permanentAddress?: Maybe<Scalars['String']['output']>;
  personalPhone?: Maybe<Scalars['String']['output']>;
  reportingManagerId?: Maybe<Scalars['ID']['output']>;
  reportingManagerName?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId?: Maybe<Scalars['ID']['output']>;
};

export type EmployeeAadhaarRecord = {
  __typename?: 'EmployeeAadhaarRecord';
  id: Scalars['ID']['output'];
  isVerified: Scalars['Boolean']['output'];
  maskedAadhaar: Scalars['String']['output'];
};

export type EmployeeBankAccount = {
  __typename?: 'EmployeeBankAccount';
  accountNumberMasked: Scalars['String']['output'];
  accountType?: Maybe<Scalars['String']['output']>;
  bankName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  ifscCode: Scalars['String']['output'];
  isVerified: Scalars['Boolean']['output'];
};

/** Explicitly allow-listed employee information visible in the tenant directory. */
export type EmployeeDirectoryEntry = {
  __typename?: 'EmployeeDirectoryEntry';
  dateOfJoining: Scalars['NaiveDate']['output'];
  departmentName?: Maybe<Scalars['String']['output']>;
  designationTitle?: Maybe<Scalars['String']['output']>;
  employeeCode: Scalars['String']['output'];
  employeeId: Scalars['ID']['output'];
  employmentType?: Maybe<Scalars['String']['output']>;
  fullName: Scalars['String']['output'];
  reportingManagerId?: Maybe<Scalars['ID']['output']>;
  reportingManagerName?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
};

export type EmployeeDirectoryPage = {
  __typename?: 'EmployeeDirectoryPage';
  hasMore: Scalars['Boolean']['output'];
  nextCursor?: Maybe<Scalars['String']['output']>;
  rows: Array<EmployeeDirectoryEntry>;
};

export type EmployeeDocument = {
  __typename?: 'EmployeeDocument';
  createdAt: Scalars['DateTime']['output'];
  documentTypeCategory?: Maybe<Scalars['String']['output']>;
  documentTypeId: Scalars['ID']['output'];
  documentTypeName?: Maybe<Scalars['String']['output']>;
  employeeId: Scalars['ID']['output'];
  expiryDate?: Maybe<Scalars['NaiveDate']['output']>;
  id: Scalars['ID']['output'];
  mimeType?: Maybe<Scalars['String']['output']>;
  originalFileName?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
  uploadedAt: Scalars['DateTime']['output'];
  uploadedByUserId?: Maybe<Scalars['ID']['output']>;
};

export type EmployeeDocumentAttachment = {
  __typename?: 'EmployeeDocumentAttachment';
  /** Standard base64 payload returned only after employee/data-scope authorization. */
  contentBase64: Scalars['String']['output'];
  fileName: Scalars['String']['output'];
  fileSizeBytes?: Maybe<Scalars['Int']['output']>;
  mimeType: Scalars['String']['output'];
};

export type EmployeeEducation = {
  __typename?: 'EmployeeEducation';
  boardUniversity?: Maybe<Scalars['String']['output']>;
  completionYear: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  educationLevel: Scalars['String']['output'];
  employeeId: Scalars['ID']['output'];
  evidenceDocumentIds: Array<Scalars['ID']['output']>;
  fieldOfStudy?: Maybe<Scalars['String']['output']>;
  gradeScore?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  institution: Scalars['String']['output'];
  qualification: Scalars['String']['output'];
  rejectionReason?: Maybe<Scalars['String']['output']>;
  reviewedAt?: Maybe<Scalars['DateTime']['output']>;
  reviewedBy?: Maybe<Scalars['ID']['output']>;
  startDate?: Maybe<Scalars['NaiveDate']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  verificationStatus: Scalars['String']['output'];
};

export type EmployeeEvidenceReviewQueueItem = {
  __typename?: 'EmployeeEvidenceReviewQueueItem';
  createdAt: Scalars['DateTime']['output'];
  employeeCode: Scalars['String']['output'];
  employeeId: Scalars['ID']['output'];
  employeeName: Scalars['String']['output'];
  evidenceDocumentIds: Array<Scalars['ID']['output']>;
  evidenceType: Scalars['String']['output'];
  recordId: Scalars['ID']['output'];
  summary: Scalars['String']['output'];
};

export type EmployeeIdentityProfile = {
  __typename?: 'EmployeeIdentityProfile';
  aadhaar?: Maybe<EmployeeAadhaarRecord>;
  pan?: Maybe<EmployeePanRecord>;
};

export type EmployeeLoginAccountInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  initialPassword: Scalars['String']['input'];
  roleIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  username: Scalars['String']['input'];
};

export type EmployeePanRecord = {
  __typename?: 'EmployeePanRecord';
  id: Scalars['ID']['output'];
  isVerified: Scalars['Boolean']['output'];
  maskedPan: Scalars['String']['output'];
};

export type EmployeeProfileAccess = {
  __typename?: 'EmployeeProfileAccess';
  canEditPersonalProfile: Scalars['Boolean']['output'];
  canManageOrganizationFields: Scalars['Boolean']['output'];
  canReviewProfileChanges: Scalars['Boolean']['output'];
  canViewPrivateProfile: Scalars['Boolean']['output'];
  directoryEntry: EmployeeDirectoryEntry;
  isSelf: Scalars['Boolean']['output'];
};

export type EmployeeProfileChangeRequest = {
  __typename?: 'EmployeeProfileChangeRequest';
  createdAt: Scalars['DateTime']['output'];
  employeeId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  rejectionReason?: Maybe<Scalars['String']['output']>;
  requestType: Scalars['String']['output'];
  requestedSummary: Scalars['String']['output'];
  reviewedAt?: Maybe<Scalars['DateTime']['output']>;
  reviewedBy?: Maybe<Scalars['ID']['output']>;
  status: Scalars['String']['output'];
  supportingDocumentId?: Maybe<Scalars['ID']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type EmployeeProfileChangeReviewDetail = {
  __typename?: 'EmployeeProfileChangeReviewDetail';
  currentValues: Scalars['JSON']['output'];
  employeeCode: Scalars['String']['output'];
  employeeName: Scalars['String']['output'];
  request: EmployeeProfileChangeRequest;
  requestedValues: Scalars['JSON']['output'];
};

export type EmployeeProfileReviewQueueItem = {
  __typename?: 'EmployeeProfileReviewQueueItem';
  employeeCode: Scalars['String']['output'];
  employeeName: Scalars['String']['output'];
  hasSupportingDocument: Scalars['Boolean']['output'];
  request: EmployeeProfileChangeRequest;
};

export type EmployeeSalaryComponentOverrideInput = {
  calculationBasis: Scalars['String']['input'];
  calculationValue: Scalars['String']['input'];
  isActive: Scalars['Boolean']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  salaryComponentId: Scalars['ID']['input'];
};

export type EmployeeSalaryStructure = {
  __typename?: 'EmployeeSalaryStructure';
  createdAt: Scalars['DateTime']['output'];
  ctc: Scalars['String']['output'];
  effectiveFrom: Scalars['NaiveDate']['output'];
  effectiveTo?: Maybe<Scalars['NaiveDate']['output']>;
  employeeId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  salaryStructureId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type EmployeeWorkExperience = {
  __typename?: 'EmployeeWorkExperience';
  company: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  employeeId: Scalars['ID']['output'];
  employmentType?: Maybe<Scalars['String']['output']>;
  endDate?: Maybe<Scalars['NaiveDate']['output']>;
  evidenceDocumentIds: Array<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  isCurrent: Scalars['Boolean']['output'];
  location?: Maybe<Scalars['String']['output']>;
  rejectionReason?: Maybe<Scalars['String']['output']>;
  reviewedAt?: Maybe<Scalars['DateTime']['output']>;
  reviewedBy?: Maybe<Scalars['ID']['output']>;
  roleTitle: Scalars['String']['output'];
  startDate: Scalars['NaiveDate']['output'];
  updatedAt: Scalars['DateTime']['output'];
  verificationStatus: Scalars['String']['output'];
};

export type EmploymentHistoryRecord = {
  __typename?: 'EmploymentHistoryRecord';
  changeReason?: Maybe<Scalars['String']['output']>;
  changedBy?: Maybe<Scalars['ID']['output']>;
  createdAt: Scalars['DateTime']['output'];
  effectiveFrom: Scalars['NaiveDate']['output'];
  effectiveTo?: Maybe<Scalars['NaiveDate']['output']>;
  employeeId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  /** Monthly amount used as base gross for pay run (maps to `employment_history.salary`). */
  monthlySalary?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type Expense = {
  __typename?: 'Expense';
  amount: Scalars['String']['output'];
  approvedAmount?: Maybe<Scalars['String']['output']>;
  currency: Scalars['String']['output'];
  employeeId: Scalars['ID']['output'];
  expenseCategoryId: Scalars['ID']['output'];
  expenseDate: Scalars['NaiveDate']['output'];
  id: Scalars['ID']['output'];
  paidAt?: Maybe<Scalars['DateTime']['output']>;
  paymentReference?: Maybe<Scalars['String']['output']>;
  paymentStatus: Scalars['String']['output'];
  /** Configured workflow step title when status is PENDING and a multi-step workflow is waiting (from `workflow_step.step_name`). */
  pendingApprovalStage?: Maybe<Scalars['String']['output']>;
  receiptFileStorageId?: Maybe<Scalars['ID']['output']>;
  status: Scalars['String']['output'];
  submittedAt: Scalars['DateTime']['output'];
  tenantId: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  /** When set, this claim is part of a travel trip. */
  travelRequestId?: Maybe<Scalars['ID']['output']>;
  /** True when the signed-in user may approve or reject this claim at the current workflow step (or legacy permission when no workflow). */
  viewerMayApprove: Scalars['Boolean']['output'];
  /** Set when **`EXPENSE`** workflow is active with ≥1 step (**M32**). */
  workflowInstanceId?: Maybe<Scalars['ID']['output']>;
};

export type ExpenseCategory = {
  __typename?: 'ExpenseCategory';
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  maxAmountPerClaim?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type ExpensePolicy = {
  __typename?: 'ExpensePolicy';
  applicableTo: Scalars['String']['output'];
  approvalRequired: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  departmentId?: Maybe<Scalars['ID']['output']>;
  designationId?: Maybe<Scalars['ID']['output']>;
  expenseCategoryId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  limitPerDay?: Maybe<Scalars['String']['output']>;
  limitPerMonth?: Maybe<Scalars['String']['output']>;
  maxAmountPerClaim?: Maybe<Scalars['String']['output']>;
  receiptRequired: Scalars['Boolean']['output'];
  roleId?: Maybe<Scalars['ID']['output']>;
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type ExpenseSubmissionHints = {
  __typename?: 'ExpenseSubmissionHints';
  expenseCategoryId: Scalars['ID']['output'];
  /** Policy per-day ceiling for the matched tier (may also tighten max per claim). */
  limitPerDay?: Maybe<Scalars['String']['output']>;
  limitPerMonth?: Maybe<Scalars['String']['output']>;
  maxAmountPerClaim?: Maybe<Scalars['String']['output']>;
  receiptRequired: Scalars['Boolean']['output'];
};

export type FeatureFlag = {
  __typename?: 'FeatureFlag';
  createdAt: Scalars['DateTime']['output'];
  featureName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isEnabled: Scalars['Boolean']['output'];
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type FnfSettlement = {
  __typename?: 'FnfSettlement';
  bonusPayable?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  gratuityAmount?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  leaveEncashment?: Maybe<Scalars['String']['output']>;
  netPayable?: Maybe<Scalars['String']['output']>;
  processedAt?: Maybe<Scalars['DateTime']['output']>;
  processedBy?: Maybe<Scalars['ID']['output']>;
  recoveryAmount?: Maybe<Scalars['String']['output']>;
  separationId: Scalars['ID']['output'];
  status: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type Goal = {
  __typename?: 'Goal';
  description?: Maybe<Scalars['String']['output']>;
  employeeId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  reviewCycleId: Scalars['ID']['output'];
  status: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  weightage?: Maybe<Scalars['String']['output']>;
};

export type GrievanceCase = {
  __typename?: 'GrievanceCase';
  confidentialityLevel?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  employeeId: Scalars['ID']['output'];
  filedAt: Scalars['DateTime']['output'];
  grievanceCategoryId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  priority?: Maybe<Scalars['String']['output']>;
  resolvedAt?: Maybe<Scalars['DateTime']['output']>;
  status: Scalars['String']['output'];
  subject: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
};

export type GrievanceCategory = {
  __typename?: 'GrievanceCategory';
  code: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isPosh: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  resolutionSlaDays?: Maybe<Scalars['Int']['output']>;
  tenantId: Scalars['ID']['output'];
};

export type HolidayCalendar = {
  __typename?: 'HolidayCalendar';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  locationId?: Maybe<Scalars['ID']['output']>;
  name: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
  year: Scalars['Int']['output'];
};

export type HolidayDay = {
  __typename?: 'HolidayDay';
  calendarId: Scalars['ID']['output'];
  holidayDate: Scalars['NaiveDate']['output'];
  holidayType?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

/** A holiday in a location calendar, with the parent calendar’s display name. */
export type HolidayEntry = {
  __typename?: 'HolidayEntry';
  calendarId: Scalars['ID']['output'];
  calendarName: Scalars['String']['output'];
  holidayDate: Scalars['NaiveDate']['output'];
  /** Optional category, e.g. NATIONAL, REGIONAL */
  holidayType?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type IntegrationConnectorCatalogRow = {
  __typename?: 'IntegrationConnectorCatalogRow';
  authType?: Maybe<Scalars['String']['output']>;
  category?: Maybe<Scalars['String']['output']>;
  code: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
};

export type Invoice = {
  __typename?: 'Invoice';
  billingCycleId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  discountTotal: Scalars['String']['output'];
  dueDate?: Maybe<Scalars['NaiveDate']['output']>;
  id: Scalars['ID']['output'];
  invoiceNumber: Scalars['String']['output'];
  paidAt?: Maybe<Scalars['DateTime']['output']>;
  sentAt?: Maybe<Scalars['DateTime']['output']>;
  status: Scalars['String']['output'];
  subtotal: Scalars['String']['output'];
  taxAmount: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  totalAmount: Scalars['String']['output'];
};

export type JobPosting = {
  __typename?: 'JobPosting';
  closeDate?: Maybe<Scalars['NaiveDate']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  employmentType?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  openDate?: Maybe<Scalars['NaiveDate']['output']>;
  status: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  vacancies: Scalars['Int']['output'];
};

export type LeaveBalance = {
  __typename?: 'LeaveBalance';
  balanceDays: Scalars['String']['output'];
  carriedForwardDays: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  employeeId: Scalars['ID']['output'];
  entitledDays: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  leaveTypeId: Scalars['ID']['output'];
  pendingDays: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
  usedDays: Scalars['String']['output'];
  year: Scalars['Int']['output'];
};

export type LeavePolicy = {
  __typename?: 'LeavePolicy';
  accrualDays?: Maybe<Scalars['String']['output']>;
  accrualFrequency?: Maybe<Scalars['String']['output']>;
  annualEntitlement?: Maybe<Scalars['Int']['output']>;
  applicableTo?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  leaveTypeId: Scalars['ID']['output'];
  maxConsecutiveDays?: Maybe<Scalars['Int']['output']>;
  minNoticeDays?: Maybe<Scalars['Int']['output']>;
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type LeaveRequest = {
  __typename?: 'LeaveRequest';
  appliedAt: Scalars['DateTime']['output'];
  /** Days requested, serialised as a decimal string for lossless transport. */
  daysRequested: Scalars['String']['output'];
  employeeCode?: Maybe<Scalars['String']['output']>;
  employeeId: Scalars['ID']['output'];
  employeeName?: Maybe<Scalars['String']['output']>;
  fromDate: Scalars['NaiveDate']['output'];
  halfDaySession?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isHalfDay: Scalars['Boolean']['output'];
  leaveTypeId: Scalars['ID']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  rejectionReason?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  /** Link or reference ID when the leave type requires documentation. */
  supportingDocumentReference?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['ID']['output'];
  toDate: Scalars['NaiveDate']['output'];
  /** Set when tenant has an active **LEAVE_REQUEST** workflow with at least one step (M8). */
  workflowInstanceId?: Maybe<Scalars['ID']['output']>;
};

export type LeaveType = {
  __typename?: 'LeaveType';
  carryForward: Scalars['Boolean']['output'];
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  halfDayAllowed: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  isPaid: Scalars['Boolean']['output'];
  maxCarryForwardDays?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  requiresDocument: Scalars['Boolean']['output'];
  sandwichRule: Scalars['Boolean']['output'];
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type LeaveWorkflowAction = {
  __typename?: 'LeaveWorkflowAction';
  actedAt: Scalars['DateTime']['output'];
  action: Scalars['String']['output'];
  performedByUserId?: Maybe<Scalars['ID']['output']>;
  remarks?: Maybe<Scalars['String']['output']>;
  workflowStepName: Scalars['String']['output'];
};

export type Module = {
  __typename?: 'Module';
  category?: Maybe<Scalars['String']['output']>;
  code: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  displayOrder: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isCore: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /**
   * Add a full **in + out** segment for a `workDate` (no future dates) when the user did not
   * punch live — does not modify `punch_today` behaviour.
   */
  addManualAttendanceSegment: Attendance;
  adjustLeaveBalanceEntitlement: LeaveBalance;
  approveExpense: Expense;
  /** Set a PENDING request to APPROVED and credit used leave (see `submit_leave_request` balance flow). */
  approveLeaveRequest: LeaveRequest;
  /** Approve a pending separation (HR / directory roles — same gate as `createEmployee`). */
  approveSeparation: Separation;
  approveTaxProofLine: TaxProofLine;
  approveTimesheetWeekBatch: TimesheetWeekBatch;
  approveTravelRequest: TravelRequest;
  archiveCompanyDocument: CompanyDocument;
  assignAssetToEmployee: AssetAssignment;
  assignEmployeeSalaryStructure: EmployeeSalaryStructure;
  cancelEmployeeProfileChange: EmployeeProfileChangeRequest;
  /** Withdraw own **PENDING** leave request (releases balance hold; cancels workflow when present). */
  cancelLeaveRequest: LeaveRequest;
  /** Connect (or reconnect) an integration connector for this tenant (**HR / directory admins**). */
  connectTenantIntegration: TenantIntegrationRow;
  /** Public bulletin visible to all authenticated users in the tenant (company news or employee post). */
  createAnnouncement: Announcement;
  createCompanyDocument: CompanyDocument;
  createDirectNotifications: Scalars['Int']['output'];
  createEmployee: Employee;
  createInvoice: Invoice;
  createOperatorUser: OperatorUser;
  /** Record a **PENDING** arrear for an employee; amount is added on the next pay run (with an `ARREAR` line). */
  createPayrollArrear: PayrollArrear;
  /**
   * Create a **DRAFT** payroll cycle for a calendar month/year (one per tenant per period in v1).
   * Same RBAC as **run payroll** (statutory export / HR / tenant admin).
   */
  createPayrollCycle: PayrollCycle;
  createTimesheetEntry: TimesheetEntry;
  /** Create a workflow **definition** row. Requires `workflow:manage` or HR / tenant admin role. */
  createWorkflow: Workflow;
  /** Add a **step** to an existing workflow. Requires `workflow:manage` or HR / tenant admin role. */
  createWorkflowStep: WorkflowStep;
  deleteAnnouncement: Scalars['Boolean']['output'];
  deleteCompanyDocument: Scalars['Boolean']['output'];
  deleteEmployeeEducation: Scalars['Boolean']['output'];
  deleteEmployeeWorkExperience: Scalars['Boolean']['output'];
  /** Soft-delete an **`expense_category`** (**`expense:manage`** required). */
  deleteExpenseCategoryAdmin: Scalars['Boolean']['output'];
  deleteExpensePolicyAdmin: Scalars['Boolean']['output'];
  deleteHolidayCalendar: Scalars['Boolean']['output'];
  deleteHolidayDay: Scalars['Boolean']['output'];
  deleteLeavePolicy: Scalars['Boolean']['output'];
  deleteLeaveType: LeaveType;
  deleteNotificationAdmin: Scalars['Boolean']['output'];
  /** Soft-deletes a row; it must belong to the caller’s employee. */
  deleteTimesheetEntry: Scalars['Boolean']['output'];
  /** Delete a **workflow step** definition. Blocked if any **`workflow_action`** references this step. */
  deleteWorkflowStep: Scalars['Boolean']['output'];
  /** Enroll the signed-in employee in an **active** benefit plan (`CONFLICT` if already enrolled). */
  enrollInBenefitPlan: BenefitEnrollment;
  /** HR: create DRAFT FNF + default clearance for an `APPROVED` separation (e.g. legacy row before auto-seed). */
  ensureSeparationOffboardingArtifacts: Scalars['Boolean']['output'];
  /** HR: mark FNF as PROCESSED (no further amount edits). */
  finalizeFnfSettlement: FnfSettlement;
  linkEmployeeEducationEvidence: EmployeeEducation;
  linkEmployeeWorkExperienceEvidence: EmployeeWorkExperience;
  /** Mark every unread notification for this user as read. Returns how many rows were updated. */
  markAllNotificationsRead: Scalars['Int']['output'];
  /** Update reimbursement bookkeeping after financial approval (**`expense:pay`** or elevated approvers). */
  markExpensePaymentStatus: Expense;
  /** Mark one in-app notification as read (must belong to the caller’s `user` id in the JWT). */
  markNotificationRead: Notification;
  provisionEmployeeLogin: Employee;
  /**
   * Upsert **leave_balance** rows for **all** active employees from published leave policies
   * (annual entitlement, or MONTHLY accrual × 12). Returns how many employee/type/year rows were written.
   */
  provisionLeaveBalancesFromPolicies: Scalars['Int']['output'];
  provisionTenant: ProvisionTenantPayload;
  /**
   * Record a punch: closes the **open** segment (punch in without out) if any, otherwise
   * starts a **new** segment (new `attendance` row). Multiple in/out pairs per `work_date`
   * are allowed; there is no “third punch” error.
   *
   * When `input` includes **both** `latitude` and `longitude` (WGS84), they are stored on
   * `attendance` as punch-in coordinates for a new row, or punch-out coordinates when closing
   * an open segment (`check_out_lat` / `check_out_lng` columns).
   */
  punchToday: Attendance;
  recordPayment: Payment;
  /** Register a webhook subscription (**HR / directory admins**). */
  registerWebhookSubscription: WebhookSubscriptionRow;
  rejectExpense: Expense;
  /** Reject a PENDING request and release the balance reservation. */
  rejectLeaveRequest: LeaveRequest;
  /** Reject a pending separation (HR / directory roles). */
  rejectSeparation: Separation;
  rejectTaxProofLine: TaxProofLine;
  rejectTimesheetWeekBatch: Scalars['Boolean']['output'];
  rejectTravelRequest: TravelRequest;
  removeTenantSubscription: Scalars['Boolean']['output'];
  /** Re-assign **`sequenceOrder`** across all steps for **`workflow_id`**. **`step_ids_ordered`** must list each step exactly once (same set as persisted). */
  reorderWorkflowSteps: Array<WorkflowStep>;
  /** Send a **FAILED** or **PROCESSING** outbox row back to **PENDING** (same RBAC as `outboxEvents`). */
  requeueOutboxEvent: OutboxEventRow;
  resetEmployeePassword: Scalars['Boolean']['output'];
  /** HR: approve or reject a **`PENDING`** employee document. */
  resolveEmployeeDocument: EmployeeDocument;
  resolveEmployeeEducation: EmployeeEducation;
  resolveEmployeeProfileChange: EmployeeProfileChangeRequest;
  resolveEmployeeWorkExperience: EmployeeWorkExperience;
  returnEmployeeAsset: AssetAssignment;
  /**
   * **Pay run (v2)** — generate missing payslips for a `DRAFT` cycle, then set the cycle to
   * `PROCESSED`. Per employee: latest `employment_history.salary` as BASIC, PENDING
   * `payroll_arrear` as an `ARREAR` `salary_component` line, India statutory stub and TDS from
   * `tax_computation` for the pay month’s India FY. Same RBAC as India statutory CSV export.
   */
  runPayrollForCycle: PayrollCycle;
  runTenantMigrations: ProvisionTenantPayload;
  /** HR: toggle a department clearance line. */
  setClearanceItemCleared: ClearanceChecklistItem;
  /** HR: set or update monthly salary for an employee (`employment_history`), effective from a date. */
  setEmployeeCompensation: EmploymentHistoryRecord;
  /** Replace per-employee allowed project codes (empty list clears restrictions — full catalog allowed). */
  setEmployeeTimesheetProjects: Scalars['Boolean']['output'];
  setModuleActive: Module;
  /**
   * Mark an onboarding checklist row complete or incomplete. Employees may update **their own**
   * tasks; HR / directory roles may update tasks for employees in their data scope.
   */
  setOnboardingChecklistItemCompleted: OnboardingChecklistItem;
  /** Replace role assignments for an operator user (`role_ids` may be empty to clear all). */
  setOperatorUserRoles: Scalars['Boolean']['output'];
  /** Replace `permission_scope` rows for a role (list-filter scopes). */
  setRolePermissionScopes: Scalars['Boolean']['output'];
  /** Replace `role_permission` rows for a role (full matrix row). */
  setRolePermissions: Scalars['Boolean']['output'];
  /** Replace `user_role` rows for a user. Caller must re-login to refresh JWT claims. */
  setUserRoles: Scalars['Boolean']['output'];
  setWebhookSubscriptionActive: WebhookSubscriptionRow;
  submitEmployeeProfileChange: EmployeeProfileChangeRequest;
  /** Create a PENDING expense claim for the signed-in user’s employee record. */
  submitExpense: Expense;
  /** File a grievance case for the signed-in employee. */
  submitGrievanceCase: GrievanceCase;
  /** Create a PENDING leave request and reserve days against the annual balance. */
  submitLeaveRequest: LeaveRequest;
  /** File a separation / exit request (self-service, or HR on behalf of another employee). */
  submitSeparation: Separation;
  /**
   * Submit or update a deduction **proof** line (declared vs actual). Resets status to **PENDING**
   * until an approver accepts it. Only **APPROVED** lines sum into `tax_computation.totalDeductions`.
   */
  submitTaxProofLine: TaxProofLine;
  submitTimesheetWeek: TimesheetWeekBatch;
  /** Create a **PENDING** travel request for the signed-in employee. */
  submitTravelRequest: TravelRequest;
  updateAnnouncement: Announcement;
  updateEmployee: Employee;
  /** Demographics + emergency contact. Employee may edit **self**; HR may edit anyone in scope. */
  updateEmployeePersonalProfile: Employee;
  /** Direct self-service fields that do not change legal identity or organization assignment. */
  updateEmployeeSelfServiceProfile: Employee;
  /** Update an existing manual attendance segment with server-side overlap and daily-cap checks. */
  updateManualAttendanceSegment: Attendance;
  updateNotificationAdmin: Notification;
  updateNotificationPreferences: NotificationPreferences;
  updateTenant: Tenant;
  updateTimesheetEntry: TimesheetEntry;
  /**
   * Upload a file to local `KABIPAY_LOCAL_FILE_ROOT` or object storage and attach `employee_document`.
   * **Directory/HR** uploads are **`APPROVED`** immediately; others start **`PENDING`** for HR review.
   */
  uploadEmployeeDocument: EmployeeDocument;
  uploadEmployeeEducationEvidence: EmployeeEducation;
  uploadEmployeeWorkExperienceEvidence: EmployeeWorkExperience;
  /** Upload a tenant-scoped file and return its reusable `file_storage.id`. */
  uploadTenantFile: UploadedTenantFile;
  upsertAttendanceAdjustmentPolicy: AttendanceAdjustmentPolicy;
  /** Create or update the tenant’s live punch policy (geofence + IP allowlist). */
  upsertAttendancePunchPolicy: AttendancePunchPolicy;
  upsertEmployeeEducation: EmployeeEducation;
  /** Upsert primary Aadhaar last‑4 (self or **`employee:write`**). Clears verification. */
  upsertEmployeePrimaryAadhaar: EmployeeAadhaarRecord;
  /** Upsert the primary bank row (self or **`employee:write`**). */
  upsertEmployeePrimaryBank: EmployeeBankAccount;
  /** Upsert primary PAN (self or **`employee:write`**). Clears verification until HR re-verifies. */
  upsertEmployeePrimaryPan: EmployeePanRecord;
  upsertEmployeeWorkExperience: EmployeeWorkExperience;
  /** Create or update an **`expense_category`** row (**`expense:manage`** required). */
  upsertExpenseCategoryAdmin: ExpenseCategory;
  upsertExpensePolicyAdmin: ExpensePolicy;
  upsertFeatureFlag: FeatureFlag;
  /** HR: fill FNF component amounts (while status is DRAFT). Net payable is recalculated. */
  upsertFnfSettlement: FnfSettlement;
  upsertHolidayCalendar: HolidayCalendar;
  upsertHolidayDay: HolidayDay;
  upsertLeaveBalance: LeaveBalance;
  upsertLeavePolicy: LeavePolicy;
  upsertLeaveType: LeaveType;
  /** Upsert tenant employer TAN and legal name for India statutory payroll CSV placeholders. */
  upsertPayrollComplianceSetting: PayrollComplianceSetting;
  upsertSalaryComponent: SalaryComponent;
  upsertSalaryStructure: SalaryStructure;
  /**
   * Create or update the `tax_computation` row for this employee, config version, and year.
   *
   * **Note:** `totalDeductions` may be **overwritten** when tax proof lines are approved
   * (see `submitTaxProofLine` / `approveTaxProofLine`); use `taxProofLines` + approved
   * workflow for year-end truth.
   */
  upsertTaxComputation: TaxComputation;
  /** Upsert **`tax_configuration_version`** — old/new regime rows per FY (HR tax admin). */
  upsertTaxConfigurationVersion: TaxConfigurationVersion;
  /**
   * Upsert a tenant tax deduction section definition (**`tax_proof_line.section_code`** catalogue).
   * Same permission as approving proofs — HR tax admin.
   */
  upsertTaxSectionDefinition: TaxSectionDefinition;
  /** Upsert **`tax_slab`** for a configuration version (HR tax admin). */
  upsertTaxSlab: TaxSlab;
  upsertTenantSubscription: TenantSubscription;
  upsertTimesheetLockPolicy: TimesheetLockPolicy;
  upsertTimesheetProject: Scalars['Boolean']['output'];
  upsertTimesheetTaskTypes: Scalars['Boolean']['output'];
};


export type MutationAddManualAttendanceSegmentArgs = {
  input: AddManualAttendanceSegmentInput;
};


export type MutationAdjustLeaveBalanceEntitlementArgs = {
  input: AdjustLeaveBalanceEntitlementInput;
};


export type MutationApproveExpenseArgs = {
  approvedAmount?: InputMaybe<Scalars['String']['input']>;
  expenseId: Scalars['ID']['input'];
};


export type MutationApproveLeaveRequestArgs = {
  leaveRequestId: Scalars['ID']['input'];
};


export type MutationApproveSeparationArgs = {
  separationId: Scalars['ID']['input'];
};


export type MutationApproveTaxProofLineArgs = {
  taxProofLineId: Scalars['ID']['input'];
};


export type MutationApproveTimesheetWeekBatchArgs = {
  id: Scalars['ID']['input'];
};


export type MutationApproveTravelRequestArgs = {
  travelRequestId: Scalars['ID']['input'];
};


export type MutationArchiveCompanyDocumentArgs = {
  companyDocumentId: Scalars['ID']['input'];
};


export type MutationAssignAssetToEmployeeArgs = {
  input: AssignAssetInput;
};


export type MutationAssignEmployeeSalaryStructureArgs = {
  input: AssignEmployeeSalaryStructureInput;
};


export type MutationCancelEmployeeProfileChangeArgs = {
  requestId: Scalars['ID']['input'];
};


export type MutationCancelLeaveRequestArgs = {
  leaveRequestId: Scalars['ID']['input'];
};


export type MutationConnectTenantIntegrationArgs = {
  connectorId: Scalars['ID']['input'];
};


export type MutationCreateAnnouncementArgs = {
  input: CreateAnnouncementInput;
};


export type MutationCreateCompanyDocumentArgs = {
  input: CreateCompanyDocumentInput;
};


export type MutationCreateDirectNotificationsArgs = {
  input: CreateDirectNotificationsInput;
};


export type MutationCreateEmployeeArgs = {
  input: CreateEmployeeInput;
};


export type MutationCreateInvoiceArgs = {
  input: CreateInvoiceInput;
};


export type MutationCreateOperatorUserArgs = {
  input: CreateOperatorUserInput;
};


export type MutationCreatePayrollArrearArgs = {
  input: CreatePayrollArrearInput;
};


export type MutationCreatePayrollCycleArgs = {
  input: CreatePayrollCycleInput;
};


export type MutationCreateTimesheetEntryArgs = {
  input: CreateTimesheetEntryInput;
};


export type MutationCreateWorkflowArgs = {
  input: CreateWorkflowInput;
};


export type MutationCreateWorkflowStepArgs = {
  input: CreateWorkflowStepInput;
};


export type MutationDeleteAnnouncementArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteCompanyDocumentArgs = {
  companyDocumentId: Scalars['ID']['input'];
};


export type MutationDeleteEmployeeEducationArgs = {
  educationId: Scalars['ID']['input'];
  employeeId: Scalars['ID']['input'];
};


export type MutationDeleteEmployeeWorkExperienceArgs = {
  employeeId: Scalars['ID']['input'];
  workExperienceId: Scalars['ID']['input'];
};


export type MutationDeleteExpenseCategoryAdminArgs = {
  expenseCategoryId: Scalars['ID']['input'];
};


export type MutationDeleteExpensePolicyAdminArgs = {
  expensePolicyId: Scalars['ID']['input'];
};


export type MutationDeleteHolidayCalendarArgs = {
  calendarId: Scalars['ID']['input'];
};


export type MutationDeleteHolidayDayArgs = {
  holidayId: Scalars['ID']['input'];
};


export type MutationDeleteLeavePolicyArgs = {
  leavePolicyId: Scalars['ID']['input'];
};


export type MutationDeleteLeaveTypeArgs = {
  leaveTypeId: Scalars['ID']['input'];
};


export type MutationDeleteNotificationAdminArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteTimesheetEntryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteWorkflowStepArgs = {
  stepId: Scalars['ID']['input'];
};


export type MutationEnrollInBenefitPlanArgs = {
  benefitPlanId: Scalars['ID']['input'];
};


export type MutationEnsureSeparationOffboardingArtifactsArgs = {
  separationId: Scalars['ID']['input'];
};


export type MutationFinalizeFnfSettlementArgs = {
  separationId: Scalars['ID']['input'];
};


export type MutationLinkEmployeeEducationEvidenceArgs = {
  educationId: Scalars['ID']['input'];
  employeeDocumentId: Scalars['ID']['input'];
  employeeId: Scalars['ID']['input'];
};


export type MutationLinkEmployeeWorkExperienceEvidenceArgs = {
  employeeDocumentId: Scalars['ID']['input'];
  employeeId: Scalars['ID']['input'];
  workExperienceId: Scalars['ID']['input'];
};


export type MutationMarkExpensePaymentStatusArgs = {
  expenseId: Scalars['ID']['input'];
  paymentReference?: InputMaybe<Scalars['String']['input']>;
  paymentStatus: Scalars['String']['input'];
};


export type MutationMarkNotificationReadArgs = {
  id: Scalars['ID']['input'];
};


export type MutationProvisionEmployeeLoginArgs = {
  input: ProvisionEmployeeLoginInput;
};


export type MutationProvisionLeaveBalancesFromPoliciesArgs = {
  year: Scalars['Int']['input'];
};


export type MutationProvisionTenantArgs = {
  input: ProvisionTenantInput;
};


export type MutationPunchTodayArgs = {
  input?: InputMaybe<PunchTodayInput>;
};


export type MutationRecordPaymentArgs = {
  input: RecordPaymentInput;
};


export type MutationRegisterWebhookSubscriptionArgs = {
  input: RegisterWebhookInput;
};


export type MutationRejectExpenseArgs = {
  expenseId: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationRejectLeaveRequestArgs = {
  leaveRequestId: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationRejectSeparationArgs = {
  separationId: Scalars['ID']['input'];
};


export type MutationRejectTaxProofLineArgs = {
  reason?: InputMaybe<Scalars['String']['input']>;
  taxProofLineId: Scalars['ID']['input'];
};


export type MutationRejectTimesheetWeekBatchArgs = {
  id: Scalars['ID']['input'];
  rejectionReason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationRejectTravelRequestArgs = {
  reason?: InputMaybe<Scalars['String']['input']>;
  travelRequestId: Scalars['ID']['input'];
};


export type MutationRemoveTenantSubscriptionArgs = {
  subscriptionId: Scalars['ID']['input'];
};


export type MutationReorderWorkflowStepsArgs = {
  stepIdsOrdered: Array<Scalars['ID']['input']>;
  workflowId: Scalars['ID']['input'];
};


export type MutationRequeueOutboxEventArgs = {
  id: Scalars['ID']['input'];
};


export type MutationResetEmployeePasswordArgs = {
  input: ResetEmployeePasswordInput;
};


export type MutationResolveEmployeeDocumentArgs = {
  approved: Scalars['Boolean']['input'];
  employeeDocumentId: Scalars['ID']['input'];
};


export type MutationResolveEmployeeEducationArgs = {
  approved: Scalars['Boolean']['input'];
  educationId: Scalars['ID']['input'];
  rejectionReason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationResolveEmployeeProfileChangeArgs = {
  approved: Scalars['Boolean']['input'];
  rejectionReason?: InputMaybe<Scalars['String']['input']>;
  requestId: Scalars['ID']['input'];
};


export type MutationResolveEmployeeWorkExperienceArgs = {
  approved: Scalars['Boolean']['input'];
  rejectionReason?: InputMaybe<Scalars['String']['input']>;
  workExperienceId: Scalars['ID']['input'];
};


export type MutationReturnEmployeeAssetArgs = {
  input: ReturnAssetInput;
};


export type MutationRunPayrollForCycleArgs = {
  payrollCycleId: Scalars['ID']['input'];
};


export type MutationRunTenantMigrationsArgs = {
  tenantId: Scalars['ID']['input'];
};


export type MutationSetClearanceItemClearedArgs = {
  clearanceId: Scalars['ID']['input'];
  isCleared: Scalars['Boolean']['input'];
};


export type MutationSetEmployeeCompensationArgs = {
  input: SetEmployeeCompensationInput;
};


export type MutationSetEmployeeTimesheetProjectsArgs = {
  employeeId: Scalars['ID']['input'];
  projectCodes: Array<Scalars['String']['input']>;
};


export type MutationSetModuleActiveArgs = {
  isActive: Scalars['Boolean']['input'];
  moduleId: Scalars['ID']['input'];
};


export type MutationSetOnboardingChecklistItemCompletedArgs = {
  checklistItemId: Scalars['ID']['input'];
  isCompleted: Scalars['Boolean']['input'];
};


export type MutationSetOperatorUserRolesArgs = {
  operatorUserId: Scalars['ID']['input'];
  roleIds: Array<Scalars['ID']['input']>;
};


export type MutationSetRolePermissionScopesArgs = {
  roleId: Scalars['ID']['input'];
  scopes: Array<PermissionScopeAssignmentInput>;
};


export type MutationSetRolePermissionsArgs = {
  permissionIds: Array<Scalars['ID']['input']>;
  roleId: Scalars['ID']['input'];
};


export type MutationSetUserRolesArgs = {
  roleIds: Array<Scalars['ID']['input']>;
  userId: Scalars['ID']['input'];
};


export type MutationSetWebhookSubscriptionActiveArgs = {
  active: Scalars['Boolean']['input'];
  id: Scalars['ID']['input'];
};


export type MutationSubmitEmployeeProfileChangeArgs = {
  input: SubmitEmployeeProfileChangeInput;
};


export type MutationSubmitExpenseArgs = {
  input: SubmitExpenseInput;
};


export type MutationSubmitGrievanceCaseArgs = {
  input: SubmitGrievanceCaseInput;
};


export type MutationSubmitLeaveRequestArgs = {
  input: SubmitLeaveRequestInput;
};


export type MutationSubmitSeparationArgs = {
  input: SubmitSeparationInput;
};


export type MutationSubmitTaxProofLineArgs = {
  input: SubmitTaxProofLineInput;
};


export type MutationSubmitTimesheetWeekArgs = {
  weekStartDate: Scalars['NaiveDate']['input'];
};


export type MutationSubmitTravelRequestArgs = {
  input: SubmitTravelRequestInput;
};


export type MutationUpdateAnnouncementArgs = {
  input: UpdateAnnouncementInput;
};


export type MutationUpdateEmployeeArgs = {
  input: UpdateEmployeeInput;
};


export type MutationUpdateEmployeePersonalProfileArgs = {
  input: UpdateEmployeePersonalProfileInput;
};


export type MutationUpdateEmployeeSelfServiceProfileArgs = {
  input: UpdateEmployeeSelfServiceProfileInput;
};


export type MutationUpdateManualAttendanceSegmentArgs = {
  input: UpdateManualAttendanceSegmentInput;
};


export type MutationUpdateNotificationAdminArgs = {
  input: UpdateNotificationAdminInput;
};


export type MutationUpdateNotificationPreferencesArgs = {
  input: UpdateNotificationPreferencesInput;
};


export type MutationUpdateTenantArgs = {
  input: UpdateTenantInput;
};


export type MutationUpdateTimesheetEntryArgs = {
  input: UpdateTimesheetEntryInput;
};


export type MutationUploadEmployeeDocumentArgs = {
  input: UploadEmployeeDocumentInput;
};


export type MutationUploadEmployeeEducationEvidenceArgs = {
  educationId: Scalars['ID']['input'];
  input: UploadEmployeeDocumentInput;
};


export type MutationUploadEmployeeWorkExperienceEvidenceArgs = {
  input: UploadEmployeeDocumentInput;
  workExperienceId: Scalars['ID']['input'];
};


export type MutationUploadTenantFileArgs = {
  input: UploadTenantFileInput;
};


export type MutationUpsertAttendanceAdjustmentPolicyArgs = {
  input: UpsertAttendanceAdjustmentPolicyInput;
};


export type MutationUpsertAttendancePunchPolicyArgs = {
  input: UpsertAttendancePunchPolicyInput;
};


export type MutationUpsertEmployeeEducationArgs = {
  input: UpsertEmployeeEducationInput;
};


export type MutationUpsertEmployeePrimaryAadhaarArgs = {
  input: UpsertEmployeePrimaryAadhaarInput;
};


export type MutationUpsertEmployeePrimaryBankArgs = {
  input: UpsertEmployeePrimaryBankInput;
};


export type MutationUpsertEmployeePrimaryPanArgs = {
  input: UpsertEmployeePrimaryPanInput;
};


export type MutationUpsertEmployeeWorkExperienceArgs = {
  input: UpsertEmployeeWorkExperienceInput;
};


export type MutationUpsertExpenseCategoryAdminArgs = {
  input: UpsertExpenseCategoryAdminInput;
};


export type MutationUpsertExpensePolicyAdminArgs = {
  input: UpsertExpensePolicyAdminInput;
};


export type MutationUpsertFeatureFlagArgs = {
  featureName: Scalars['String']['input'];
  isEnabled: Scalars['Boolean']['input'];
  tenantId: Scalars['ID']['input'];
};


export type MutationUpsertFnfSettlementArgs = {
  input: UpsertFnfSettlementInput;
};


export type MutationUpsertHolidayCalendarArgs = {
  input: UpsertHolidayCalendarInput;
};


export type MutationUpsertHolidayDayArgs = {
  input: UpsertHolidayDayInput;
};


export type MutationUpsertLeaveBalanceArgs = {
  input: UpsertLeaveBalanceInput;
};


export type MutationUpsertLeavePolicyArgs = {
  input: UpsertLeavePolicyInput;
};


export type MutationUpsertLeaveTypeArgs = {
  input: UpsertLeaveTypeInput;
};


export type MutationUpsertPayrollComplianceSettingArgs = {
  input: UpsertPayrollComplianceSettingInput;
};


export type MutationUpsertSalaryComponentArgs = {
  input: UpsertSalaryComponentInput;
};


export type MutationUpsertSalaryStructureArgs = {
  input: UpsertSalaryStructureInput;
};


export type MutationUpsertTaxComputationArgs = {
  input: UpsertTaxComputationInput;
};


export type MutationUpsertTaxConfigurationVersionArgs = {
  input: UpsertTaxConfigurationVersionInput;
};


export type MutationUpsertTaxSectionDefinitionArgs = {
  input: UpsertTaxSectionDefinitionInput;
};


export type MutationUpsertTaxSlabArgs = {
  input: UpsertTaxSlabInput;
};


export type MutationUpsertTenantSubscriptionArgs = {
  input: UpsertTenantSubscriptionInput;
};


export type MutationUpsertTimesheetLockPolicyArgs = {
  input: UpsertTimesheetLockPolicyInput;
};


export type MutationUpsertTimesheetProjectArgs = {
  code: Scalars['String']['input'];
  displayOrder?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
};


export type MutationUpsertTimesheetTaskTypesArgs = {
  projectCode: Scalars['String']['input'];
  taskCodes: Array<Scalars['String']['input']>;
};

export type Notification = {
  __typename?: 'Notification';
  actionUrl?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isRead: Scalars['Boolean']['output'];
  kind?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  readAt?: Maybe<Scalars['DateTime']['output']>;
  tenantId: Scalars['ID']['output'];
  title?: Maybe<Scalars['String']['output']>;
  userId: Scalars['ID']['output'];
};

export type NotificationPreferences = {
  __typename?: 'NotificationPreferences';
  announcementsEnabled: Scalars['Boolean']['output'];
  inAppEnabled: Scalars['Boolean']['output'];
  mutedTopics: Array<Scalars['String']['output']>;
};

export type OnboardingChecklistItem = {
  __typename?: 'OnboardingChecklistItem';
  assignedTo?: Maybe<Scalars['ID']['output']>;
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  dueDate?: Maybe<Scalars['NaiveDate']['output']>;
  employeeId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  isCompleted: Scalars['Boolean']['output'];
  taskCategory?: Maybe<Scalars['String']['output']>;
  taskName: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
};

export type OperatorRole = {
  __typename?: 'OperatorRole';
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type OperatorUser = {
  __typename?: 'OperatorUser';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  lastLoginAt?: Maybe<Scalars['DateTime']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
};

/** Flat reporting-line row; clients build a tree from `reporting_manager_id`. */
export type OrgChartRow = {
  __typename?: 'OrgChartRow';
  departmentName?: Maybe<Scalars['String']['output']>;
  designationTitle?: Maybe<Scalars['String']['output']>;
  employeeCode: Scalars['String']['output'];
  employeeId: Scalars['ID']['output'];
  fullName: Scalars['String']['output'];
  reportingManagerId?: Maybe<Scalars['ID']['output']>;
};

export type OutboxEventRow = {
  __typename?: 'OutboxEventRow';
  aggregateId: Scalars['ID']['output'];
  aggregateType: Scalars['String']['output'];
  /** Present while the outbox worker holds the row (`PROCESSING`). */
  claimedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  eventType: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastError?: Maybe<Scalars['String']['output']>;
  payloadJson: Scalars['String']['output'];
  processedAt?: Maybe<Scalars['DateTime']['output']>;
  retryCount: Scalars['Int']['output'];
  status: Scalars['String']['output'];
};

export type Payment = {
  __typename?: 'Payment';
  amount: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  failureReason?: Maybe<Scalars['String']['output']>;
  gatewayRef?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  invoiceId: Scalars['ID']['output'];
  paidAt?: Maybe<Scalars['DateTime']['output']>;
  paymentMethod?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
};

/** PENDING or APPLIED back-pay / correction accrual; applied on a pay run as an `ARREAR` line. */
export type PayrollArrear = {
  __typename?: 'PayrollArrear';
  /** Decimal as string */
  amount: Scalars['String']['output'];
  appliedPayrollCycleId?: Maybe<Scalars['ID']['output']>;
  createdAt: Scalars['DateTime']['output'];
  employeeId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

/** Tenant payroll presentation + statutory CSV placeholders (India Form 16 / 24Q prep). */
export type PayrollComplianceSetting = {
  __typename?: 'PayrollComplianceSetting';
  /** Salary component code used for **`ARREAR`** payout lines (`EARNING`). */
  arrearSalaryComponentCode: Scalars['String']['output'];
  /** Salary `salary_component.code` used as the employment **base** line on pay run (`EARNING`). */
  baseSalaryComponentCode: Scalars['String']['output'];
  employerLegalName?: Maybe<Scalars['String']['output']>;
  employerTan?: Maybe<Scalars['String']['output']>;
  /** Heading text on payslip when rendered (e.g. company display name). */
  payslipHeaderTitle?: Maybe<Scalars['String']['output']>;
  /** Uploaded logo in **`file_storage`** (tenant-scoped blob); optional. */
  payslipLogoFileStorageId?: Maybe<Scalars['ID']['output']>;
};

export type PayrollCycle = {
  __typename?: 'PayrollCycle';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  month: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  paymentDate?: Maybe<Scalars['NaiveDate']['output']>;
  status: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
  year: Scalars['Int']['output'];
};

export type Payslip = {
  __typename?: 'Payslip';
  createdAt: Scalars['DateTime']['output'];
  employeeId: Scalars['ID']['output'];
  esiEmployee?: Maybe<Scalars['String']['output']>;
  esiEmployer?: Maybe<Scalars['String']['output']>;
  esicNumber?: Maybe<Scalars['String']['output']>;
  generatedAt: Scalars['DateTime']['output'];
  grossSalary: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lines: Array<PayslipComponentLine>;
  netSalary: Scalars['String']['output'];
  payrollCycleId: Scalars['ID']['output'];
  pfEmployee?: Maybe<Scalars['String']['output']>;
  pfEmployer?: Maybe<Scalars['String']['output']>;
  professionalTax?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  tdsAmount?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['ID']['output'];
  totalDeductions: Scalars['String']['output'];
  uanNumber?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type PayslipComponentLine = {
  __typename?: 'PayslipComponentLine';
  /** Decimal as string */
  amount: Scalars['String']['output'];
  componentType?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  payslipId: Scalars['ID']['output'];
  salaryComponentId: Scalars['ID']['output'];
  tenantId: Scalars['ID']['output'];
};

export type PermissionScopeAssignmentInput = {
  action: Scalars['String']['input'];
  resource: Scalars['String']['input'];
  scopeType: Scalars['String']['input'];
};

export type ProvisionEmployeeLoginInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  employeeId: Scalars['ID']['input'];
  initialPassword: Scalars['String']['input'];
  roleIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  username: Scalars['String']['input'];
};

export type ProvisionTenantInput = {
  code: Scalars['String']['input'];
  country?: InputMaybe<Scalars['String']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  runMigrations?: Scalars['Boolean']['input'];
  schemaNameOverride?: InputMaybe<Scalars['String']['input']>;
};

export type ProvisionTenantPayload = {
  __typename?: 'ProvisionTenantPayload';
  detail?: Maybe<Scalars['String']['output']>;
  migrationsRan: Scalars['Boolean']['output'];
  schemaName: Scalars['String']['output'];
  tenant: Tenant;
};

/** One work day: all punch segments + sum of completed segment lengths (minutes). */
export type PunchDaySummary = {
  __typename?: 'PunchDaySummary';
  /** Current in-progress row (punched in, not out), if any. */
  openSegment?: Maybe<Attendance>;
  /** All segment rows for that day, oldest first. */
  segments: Array<Attendance>;
  /** Sum of (check out − check in) for every **completed** segment that day. */
  totalWorkedMinutes: Scalars['Int']['output'];
  workDate: Scalars['NaiveDate']['output'];
};

/** Optional client GPS (browser / mobile) for the **current** punch (in or out). */
export type PunchTodayInput = {
  latitude?: InputMaybe<Scalars['Float']['input']>;
  longitude?: InputMaybe<Scalars['Float']['input']>;
};

export type Query = {
  __typename?: 'Query';
  _entities: Array<Maybe<_Entity>>;
  _service: _Service;
  /** Admin / HR: all recent announcements including scheduled or expired (for management UI). */
  adminAnnouncements: Array<Announcement>;
  /** Admin / HR: recent in-app notifications tenant-wide (for support / auditing). */
  adminNotifications: Array<Notification>;
  analyticsHealth: Scalars['String']['output'];
  announcements: Array<Announcement>;
  applications: Array<Application>;
  assetAssignments: Array<AssetAssignment>;
  assetCategories: Array<AssetCategory>;
  assets: Array<Asset>;
  assetsHealth: Scalars['String']['output'];
  /** Recent attendance rows for the caller's tenant, newest first. */
  attendance: Array<Attendance>;
  attendanceAdjustmentPolicy: AttendanceAdjustmentPolicy;
  attendanceHealth: Scalars['String']['output'];
  /** Live punch policy (geofence + IP). **HR / tenant admin only** — not exposed to every employee. */
  attendancePunchPolicy: AttendancePunchPolicy;
  /** **HR / directory admins only** — communication/entity audit log (most recent first). */
  auditLogs: Array<AuditLogRow>;
  benefitPlans: Array<BenefitPlan>;
  benefitTypes: Array<BenefitType>;
  benefitsHealth: Scalars['String']['output'];
  billingCycles: Array<BillingCycle>;
  billingHealth: Scalars['String']['output'];
  /** Department exit clearance items for a separation. */
  clearanceChecklist: Array<ClearanceChecklistItem>;
  companyDocumentAttachment: TenantFileAttachment;
  companyDocuments: Array<CompanyDocument>;
  compensationHealth: Scalars['String']['output'];
  compensationReviewCycles: Array<CompensationReviewCycle>;
  competencies: Array<Competency>;
  courses: Array<Course>;
  dashboardWidgets: Array<DashboardWidgetRow>;
  dashboards: Array<DashboardRow>;
  departments: Array<Department>;
  /** Job titles / designations in the tenant. Excludes soft-deleted rows. */
  designations: Array<Designation>;
  /** Master list of document / policy types defined for the tenant. */
  documentTypes: Array<DocumentType>;
  /**
   * Fetch one employee by UUID inside the caller's tenant.
   *
   * Returns `null` if the employee does not exist, is soft-deleted, or
   * belongs to another tenant (never leaks cross-tenant rows).
   */
  employee?: Maybe<Employee>;
  /** Safe company directory available to every authenticated tenant employee. */
  employeeDirectoryPage: EmployeeDirectoryPage;
  /** Private employee document bytes. Caller must be able to read the employee who owns the document. */
  employeeDocumentAttachment: EmployeeDocumentAttachment;
  /** Uploaded employee documents. Omit `employeeId` to list the caller’s own files (JWT). */
  employeeDocuments: Array<EmployeeDocument>;
  employeeEducationRecords: Array<EmployeeEducation>;
  employeeEvidenceReviewQueue: Array<EmployeeEvidenceReviewQueueItem>;
  /** Liveness probe for this federated subgraph. Always returns `ok`. */
  employeeHealth: Scalars['String']['output'];
  /** Masked PAN / Aadhaar primary rows for the employee profile. */
  employeeIdentityProfile: EmployeeIdentityProfile;
  /** Primary bank account for payroll (masked account number in API). */
  employeePrimaryBank?: Maybe<EmployeeBankAccount>;
  /** Public profile projection plus server-derived private/edit capabilities. */
  employeeProfileAccess?: Maybe<EmployeeProfileAccess>;
  employeeProfileChangeRequests: Array<EmployeeProfileChangeRequest>;
  /** HR-only, scope-checked request detail containing decrypted current and proposed values. */
  employeeProfileChangeReviewDetail: EmployeeProfileChangeReviewDetail;
  /** HR-only masked queue. Sensitive values require the separate detail query. */
  employeeProfileReviewQueue: Array<EmployeeProfileReviewQueueItem>;
  employeeSalaryBreakupPreview?: Maybe<SalaryBreakupPreview>;
  /** Assigned project codes only (empty ⇒ unrestricted catalog). */
  employeeTimesheetProjectCodes: Array<Scalars['String']['output']>;
  employeeWorkExperienceRecords: Array<EmployeeWorkExperience>;
  /** List the first `limit` employees in the caller's tenant (capped at 100). */
  employees: Array<Employee>;
  /**
   * Compensation rows driving payroll base salary (`employment_history`), newest first.
   * Allowed for **`employee:write`**, **`payroll:statutory_export`**, or the employee themself.
   */
  employmentHistoryRecords: Array<EmploymentHistoryRecord>;
  /**
   * Tenant roles for assigning **ROLE**-scoped expense policies (`expense:manage` etc.).
   * Unlike [`Self::tenant_directory_roles`], this does not require **`role:manage`**.
   */
  expenseAssignableRoles: Array<TenantDirectoryRole>;
  expenseCategories: Array<ExpenseCategory>;
  expenseHealth: Scalars['String']['output'];
  /** Scoped expense policies for a category (**`expense:manage`**). */
  expensePoliciesForAdmin: Array<ExpensePolicy>;
  expenseSubmissionHints: ExpenseSubmissionHints;
  expenses: Array<Expense>;
  featureFlags: Array<FeatureFlag>;
  /** Full & final row for a separation (if HR has run approval, a DRAFT or PROCESSED row exists). */
  fnfSettlement?: Maybe<FnfSettlement>;
  goals: Array<Goal>;
  /** `grievance:manage` sees tenant-wide cases; others see **their own** cases only. */
  grievanceCases: Array<GrievanceCase>;
  grievanceCategories: Array<GrievanceCategory>;
  grievanceHealth: Scalars['String']['output'];
  /** Admin: list holiday calendars (tenant). Requires leave configuration permission. */
  holidayCalendars: Array<HolidayCalendar>;
  /** Admin: holidays in a calendar. Requires leave configuration permission. */
  holidaysInCalendar: Array<HolidayDay>;
  /**
   * **India — EPFO ECR-style monthly contribution prep (CSV).** UAN, capped EPF wage stub, EE/ER from
   * payslip — not official Unified EPF **ECR** file format.
   */
  indiaEpfMonthlyEcrPrepStubCsv: Scalars['String']['output'];
  /** **India FY — Form 16 Part B prep (stub CSV).** Aggregates with Part B–oriented headers; blank employer TAN/name placeholders. */
  indiaForm16PartBFyPrepStubCsv: Scalars['String']['output'];
  /**
   * **India — Form 24Q salary payment month stub (CSV).** Annex-style **prep** for reconciliations —
   * not TRACES **Form 24Q** upload; `gross` is a notional Section **192** salary base; TDS from payslip.
   */
  indiaForm24QSalaryPaymentMonthlyStubCsv: Scalars['String']['output'];
  indiaForm24qSalaryPaymentMonthlyStubCsv: Scalars['String']['output'];
  /**
   * **India FY — per-employee aggregated payslip totals (CSV).** Rolls up all payslips in cycles whose
   * India FY matches `fyStartYear`. Stub for annual compliance prep (e.g. Form 16). Same RBAC as TDS export.
   */
  indiaFyPayrollEmployeeTotalsCsv: Scalars['String']['output'];
  /** **India FY quarter — employee totals (CSV).** Same measures as **`indiaFyPayrollEmployeeTotalsCsv`**, scoped to FY **Q1**–**Q4** months only — quarterly reconciliation prep (e.g. 24Q), not filed layout. */
  indiaFyQuarterPayrollEmployeeTotalsCsv: Scalars['String']['output'];
  /**
   * **India — monthly PF / ESI summary (CSV).** Payslip statutory columns (`pfEmployee`, `esiEmployee`, UAN, ESIC, …)
   * for every payslip in the payroll cycle matching `month` + `year`. Same RBAC as TDS export; not ECR / challan output.
   */
  indiaPfEsiMonthlySummaryCsv: Scalars['String']['output'];
  /**
   * **India — monthly TDS summary (CSV).** All payslips for the payroll cycle matching
   * `month` + `calendar year`. Requires `payroll:statutory_export` or HR / tenant admin role.
   * Stub for statutory filing prep — not a filed Form 24Q; values come from `payslip.tds_amount`.
   */
  indiaTdsMonthlySummaryCsv: Scalars['String']['output'];
  /** **HR / directory admins only** — global connector catalogue (ops DB). */
  integrationConnectors: Array<IntegrationConnectorCatalogRow>;
  invoices: Array<Invoice>;
  jobPostings: Array<JobPosting>;
  /**
   * Leave-balance rows for an employee. Pass `employeeId` to target a
   * specific person (e.g. HR view); when omitted, the caller's own
   * employee id is resolved from the JWT (requires `Authorization`).
   */
  leaveBalances: Array<LeaveBalance>;
  leaveHealth: Scalars['String']['output'];
  /** Published leave policies for the tenant (configuration reference for employees and HR). */
  leavePolicies: Array<LeavePolicy>;
  /** Workflow step actions recorded for a leave request (empty when no workflow instance). */
  leaveRequestWorkflowTrail: Array<LeaveWorkflowAction>;
  /** List leave requests for the caller's tenant. */
  leaveRequests: Array<LeaveRequest>;
  /** List leave types for the caller's tenant. */
  leaveTypes: Array<LeaveType>;
  lmsHealth: Scalars['String']['output'];
  modules: Array<Module>;
  /** Signed-in employee's enrollments (`[]` until they enroll via `enroll_in_benefit_plan`). */
  myBenefitEnrollments: Array<BenefitEnrollment>;
  /**
   * Authoritative employee profile linked to the authenticated user.
   *
   * This resolves `employee.user_id` on every call instead of trusting the
   * optional denormalized `employee_id` access-token claim, so older tokens
   * and repaired account links still reach the correct profile.
   */
  myEmployee?: Maybe<Employee>;
  /** Current user’s in-app visibility preferences (announcement bulletin + per-topic mutes). */
  myNotificationPreferences: NotificationPreferences;
  notificationHealth: Scalars['String']['output'];
  notifications: Array<Notification>;
  /**
   * Onboarding tasks for an employee. Omit `employeeId` for the JWT subject's checklist.
   * HR / directory managers may pass another employee id (same data-scope rules as documents).
   */
  onboardingChecklist: Array<OnboardingChecklistItem>;
  operatorHealth: Scalars['String']['output'];
  operatorRoles: Array<OperatorRole>;
  /** Roles assigned to one operator user (junction `operator_user_role`). */
  operatorRolesForUser: Array<OperatorRole>;
  operatorUsers: Array<OperatorUser>;
  /**
   * Reporting hierarchy as a **flat** list (`reportingManagerId` → parent). Build a tree in the client.
   * Respects the same **`employee`** `resource_scopes` as **`employees`** (SELF / TEAM / DEPARTMENT / ALL).
   */
  orgChart: Array<OrgChartRow>;
  /** Safe full reporting hierarchy for authenticated employees. */
  organizationDirectoryChart: Array<EmployeeDirectoryEntry>;
  /** **HR / directory admins only** — inspect transactional outbox rows (e.g. after leave approval). */
  outboxEvents: Array<OutboxEventRow>;
  payments: Array<Payment>;
  /** `PENDING` payroll arrear accruals (oldest first by `createdAt` desc in service order). HR / statutory export role. */
  payrollArrears: Array<PayrollArrear>;
  /**
   * **Payroll — bank transfer list (CSV).** Net pay and primary `employee_bank` for each payslip
   * in the cycle for `month` + `year`. Same RBAC as India statutory exports; not a specific bank’s
   * upload file format.
   */
  payrollBankTransferCsv: Scalars['String']['output'];
  /**
   * Employer TAN, payslip branding, component codes (optional row per tenant).
   * Readable by any authenticated client so employees can render branded payslips; **`upsertPayrollComplianceSetting`**
   * remains restricted to statutory-export / HR roles.
   */
  payrollComplianceSetting?: Maybe<PayrollComplianceSetting>;
  /** List payroll cycles for the caller's tenant, most recent first. */
  payrollCycles: Array<PayrollCycle>;
  payrollHealth: Scalars['String']['output'];
  /**
   * **India — NEFT / bulk salary credit prep (CSV).** Multi-beneficiary style columns (IFSC, account,
   * narration, optional value date from cycle). Same RBAC as other payroll bank/statutory exports.
   */
  payrollIndiaBulkNeftCreditCsv: Scalars['String']['output'];
  /** One payslip with `lines` = `payslip_component` rows. */
  payslip?: Maybe<Payslip>;
  /**
   * HMAC URL for **`GET /files/employee-document?token=…`** on **kabipay-employee** (same as document downloads).
   * Only issued when **`fileStorageId`** equals **`payroll_compliance_setting.payslip_logo_file_storage_id`**.
   */
  payslipLogoSignedReadUrl: Scalars['String']['output'];
  /**
   * When `employeeId` is omitted, uses the signed-in user’s employee id from the JWT
   * (or `user` → `employee` link). Pass `employeeId` to view a specific person (e.g. HR).
   */
  payslips: Array<Payslip>;
  performanceHealth: Scalars['String']['output'];
  /** Permission UUIDs granted to a role (`role_permission`). */
  permissionIdsForRole: Array<Scalars['ID']['output']>;
  /** Data scopes (`permission_scope`) for list filtering (employee / leave / expense / …). */
  permissionScopesForRole: Array<TenantPermissionScopeAssignment>;
  /**
   * Multi-segment punch for one work day: total worked minutes and all segments
   * (JWT employee; `workDate` defaults to today, UTC `work_date` calendar).
   */
  punchDaySummary: PunchDaySummary;
  recruitmentHealth: Scalars['String']['output'];
  reportDefinitions: Array<ReportDefinitionRow>;
  reportSchedules: Array<ReportScheduleRow>;
  reviewCycles: Array<ReviewCycle>;
  /** Role UUIDs assigned to a user (`user_role`). */
  roleIdsForUser: Array<Scalars['ID']['output']>;
  salaryBands: Array<SalaryBand>;
  /** List salary components (earnings/deductions) for the caller's tenant. */
  salaryComponents: Array<SalaryComponent>;
  salaryStructures: Array<SalaryStructure>;
  /**
   * Separation / offboarding requests. `onboarding:manage` sees tenant-wide rows;
   * `onboarding:self` (or manage) sees **their own**; otherwise forbidden.
   */
  separations: Array<Separation>;
  /** List all shift templates for the caller's tenant. */
  shifts: Array<Shift>;
  skills: Array<Skill>;
  successionHealth: Scalars['String']['output'];
  talentPools: Array<TalentPool>;
  /**
   * Stored per-employee tax computation / declaration rows for a fiscal period.
   * Omit `employeeId` to use the signed-in user’s employee record.
   */
  taxComputations: Array<TaxComputation>;
  /** Tax configuration versions configured for this tenant. */
  taxConfigurations: Array<TaxConfigurationVersion>;
  taxHealth: Scalars['String']['output'];
  /**
   * Deduction proof lines (declared vs actual) for an employee. Omit `employeeId` for self;
   * viewing another employee requires `tax:approve` (or HR / tenant admin role).
   */
  taxProofLines: Array<TaxProofLine>;
  /** Deduction sections catalogue (**`tax_proof_line.section_code`**) — admin-maintained labels & caps. */
  taxSectionDefinitions: Array<TaxSectionDefinition>;
  /** Tax slabs for this tenant (filter by fiscal_year server-side later). */
  taxSlabs: Array<TaxSlab>;
  /** Permission catalog rows in the tenant schema (for matrix editing). */
  tenantCatalogPermissions: Array<TenantCatalogPermission>;
  /** Tenant-defined roles. */
  tenantDirectoryRoles: Array<TenantDirectoryRole>;
  /** Tenant users for RBAC assignment (`role:manage` / HR admin). */
  tenantDirectoryUsers: Array<TenantDirectoryUser>;
  /**
   * Private tenant file bytes for generic `file_storage` uploads.
   *
   * This is intentionally not a public/signed URL. Generic file storage is shared by multiple
   * HRMS modules, so reads are limited to the uploader or elevated tenant HR/onboarding/RBAC
   * admins until each module has its own business-object-specific visibility rules.
   */
  tenantFileAttachment: TenantFileAttachment;
  tenantHealth: Scalars['String']['output'];
  /** **HR / directory admins only** — tenant integration rows. */
  tenantIntegrations: Array<TenantIntegrationRow>;
  tenantSubscriptions: Array<TenantSubscription>;
  tenants: Array<Tenant>;
  /** Timesheet rows for an employee. Omit `employeeId` to use the JWT-linked employee. */
  timesheetEntries: Array<TimesheetEntry>;
  timesheetLockPolicy: TimesheetLockPolicy;
  timesheetProjects: Array<TimesheetProjectOption>;
  /**
   * Projects the employee may log hours against (full catalog when no per-employee assignments exist).
   * Omit `employeeId` for the JWT-linked employee.
   */
  timesheetProjectsForEmployee: Array<TimesheetProjectOption>;
  timesheetTaskTypes: Array<Scalars['String']['output']>;
  timesheetWeekBatches: Array<TimesheetWeekBatch>;
  /** Travel / trip requests for the caller’s **expense** data scope (same as `expenses`). */
  travelRequests: Array<TravelRequest>;
  unreadNotificationCount: Scalars['Int']['output'];
  /** Holidays on or after `fromDate` (defaults to today), all calendars in the tenant. */
  upcomingHolidays: Array<HolidayEntry>;
  /** Canonical `EMPLOYEE.id` for the authenticated client (from JWT → user → employee link). */
  viewerEmployeeId: Scalars['ID']['output'];
  /** **HR / directory admins only** — webhook POST attempts (**`webhook_delivery_log`**), newest first. */
  webhookDeliveryLogs: Array<WebhookDeliveryLogRow>;
  /** **HR / directory admins only** — outbound webhook subscriptions. */
  webhookSubscriptions: Array<WebhookSubscriptionRow>;
  workflowHealth: Scalars['String']['output'];
  workflowInstances: Array<WorkflowInstance>;
  /** Step list for a single workflow (same ordering as `workflowsWithSteps` per workflow). */
  workflowSteps: Array<WorkflowStep>;
  workflows: Array<Workflow>;
  /** All active workflow definitions, each with ordered steps (read-only “designer” data). */
  workflowsWithSteps: Array<WorkflowWithSteps>;
  workforceSnapshots: Array<WorkforceSnapshotRow>;
};


export type Query_EntitiesArgs = {
  representations: Array<Scalars['_Any']['input']>;
};


export type QueryAdminAnnouncementsArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryAdminNotificationsArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryAnnouncementsArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryApplicationsArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryAssetAssignmentsArgs = {
  activeOnly?: Scalars['Boolean']['input'];
  employeeId?: InputMaybe<Scalars['ID']['input']>;
  limit?: Scalars['Int']['input'];
};


export type QueryAssetCategoriesArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryAssetsArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryAttendanceArgs = {
  fromDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  limit?: Scalars['Int']['input'];
  toDate?: InputMaybe<Scalars['NaiveDate']['input']>;
};


export type QueryAuditLogsArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryBenefitPlansArgs = {
  activeOnly?: Scalars['Boolean']['input'];
  limit?: Scalars['Int']['input'];
};


export type QueryBenefitTypesArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryBillingCyclesArgs = {
  limit?: Scalars['Int']['input'];
  tenantId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryClearanceChecklistArgs = {
  separationId: Scalars['ID']['input'];
};


export type QueryCompanyDocumentAttachmentArgs = {
  companyDocumentId: Scalars['ID']['input'];
};


export type QueryCompanyDocumentsArgs = {
  activeOnly?: Scalars['Boolean']['input'];
  category?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
};


export type QueryCompensationReviewCyclesArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryCompetenciesArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryCoursesArgs = {
  activeOnly?: Scalars['Boolean']['input'];
  limit?: Scalars['Int']['input'];
};


export type QueryDashboardWidgetsArgs = {
  dashboardId?: InputMaybe<Scalars['ID']['input']>;
  limit?: Scalars['Int']['input'];
};


export type QueryDashboardsArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryDepartmentsArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryDesignationsArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryDocumentTypesArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryEmployeeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryEmployeeDirectoryPageArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
};


export type QueryEmployeeDocumentAttachmentArgs = {
  employeeDocumentId: Scalars['ID']['input'];
};


export type QueryEmployeeDocumentsArgs = {
  employeeId?: InputMaybe<Scalars['ID']['input']>;
  limit?: Scalars['Int']['input'];
};


export type QueryEmployeeEducationRecordsArgs = {
  employeeId: Scalars['ID']['input'];
};


export type QueryEmployeeEvidenceReviewQueueArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryEmployeeIdentityProfileArgs = {
  employeeId: Scalars['ID']['input'];
};


export type QueryEmployeePrimaryBankArgs = {
  employeeId: Scalars['ID']['input'];
};


export type QueryEmployeeProfileAccessArgs = {
  employeeId: Scalars['ID']['input'];
};


export type QueryEmployeeProfileChangeRequestsArgs = {
  employeeId: Scalars['ID']['input'];
  status?: InputMaybe<Scalars['String']['input']>;
};


export type QueryEmployeeProfileChangeReviewDetailArgs = {
  requestId: Scalars['ID']['input'];
};


export type QueryEmployeeProfileReviewQueueArgs = {
  limit?: Scalars['Int']['input'];
  status?: InputMaybe<Scalars['String']['input']>;
};


export type QueryEmployeeSalaryBreakupPreviewArgs = {
  asOf?: InputMaybe<Scalars['NaiveDate']['input']>;
  employeeId: Scalars['ID']['input'];
};


export type QueryEmployeeTimesheetProjectCodesArgs = {
  employeeId: Scalars['ID']['input'];
};


export type QueryEmployeeWorkExperienceRecordsArgs = {
  employeeId: Scalars['ID']['input'];
};


export type QueryEmployeesArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryEmploymentHistoryRecordsArgs = {
  employeeId: Scalars['ID']['input'];
  limit?: Scalars['Int']['input'];
};


export type QueryExpenseAssignableRolesArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryExpenseCategoriesArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryExpensePoliciesForAdminArgs = {
  expenseCategoryId: Scalars['ID']['input'];
};


export type QueryExpenseSubmissionHintsArgs = {
  expenseCategoryId: Scalars['ID']['input'];
};


export type QueryExpensesArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryFeatureFlagsArgs = {
  limit?: Scalars['Int']['input'];
  tenantId: Scalars['ID']['input'];
};


export type QueryFnfSettlementArgs = {
  separationId: Scalars['ID']['input'];
};


export type QueryGoalsArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryGrievanceCasesArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryGrievanceCategoriesArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryHolidayCalendarsArgs = {
  limit?: Scalars['Int']['input'];
  year?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryHolidaysInCalendarArgs = {
  calendarId: Scalars['ID']['input'];
  limit?: Scalars['Int']['input'];
};


export type QueryIndiaEpfMonthlyEcrPrepStubCsvArgs = {
  month: Scalars['Int']['input'];
  year: Scalars['Int']['input'];
};


export type QueryIndiaForm16PartBFyPrepStubCsvArgs = {
  fyStartYear: Scalars['Int']['input'];
};


export type QueryIndiaForm24QSalaryPaymentMonthlyStubCsvArgs = {
  month: Scalars['Int']['input'];
  year: Scalars['Int']['input'];
};


export type QueryIndiaForm24qSalaryPaymentMonthlyStubCsvArgs = {
  month: Scalars['Int']['input'];
  year: Scalars['Int']['input'];
};


export type QueryIndiaFyPayrollEmployeeTotalsCsvArgs = {
  fyStartYear: Scalars['Int']['input'];
};


export type QueryIndiaFyQuarterPayrollEmployeeTotalsCsvArgs = {
  fyStartYear: Scalars['Int']['input'];
  quarter: Scalars['Int']['input'];
};


export type QueryIndiaPfEsiMonthlySummaryCsvArgs = {
  month: Scalars['Int']['input'];
  year: Scalars['Int']['input'];
};


export type QueryIndiaTdsMonthlySummaryCsvArgs = {
  month: Scalars['Int']['input'];
  year: Scalars['Int']['input'];
};


export type QueryIntegrationConnectorsArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryInvoicesArgs = {
  limit?: Scalars['Int']['input'];
  tenantId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryJobPostingsArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryLeaveBalancesArgs = {
  employeeId?: InputMaybe<Scalars['ID']['input']>;
  limit?: Scalars['Int']['input'];
  year?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryLeavePoliciesArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryLeaveRequestWorkflowTrailArgs = {
  leaveRequestId: Scalars['ID']['input'];
};


export type QueryLeaveRequestsArgs = {
  fromDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  limit?: Scalars['Int']['input'];
  toDate?: InputMaybe<Scalars['NaiveDate']['input']>;
};


export type QueryLeaveTypesArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryModulesArgs = {
  includeInactive?: Scalars['Boolean']['input'];
  limit?: Scalars['Int']['input'];
};


export type QueryMyBenefitEnrollmentsArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryNotificationsArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryOnboardingChecklistArgs = {
  employeeId?: InputMaybe<Scalars['ID']['input']>;
  limit?: Scalars['Int']['input'];
};


export type QueryOperatorRolesArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryOperatorRolesForUserArgs = {
  operatorUserId: Scalars['ID']['input'];
};


export type QueryOperatorUsersArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryOrgChartArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryOutboxEventsArgs = {
  limit?: Scalars['Int']['input'];
  status?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPaymentsArgs = {
  invoiceId?: InputMaybe<Scalars['ID']['input']>;
  limit?: Scalars['Int']['input'];
};


export type QueryPayrollArrearsArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryPayrollBankTransferCsvArgs = {
  month: Scalars['Int']['input'];
  year: Scalars['Int']['input'];
};


export type QueryPayrollCyclesArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryPayrollIndiaBulkNeftCreditCsvArgs = {
  month: Scalars['Int']['input'];
  year: Scalars['Int']['input'];
};


export type QueryPayslipArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPayslipLogoSignedReadUrlArgs = {
  fileStorageId: Scalars['ID']['input'];
  ttlSeconds?: Scalars['Int']['input'];
};


export type QueryPayslipsArgs = {
  employeeId?: InputMaybe<Scalars['ID']['input']>;
  limit?: Scalars['Int']['input'];
};


export type QueryPermissionIdsForRoleArgs = {
  roleId: Scalars['ID']['input'];
};


export type QueryPermissionScopesForRoleArgs = {
  roleId: Scalars['ID']['input'];
};


export type QueryPunchDaySummaryArgs = {
  workDate?: InputMaybe<Scalars['NaiveDate']['input']>;
};


export type QueryReportDefinitionsArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryReportSchedulesArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryReviewCyclesArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryRoleIdsForUserArgs = {
  userId: Scalars['ID']['input'];
};


export type QuerySalaryBandsArgs = {
  limit?: Scalars['Int']['input'];
};


export type QuerySalaryComponentsArgs = {
  activeOnly?: Scalars['Boolean']['input'];
  limit?: Scalars['Int']['input'];
};


export type QuerySalaryStructuresArgs = {
  limit?: Scalars['Int']['input'];
};


export type QuerySeparationsArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryShiftsArgs = {
  limit?: Scalars['Int']['input'];
};


export type QuerySkillsArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryTalentPoolsArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryTaxComputationsArgs = {
  employeeId?: InputMaybe<Scalars['ID']['input']>;
  limit?: Scalars['Int']['input'];
};


export type QueryTaxConfigurationsArgs = {
  activeOnly?: Scalars['Boolean']['input'];
  limit?: Scalars['Int']['input'];
};


export type QueryTaxProofLinesArgs = {
  employeeId?: InputMaybe<Scalars['ID']['input']>;
  fiscalYear?: InputMaybe<Scalars['Int']['input']>;
  taxConfigVersionId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryTaxSectionDefinitionsArgs = {
  activeOnly?: Scalars['Boolean']['input'];
  limit?: Scalars['Int']['input'];
};


export type QueryTaxSlabsArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryTenantCatalogPermissionsArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryTenantDirectoryRolesArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryTenantDirectoryUsersArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryTenantFileAttachmentArgs = {
  fileStorageId: Scalars['ID']['input'];
};


export type QueryTenantIntegrationsArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryTenantSubscriptionsArgs = {
  limit?: Scalars['Int']['input'];
  tenantId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryTenantsArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryTimesheetEntriesArgs = {
  employeeId?: InputMaybe<Scalars['ID']['input']>;
  fromDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  limit?: Scalars['Int']['input'];
  toDate?: InputMaybe<Scalars['NaiveDate']['input']>;
};


export type QueryTimesheetProjectsArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryTimesheetProjectsForEmployeeArgs = {
  employeeId?: InputMaybe<Scalars['ID']['input']>;
  limit?: Scalars['Int']['input'];
};


export type QueryTimesheetTaskTypesArgs = {
  projectCode: Scalars['String']['input'];
};


export type QueryTimesheetWeekBatchesArgs = {
  limit?: Scalars['Int']['input'];
  status?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTravelRequestsArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryUpcomingHolidaysArgs = {
  fromDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  limit?: Scalars['Int']['input'];
};


export type QueryWebhookDeliveryLogsArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryWebhookSubscriptionsArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryWorkflowInstancesArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryWorkflowStepsArgs = {
  workflowId: Scalars['ID']['input'];
};


export type QueryWorkflowsArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryWorkflowsWithStepsArgs = {
  limit?: Scalars['Int']['input'];
};


export type QueryWorkforceSnapshotsArgs = {
  limit?: Scalars['Int']['input'];
};

export type RecordPaymentInput = {
  amount: Scalars['String']['input'];
  gatewayRef?: InputMaybe<Scalars['String']['input']>;
  invoiceId: Scalars['ID']['input'];
  paymentMethod?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type RegisterWebhookInput = {
  endpointUrl: Scalars['String']['input'];
  eventName: Scalars['String']['input'];
  /** Optional signing secret (**SHA256** stored server-side). */
  webhookSecret?: InputMaybe<Scalars['String']['input']>;
};

export type ReportDefinitionRow = {
  __typename?: 'ReportDefinitionRow';
  chartType?: Maybe<Scalars['String']['output']>;
  columnsJson?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  entityType?: Maybe<Scalars['String']['output']>;
  filtersJson?: Maybe<Scalars['String']['output']>;
  groupbyJson?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isPublic: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type ReportScheduleRow = {
  __typename?: 'ReportScheduleRow';
  createdAt: Scalars['DateTime']['output'];
  deliveryFormat?: Maybe<Scalars['String']['output']>;
  frequency: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  lastSentAt?: Maybe<Scalars['DateTime']['output']>;
  nextRunAt?: Maybe<Scalars['DateTime']['output']>;
  recipientsJson?: Maybe<Scalars['String']['output']>;
  reportDefinitionId: Scalars['ID']['output'];
};

export type ResetEmployeePasswordInput = {
  employeeId: Scalars['ID']['input'];
  newPassword: Scalars['String']['input'];
};

export type ReturnAssetInput = {
  assetAllocationId: Scalars['ID']['input'];
  conditionAtReturn?: InputMaybe<Scalars['String']['input']>;
  remarks?: InputMaybe<Scalars['String']['input']>;
  returnedOn: Scalars['NaiveDate']['input'];
};

export type ReviewCycle = {
  __typename?: 'ReviewCycle';
  createdAt: Scalars['DateTime']['output'];
  endDate: Scalars['NaiveDate']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  reviewType?: Maybe<Scalars['String']['output']>;
  startDate: Scalars['NaiveDate']['output'];
  status: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type SalaryBand = {
  __typename?: 'SalaryBand';
  currency?: Maybe<Scalars['String']['output']>;
  designationId: Scalars['ID']['output'];
  effectiveYear?: Maybe<Scalars['Int']['output']>;
  grade?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  maxSalary?: Maybe<Scalars['String']['output']>;
  midSalary?: Maybe<Scalars['String']['output']>;
  minSalary?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['ID']['output'];
};

export type SalaryBreakupLine = {
  __typename?: 'SalaryBreakupLine';
  annualAmount: Scalars['String']['output'];
  calculationBasis: Scalars['String']['output'];
  calculationValue: Scalars['String']['output'];
  componentCode: Scalars['String']['output'];
  componentName: Scalars['String']['output'];
  componentType: Scalars['String']['output'];
  isOverride: Scalars['Boolean']['output'];
  monthlyAmount: Scalars['String']['output'];
  salaryComponentId: Scalars['ID']['output'];
};

export type SalaryBreakupPreview = {
  __typename?: 'SalaryBreakupPreview';
  annualCtc: Scalars['String']['output'];
  employeeId: Scalars['ID']['output'];
  employeeSalaryStructureId?: Maybe<Scalars['ID']['output']>;
  lines: Array<SalaryBreakupLine>;
  monthlyDeductions: Scalars['String']['output'];
  monthlyGross: Scalars['String']['output'];
  monthlyNetBeforeStatutory: Scalars['String']['output'];
};

export type SalaryComponent = {
  __typename?: 'SalaryComponent';
  code: Scalars['String']['output'];
  componentType: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  formulaExpression?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isFixed: Scalars['Boolean']['output'];
  isTaxable: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type SalaryStructure = {
  __typename?: 'SalaryStructure';
  components: Array<SalaryStructureComponent>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type SalaryStructureComponent = {
  __typename?: 'SalaryStructureComponent';
  calculationBasis: Scalars['String']['output'];
  calculationValue?: Maybe<Scalars['String']['output']>;
  componentCode: Scalars['String']['output'];
  componentName: Scalars['String']['output'];
  componentType: Scalars['String']['output'];
  displayOrder: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  salaryComponentId: Scalars['ID']['output'];
};

export type SalaryStructureComponentInput = {
  calculationBasis: Scalars['String']['input'];
  calculationValue: Scalars['String']['input'];
  displayOrder: Scalars['Int']['input'];
  salaryComponentId: Scalars['ID']['input'];
};

export type Separation = {
  __typename?: 'Separation';
  approvedBy?: Maybe<Scalars['ID']['output']>;
  createdAt: Scalars['DateTime']['output'];
  employeeId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  lastWorkingDate: Scalars['NaiveDate']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  resignationDate?: Maybe<Scalars['NaiveDate']['output']>;
  separationType: Scalars['String']['output'];
  status: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
  workflowInstanceId?: Maybe<Scalars['ID']['output']>;
};

export type SetEmployeeCompensationInput = {
  changeReason?: InputMaybe<Scalars['String']['input']>;
  effectiveFrom: Scalars['NaiveDate']['input'];
  employeeId: Scalars['ID']['input'];
  /** Monthly gross (BASIC) for payroll — must match Decimal string (e.g. `65000` or `65000.00`). */
  monthlySalary: Scalars['String']['input'];
};

export type Shift = {
  __typename?: 'Shift';
  createdAt: Scalars['DateTime']['output'];
  endTime?: Maybe<Scalars['NaiveTime']['output']>;
  id: Scalars['ID']['output'];
  isNightShift: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  startTime?: Maybe<Scalars['NaiveTime']['output']>;
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
  workHours?: Maybe<Scalars['Int']['output']>;
};

export type Skill = {
  __typename?: 'Skill';
  category?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  level?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type SubmitEmployeeProfileChangeInput = {
  aadhaarNumber?: InputMaybe<Scalars['String']['input']>;
  accountNumber?: InputMaybe<Scalars['String']['input']>;
  accountType?: InputMaybe<Scalars['String']['input']>;
  bankName?: InputMaybe<Scalars['String']['input']>;
  dateOfBirth?: InputMaybe<Scalars['NaiveDate']['input']>;
  employeeId: Scalars['ID']['input'];
  firstName?: InputMaybe<Scalars['String']['input']>;
  ifscCode?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  panNumber?: InputMaybe<Scalars['String']['input']>;
  requestType: Scalars['String']['input'];
  supportingDocumentId?: InputMaybe<Scalars['ID']['input']>;
};

export type SubmitExpenseInput = {
  /** String decimal, e.g. "1250.50" */
  amount: Scalars['String']['input'];
  /** ISO 4217, e.g. "INR" */
  currency: Scalars['String']['input'];
  expenseCategoryId: Scalars['ID']['input'];
  expenseDate: Scalars['NaiveDate']['input'];
  receiptFileStorageId?: InputMaybe<Scalars['ID']['input']>;
  title: Scalars['String']['input'];
  /** Link to a travel request the employee owns (optional). */
  travelRequestId?: InputMaybe<Scalars['ID']['input']>;
};

export type SubmitGrievanceCaseInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  grievanceCategoryId: Scalars['ID']['input'];
  subject: Scalars['String']['input'];
};

export type SubmitLeaveRequestInput = {
  fromDate: Scalars['NaiveDate']['input'];
  halfDaySession?: InputMaybe<Scalars['String']['input']>;
  isHalfDay: Scalars['Boolean']['input'];
  leaveTypeId: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
  supportingDocumentReference?: InputMaybe<Scalars['String']['input']>;
  toDate: Scalars['NaiveDate']['input'];
};

export type SubmitSeparationInput = {
  /** When omitted, the JWT-linked employee is used (self-service exit request). */
  employeeId?: InputMaybe<Scalars['ID']['input']>;
  lastWorkingDate: Scalars['NaiveDate']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
  resignationDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  separationType: Scalars['String']['input'];
};

export type SubmitTaxProofLineInput = {
  /** Submitted **actual** from proof (string decimal); must be approved to count in `tax_computation`. */
  actualAmount: Scalars['String']['input'];
  /** Declared amount at the start of the year (string decimal). */
  declaredAmount: Scalars['String']['input'];
  /** Required `file_storage` id after uploading the proof file. */
  fileStorageId: Scalars['ID']['input'];
  fiscalYear: Scalars['Int']['input'];
  sectionCode: Scalars['String']['input'];
  taxConfigVersionId: Scalars['ID']['input'];
};

export type SubmitTravelRequestInput = {
  currency: Scalars['String']['input'];
  destinationLocation?: InputMaybe<Scalars['String']['input']>;
  /** Optional string decimal; omit for unknown estimate. */
  estimatedAmount?: InputMaybe<Scalars['String']['input']>;
  fromDate: Scalars['NaiveDate']['input'];
  originLocation?: InputMaybe<Scalars['String']['input']>;
  purpose: Scalars['String']['input'];
  toDate: Scalars['NaiveDate']['input'];
};

export type TalentPool = {
  __typename?: 'TalentPool';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type TaxComputation = {
  __typename?: 'TaxComputation';
  computedAt: Scalars['DateTime']['output'];
  employeeId: Scalars['ID']['output'];
  finalTax?: Maybe<Scalars['String']['output']>;
  fiscalYear: Scalars['Int']['output'];
  grossIncome?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  taxConfigVersionId: Scalars['ID']['output'];
  taxRegimeChosen?: Maybe<Scalars['String']['output']>;
  taxableIncome?: Maybe<Scalars['String']['output']>;
  tdsPerMonth?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['ID']['output'];
  totalDeductions?: Maybe<Scalars['String']['output']>;
};

export type TaxConfigurationVersion = {
  __typename?: 'TaxConfigurationVersion';
  countryCode: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  fiscalYear: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  regime?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type TaxProofLine = {
  __typename?: 'TaxProofLine';
  actualAmount: Scalars['String']['output'];
  approvedBy?: Maybe<Scalars['ID']['output']>;
  declaredAmount: Scalars['String']['output'];
  employeeId: Scalars['ID']['output'];
  fileStorageId?: Maybe<Scalars['ID']['output']>;
  fiscalYear: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  rejectionReason?: Maybe<Scalars['String']['output']>;
  /** e.g. `80C`, `HRA`, `STANDARD` */
  sectionCode: Scalars['String']['output'];
  status: Scalars['String']['output'];
  submittedAt: Scalars['DateTime']['output'];
  taxConfigVersionId: Scalars['ID']['output'];
  tenantId: Scalars['ID']['output'];
};

/** Admin-configured IT deduction section (aligns with **`tax_proof_line.section_code`**). */
export type TaxSectionDefinition = {
  __typename?: 'TaxSectionDefinition';
  countryCode: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  displayOrder: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  maxDeductionAmount?: Maybe<Scalars['String']['output']>;
  /** e.g. `OLD`, `NEW`, `ALL` — filter when offering proof UI for a regime. */
  regimeScope?: Maybe<Scalars['String']['output']>;
  sectionCode: Scalars['String']['output'];
  sectionLabel: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type TaxSlab = {
  __typename?: 'TaxSlab';
  cessRate?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  /** Decimal rendered as string for lossless transport. */
  incomeFrom: Scalars['String']['output'];
  incomeTo?: Maybe<Scalars['String']['output']>;
  surchargeRate?: Maybe<Scalars['String']['output']>;
  taxConfigVersionId: Scalars['ID']['output'];
  taxRate?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['ID']['output'];
};

export type Tenant = {
  __typename?: 'Tenant';
  country?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  currency?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  plan?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  subdomain?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type TenantCatalogPermission = {
  __typename?: 'TenantCatalogPermission';
  action: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  resource: Scalars['String']['output'];
};

export type TenantDirectoryRole = {
  __typename?: 'TenantDirectoryRole';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isSystemRole: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
};

export type TenantDirectoryUser = {
  __typename?: 'TenantDirectoryUser';
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  username: Scalars['String']['output'];
};

export type TenantFileAttachment = {
  __typename?: 'TenantFileAttachment';
  /** Standard base64 payload returned only after tenant file authorization. */
  contentBase64: Scalars['String']['output'];
  fileName: Scalars['String']['output'];
  fileSizeBytes?: Maybe<Scalars['Int']['output']>;
  mimeType: Scalars['String']['output'];
};

export type TenantIntegrationRow = {
  __typename?: 'TenantIntegrationRow';
  connectedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  integrationConnectorId: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
};

export type TenantPermissionScopeAssignment = {
  __typename?: 'TenantPermissionScopeAssignment';
  action: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  resource: Scalars['String']['output'];
  scopeType: Scalars['String']['output'];
};

export type TenantSubscription = {
  __typename?: 'TenantSubscription';
  activatedAt?: Maybe<Scalars['NaiveDate']['output']>;
  contractedSeats: Scalars['Int']['output'];
  currentSeatUsage: Scalars['Int']['output'];
  expiresAt?: Maybe<Scalars['NaiveDate']['output']>;
  id: Scalars['ID']['output'];
  moduleId: Scalars['ID']['output'];
  overagePolicy: Scalars['String']['output'];
  status: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
};

export type TimesheetEntry = {
  __typename?: 'TimesheetEntry';
  batchId?: Maybe<Scalars['ID']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  employeeId: Scalars['ID']['output'];
  hoursWorked: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  projectCode?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
  workDate: Scalars['NaiveDate']['output'];
};

export type TimesheetLockPolicy = {
  __typename?: 'TimesheetLockPolicy';
  editableWeekSpan: Scalars['Int']['output'];
  lockApprovedEntries: Scalars['Boolean']['output'];
};

export type TimesheetProjectOption = {
  __typename?: 'TimesheetProjectOption';
  code: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type TimesheetWeekBatch = {
  __typename?: 'TimesheetWeekBatch';
  employeeCode?: Maybe<Scalars['String']['output']>;
  employeeId: Scalars['ID']['output'];
  employeeName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  /** Configured workflow step title when status is PENDING and a workflow is in progress. */
  pendingApprovalStage?: Maybe<Scalars['String']['output']>;
  rejectionReason?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  submittedAt?: Maybe<Scalars['DateTime']['output']>;
  tenantId: Scalars['ID']['output'];
  /** True when this user may approve/reject now (parity with expense/travel inbox fields). */
  viewerMayApprove: Scalars['Boolean']['output'];
  weekStartDate: Scalars['NaiveDate']['output'];
  workflowInstanceId?: Maybe<Scalars['ID']['output']>;
};

export type TravelRequest = {
  __typename?: 'TravelRequest';
  approvedBy?: Maybe<Scalars['ID']['output']>;
  currency: Scalars['String']['output'];
  destinationLocation?: Maybe<Scalars['String']['output']>;
  employeeId: Scalars['ID']['output'];
  estimatedAmount?: Maybe<Scalars['String']['output']>;
  fromDate: Scalars['NaiveDate']['output'];
  id: Scalars['ID']['output'];
  originLocation?: Maybe<Scalars['String']['output']>;
  pendingApprovalStage?: Maybe<Scalars['String']['output']>;
  purpose: Scalars['String']['output'];
  rejectedBy?: Maybe<Scalars['ID']['output']>;
  rejectionReason?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  submittedAt: Scalars['DateTime']['output'];
  tenantId: Scalars['ID']['output'];
  toDate: Scalars['NaiveDate']['output'];
  viewerMayApprove: Scalars['Boolean']['output'];
  /** Present when **`TRAVEL_REQUEST`** workflow is active (**M32** parity with expenses). */
  workflowInstanceId?: Maybe<Scalars['ID']['output']>;
};

export type UpdateAnnouncementInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  clearDocument?: Scalars['Boolean']['input'];
  clearExpiresAt?: Scalars['Boolean']['input'];
  clearImage?: Scalars['Boolean']['input'];
  clearPublishAt?: Scalars['Boolean']['input'];
  /** Clears role-based `ROLE:*` targeting when true. */
  clearRoleAudience?: Scalars['Boolean']['input'];
  /** Set true to clear department targeting. */
  clearTargetDepartment?: Scalars['Boolean']['input'];
  /** Set true to clear location targeting. */
  clearTargetLocation?: Scalars['Boolean']['input'];
  documentContentBase64?: InputMaybe<Scalars['String']['input']>;
  documentFileName?: InputMaybe<Scalars['String']['input']>;
  documentMimeType?: InputMaybe<Scalars['String']['input']>;
  expiresAt?: InputMaybe<Scalars['DateTime']['input']>;
  id: Scalars['ID']['input'];
  imageContentBase64?: InputMaybe<Scalars['String']['input']>;
  imageFileName?: InputMaybe<Scalars['String']['input']>;
  imageMimeType?: InputMaybe<Scalars['String']['input']>;
  publishAt?: InputMaybe<Scalars['DateTime']['input']>;
  targetAudience?: InputMaybe<Scalars['String']['input']>;
  targetDepartmentId?: InputMaybe<Scalars['ID']['input']>;
  targetLocationId?: InputMaybe<Scalars['ID']['input']>;
  targetRoleCode?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateEmployeeInput = {
  departmentId?: InputMaybe<Scalars['ID']['input']>;
  designationId?: InputMaybe<Scalars['ID']['input']>;
  employmentType?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  lastName?: InputMaybe<Scalars['String']['input']>;
  /** Optional linked login email. Omit to leave unchanged; pass an empty string to clear it. */
  linkedUserEmail?: InputMaybe<Scalars['String']['input']>;
  /** Omitted = leave unchanged; `null` = clear manager; id = set manager (cycle-safe). */
  reportingManagerId?: InputMaybe<Scalars['ID']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};

export type UpdateEmployeePersonalProfileInput = {
  bloodGroup?: InputMaybe<Scalars['String']['input']>;
  dateOfBirth?: InputMaybe<Scalars['NaiveDate']['input']>;
  emergencyContactName?: InputMaybe<Scalars['String']['input']>;
  emergencyContactPhone?: InputMaybe<Scalars['String']['input']>;
  emergencyContactRelation?: InputMaybe<Scalars['String']['input']>;
  employeeId: Scalars['ID']['input'];
  firstName?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  nationality?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateEmployeeSelfServiceProfileInput = {
  bloodGroup?: InputMaybe<Scalars['String']['input']>;
  currentAddress?: InputMaybe<Scalars['String']['input']>;
  emergencyContactName?: InputMaybe<Scalars['String']['input']>;
  emergencyContactPhone?: InputMaybe<Scalars['String']['input']>;
  emergencyContactRelation?: InputMaybe<Scalars['String']['input']>;
  employeeId: Scalars['ID']['input'];
  gender?: InputMaybe<Scalars['String']['input']>;
  nationality?: InputMaybe<Scalars['String']['input']>;
  permanentAddress?: InputMaybe<Scalars['String']['input']>;
  personalPhone?: InputMaybe<Scalars['String']['input']>;
};

/** Update an existing completed attendance segment after client-side review. */
export type UpdateManualAttendanceSegmentInput = {
  checkInTime: Scalars['NaiveTime']['input'];
  checkOutTime: Scalars['NaiveTime']['input'];
  id: Scalars['ID']['input'];
  workDate: Scalars['NaiveDate']['input'];
};

export type UpdateNotificationAdminInput = {
  actionUrl?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  kind?: InputMaybe<Scalars['String']['input']>;
  message?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateNotificationPreferencesInput = {
  announcementsEnabled: Scalars['Boolean']['input'];
  inAppEnabled: Scalars['Boolean']['input'];
  mutedTopics: Array<Scalars['String']['input']>;
};

export type UpdateTenantInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  plan?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  tenantId: Scalars['ID']['input'];
};

export type UpdateTimesheetEntryInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  hoursWorked: Scalars['String']['input'];
  id: Scalars['ID']['input'];
  projectCode?: InputMaybe<Scalars['String']['input']>;
  workDate: Scalars['NaiveDate']['input'];
};

export type UploadEmployeeDocumentInput = {
  /** Standard base64 (not data-URL). Max ~6MB decoded. */
  contentBase64: Scalars['String']['input'];
  documentTypeId: Scalars['ID']['input'];
  employeeId: Scalars['ID']['input'];
  fileName: Scalars['String']['input'];
  mimeType?: InputMaybe<Scalars['String']['input']>;
};

export type UploadTenantFileInput = {
  /** Standard base64 (not data-URL). Max ~6MB decoded. */
  contentBase64: Scalars['String']['input'];
  fileName: Scalars['String']['input'];
  mimeType?: InputMaybe<Scalars['String']['input']>;
};

export type UploadedTenantFile = {
  __typename?: 'UploadedTenantFile';
  createdAt: Scalars['DateTime']['output'];
  fileSizeBytes?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  mimeType?: Maybe<Scalars['String']['output']>;
  originalFileName?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['ID']['output'];
};

export type UpsertAttendanceAdjustmentPolicyInput = {
  maxSelfAdjustDays: Scalars['Int']['input'];
};

export type UpsertAttendancePunchPolicyInput = {
  ipAllowlist?: InputMaybe<Scalars['String']['input']>;
  isEnforced: Scalars['Boolean']['input'];
  maxDistanceMeters?: InputMaybe<Scalars['Int']['input']>;
  siteLatitude?: InputMaybe<Scalars['Float']['input']>;
  siteLongitude?: InputMaybe<Scalars['Float']['input']>;
};

export type UpsertEmployeeEducationInput = {
  boardUniversity?: InputMaybe<Scalars['String']['input']>;
  completionYear: Scalars['Int']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  educationLevel: Scalars['String']['input'];
  employeeId: Scalars['ID']['input'];
  fieldOfStudy?: InputMaybe<Scalars['String']['input']>;
  gradeScore?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  institution: Scalars['String']['input'];
  qualification: Scalars['String']['input'];
  startDate?: InputMaybe<Scalars['NaiveDate']['input']>;
};

export type UpsertEmployeePrimaryAadhaarInput = {
  /** Last 4 digits, or full 12-digit number (spaces allowed); only last 4 are stored. */
  aadhaarNumber: Scalars['String']['input'];
  employeeId: Scalars['ID']['input'];
};

export type UpsertEmployeePrimaryBankInput = {
  accountNumber: Scalars['String']['input'];
  accountType?: InputMaybe<Scalars['String']['input']>;
  bankName: Scalars['String']['input'];
  employeeId: Scalars['ID']['input'];
  ifscCode: Scalars['String']['input'];
};

export type UpsertEmployeePrimaryPanInput = {
  employeeId: Scalars['ID']['input'];
  /** 10-character Indian PAN (letters + digits), case-insensitive. */
  panNumber: Scalars['String']['input'];
};

export type UpsertEmployeeWorkExperienceInput = {
  company: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  employeeId: Scalars['ID']['input'];
  employmentType?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  isCurrent: Scalars['Boolean']['input'];
  location?: InputMaybe<Scalars['String']['input']>;
  roleTitle: Scalars['String']['input'];
  startDate: Scalars['NaiveDate']['input'];
};

export type UpsertExpenseCategoryAdminInput = {
  code: Scalars['String']['input'];
  /** When **`None`**, creates a category; otherwise updates that tenant row. */
  id?: InputMaybe<Scalars['ID']['input']>;
  /** Optional decimal string ceiling per claim; omit/`null`/empty clears the cap. */
  maxAmountPerClaim?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type UpsertExpensePolicyAdminInput = {
  applicableTo: Scalars['String']['input'];
  approvalRequired: Scalars['Boolean']['input'];
  departmentId?: InputMaybe<Scalars['ID']['input']>;
  designationId?: InputMaybe<Scalars['ID']['input']>;
  expenseCategoryId: Scalars['ID']['input'];
  id?: InputMaybe<Scalars['ID']['input']>;
  limitPerDay?: InputMaybe<Scalars['String']['input']>;
  limitPerMonth?: InputMaybe<Scalars['String']['input']>;
  maxAmountPerClaim?: InputMaybe<Scalars['String']['input']>;
  receiptRequired: Scalars['Boolean']['input'];
  roleId?: InputMaybe<Scalars['ID']['input']>;
};

export type UpsertFnfSettlementInput = {
  bonusPayable?: InputMaybe<Scalars['String']['input']>;
  gratuityAmount?: InputMaybe<Scalars['String']['input']>;
  /** Decimal as string, e.g. "12500.50". Omit or empty to clear. */
  leaveEncashment?: InputMaybe<Scalars['String']['input']>;
  recoveryAmount?: InputMaybe<Scalars['String']['input']>;
  separationId: Scalars['ID']['input'];
};

export type UpsertHolidayCalendarInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  locationId?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  year: Scalars['Int']['input'];
};

export type UpsertHolidayDayInput = {
  calendarId: Scalars['ID']['input'];
  holidayDate: Scalars['NaiveDate']['input'];
  holidayType?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
};

export type UpsertLeaveBalanceInput = {
  carriedForwardDays: Scalars['String']['input'];
  employeeId: Scalars['ID']['input'];
  entitledDays: Scalars['String']['input'];
  leaveTypeId: Scalars['ID']['input'];
  pendingDays: Scalars['String']['input'];
  usedDays: Scalars['String']['input'];
  year: Scalars['Int']['input'];
};

export type UpsertLeavePolicyInput = {
  accrualDays?: InputMaybe<Scalars['String']['input']>;
  accrualFrequency?: InputMaybe<Scalars['String']['input']>;
  annualEntitlement?: InputMaybe<Scalars['Int']['input']>;
  applicableTo?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  leaveTypeId: Scalars['ID']['input'];
  maxConsecutiveDays?: InputMaybe<Scalars['Int']['input']>;
  minNoticeDays?: InputMaybe<Scalars['Int']['input']>;
};

export type UpsertLeaveTypeInput = {
  carryForward: Scalars['Boolean']['input'];
  code: Scalars['String']['input'];
  halfDayAllowed: Scalars['Boolean']['input'];
  id?: InputMaybe<Scalars['ID']['input']>;
  isPaid: Scalars['Boolean']['input'];
  maxCarryForwardDays?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
  requiresDocument: Scalars['Boolean']['input'];
  sandwichRule: Scalars['Boolean']['input'];
};

export type UpsertPayrollComplianceSettingInput = {
  arrearSalaryComponentCode?: InputMaybe<Scalars['String']['input']>;
  baseSalaryComponentCode?: InputMaybe<Scalars['String']['input']>;
  employerLegalName?: InputMaybe<Scalars['String']['input']>;
  employerTan?: InputMaybe<Scalars['String']['input']>;
  payslipHeaderTitle?: InputMaybe<Scalars['String']['input']>;
  payslipLogoFileStorageId?: InputMaybe<Scalars['ID']['input']>;
};

export type UpsertSalaryComponentInput = {
  code: Scalars['String']['input'];
  componentType: Scalars['String']['input'];
  formulaExpression?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  isActive: Scalars['Boolean']['input'];
  isFixed: Scalars['Boolean']['input'];
  isTaxable: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
};

export type UpsertSalaryStructureInput = {
  components: Array<SalaryStructureComponentInput>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
};

export type UpsertTaxComputationInput = {
  finalTax?: InputMaybe<Scalars['String']['input']>;
  fiscalYear: Scalars['Int']['input'];
  grossIncome?: InputMaybe<Scalars['String']['input']>;
  taxConfigVersionId: Scalars['ID']['input'];
  taxRegimeChosen?: InputMaybe<Scalars['String']['input']>;
  taxableIncome?: InputMaybe<Scalars['String']['input']>;
  tdsPerMonth?: InputMaybe<Scalars['String']['input']>;
  totalDeductions?: InputMaybe<Scalars['String']['input']>;
};

export type UpsertTaxConfigurationVersionInput = {
  countryCode: Scalars['String']['input'];
  fiscalYear: Scalars['Int']['input'];
  /** When set, updates that row (tenant must own it). */
  id?: InputMaybe<Scalars['ID']['input']>;
  isActive: Scalars['Boolean']['input'];
  regime?: InputMaybe<Scalars['String']['input']>;
};

export type UpsertTaxSectionDefinitionInput = {
  /** ISO-ish country marker; omit or blank for **IN**. */
  countryCode?: InputMaybe<Scalars['String']['input']>;
  displayOrder?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  maxDeductionAmount?: InputMaybe<Scalars['String']['input']>;
  regimeScope?: InputMaybe<Scalars['String']['input']>;
  sectionCode: Scalars['String']['input'];
  sectionLabel: Scalars['String']['input'];
};

export type UpsertTaxSlabInput = {
  cessRate?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  incomeFrom: Scalars['String']['input'];
  incomeTo?: InputMaybe<Scalars['String']['input']>;
  surchargeRate?: InputMaybe<Scalars['String']['input']>;
  taxConfigVersionId: Scalars['ID']['input'];
  taxRate?: InputMaybe<Scalars['String']['input']>;
};

export type UpsertTenantSubscriptionInput = {
  activatedAt?: InputMaybe<Scalars['NaiveDate']['input']>;
  contractedSeats: Scalars['Int']['input'];
  expiresAt?: InputMaybe<Scalars['NaiveDate']['input']>;
  moduleId: Scalars['ID']['input'];
  overagePolicy?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  tenantId: Scalars['ID']['input'];
};

export type UpsertTimesheetLockPolicyInput = {
  editableWeekSpan: Scalars['Int']['input'];
  lockApprovedEntries: Scalars['Boolean']['input'];
};

export type WebhookDeliveryLogRow = {
  __typename?: 'WebhookDeliveryLogRow';
  attemptNumber: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  deliveredAt: Scalars['DateTime']['output'];
  eventName?: Maybe<Scalars['String']['output']>;
  httpStatus?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  isSuccess: Scalars['Boolean']['output'];
  payloadJson?: Maybe<Scalars['String']['output']>;
  responseBody?: Maybe<Scalars['String']['output']>;
  webhookSubscriptionId: Scalars['ID']['output'];
};

export type WebhookSubscriptionRow = {
  __typename?: 'WebhookSubscriptionRow';
  createdAt: Scalars['DateTime']['output'];
  endpointUrl: Scalars['String']['output'];
  eventName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  /** Stored as SHA256 hex (`None` when no signing secret configured). */
  secretHash?: Maybe<Scalars['String']['output']>;
};

export type Workflow = {
  __typename?: 'Workflow';
  createdAt: Scalars['DateTime']['output'];
  entityType: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type WorkflowInstance = {
  __typename?: 'WorkflowInstance';
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  currentStepId?: Maybe<Scalars['ID']['output']>;
  entityId: Scalars['ID']['output'];
  entityType: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  status: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  workflowId: Scalars['ID']['output'];
};

/** One node in a workflow graph (**reorder** + **delete step** exposed to admins; richer designer later). */
export type WorkflowStep = {
  __typename?: 'WorkflowStep';
  approverRoleId?: Maybe<Scalars['ID']['output']>;
  approverType?: Maybe<Scalars['String']['output']>;
  canSkip: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  sequenceOrder: Scalars['Int']['output'];
  slaHours?: Maybe<Scalars['Int']['output']>;
  stepName: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
  workflowId: Scalars['ID']['output'];
};

/** Workflow definition + ordered steps (for a designer-style board). */
export type WorkflowWithSteps = {
  __typename?: 'WorkflowWithSteps';
  steps: Array<WorkflowStep>;
  workflow: Workflow;
};

export type WorkforceSnapshotRow = {
  __typename?: 'WorkforceSnapshotRow';
  activeEmployees?: Maybe<Scalars['Int']['output']>;
  attritionRate?: Maybe<Scalars['String']['output']>;
  averageTenureMonths?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  newJoiners?: Maybe<Scalars['Int']['output']>;
  openPositions?: Maybe<Scalars['Int']['output']>;
  separations?: Maybe<Scalars['Int']['output']>;
  snapshotDate: Scalars['NaiveDate']['output'];
  totalHeadcount?: Maybe<Scalars['Int']['output']>;
};

export type _Entity = Employee;

export type _Service = {
  __typename?: '_Service';
  sdl?: Maybe<Scalars['String']['output']>;
};

export type LeaveBalancesQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
  year?: InputMaybe<Scalars['Int']['input']>;
}>;


export type LeaveBalancesQuery = { __typename?: 'Query', leaveBalances: Array<{ __typename?: 'LeaveBalance', id: string, leaveTypeId: string, year: number, balanceDays: string, entitledDays: string, pendingDays: string, usedDays: string, carriedForwardDays: string }> };

export type ClientOpsUpcomingHolidaysQueryVariables = Exact<{
  fromDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  limit?: Scalars['Int']['input'];
}>;


export type ClientOpsUpcomingHolidaysQuery = { __typename?: 'Query', upcomingHolidays: Array<{ __typename?: 'HolidayEntry', id: string, holidayDate: any, name: string, calendarName: string, holidayType?: string | null }> };

export type TimesheetRowsQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type TimesheetRowsQuery = { __typename?: 'Query', timesheetEntries: Array<{ __typename?: 'TimesheetEntry', id: string, workDate: any, hoursWorked: string, projectCode?: string | null, description?: string | null, status: string, batchId?: string | null }> };

export type SubmitTimesheetWeekMutationVariables = Exact<{
  weekStartDate: Scalars['NaiveDate']['input'];
}>;


export type SubmitTimesheetWeekMutation = { __typename?: 'Mutation', submitTimesheetWeek: { __typename?: 'TimesheetWeekBatch', id: string, employeeId: string, weekStartDate: any, status: string, workflowInstanceId?: string | null, submittedAt?: any | null } };

export type UpdateTimesheetEntryMutationVariables = Exact<{
  input: UpdateTimesheetEntryInput;
}>;


export type UpdateTimesheetEntryMutation = { __typename?: 'Mutation', updateTimesheetEntry: { __typename?: 'TimesheetEntry', id: string, workDate: any, hoursWorked: string, projectCode?: string | null, description?: string | null, status: string, batchId?: string | null } };

export type TimesheetProjectsQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type TimesheetProjectsQuery = { __typename?: 'Query', timesheetProjects: Array<{ __typename?: 'TimesheetProjectOption', code: string, name: string }> };

export type TimesheetProjectsForEmployeeQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
  employeeId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type TimesheetProjectsForEmployeeQuery = { __typename?: 'Query', timesheetProjectsForEmployee: Array<{ __typename?: 'TimesheetProjectOption', code: string, name: string }> };

export type EmployeeTimesheetProjectCodesQueryVariables = Exact<{
  employeeId: Scalars['ID']['input'];
}>;


export type EmployeeTimesheetProjectCodesQuery = { __typename?: 'Query', employeeTimesheetProjectCodes: Array<string> };

export type SetEmployeeTimesheetProjectsMutationVariables = Exact<{
  employeeId: Scalars['ID']['input'];
  projectCodes: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type SetEmployeeTimesheetProjectsMutation = { __typename?: 'Mutation', setEmployeeTimesheetProjects: boolean };

export type TimesheetTaskTypesQueryVariables = Exact<{
  projectCode: Scalars['String']['input'];
}>;


export type TimesheetTaskTypesQuery = { __typename?: 'Query', timesheetTaskTypes: Array<string> };

export type AttendanceAdjustmentPolicyQueryVariables = Exact<{ [key: string]: never; }>;


export type AttendanceAdjustmentPolicyQuery = { __typename?: 'Query', attendanceAdjustmentPolicy: { __typename?: 'AttendanceAdjustmentPolicy', maxSelfAdjustDays: number } };

export type TimesheetLockPolicyQueryVariables = Exact<{ [key: string]: never; }>;


export type TimesheetLockPolicyQuery = { __typename?: 'Query', timesheetLockPolicy: { __typename?: 'TimesheetLockPolicy', editableWeekSpan: number, lockApprovedEntries: boolean } };

export type TimesheetWeekBatchesQueryVariables = Exact<{
  status?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
}>;


export type TimesheetWeekBatchesQuery = { __typename?: 'Query', timesheetWeekBatches: Array<{ __typename?: 'TimesheetWeekBatch', id: string, employeeId: string, weekStartDate: any, status: string, submittedAt?: any | null, workflowInstanceId?: string | null, pendingApprovalStage?: string | null, viewerMayApprove: boolean }> };

export type ApproveTimesheetWeekBatchMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ApproveTimesheetWeekBatchMutation = { __typename?: 'Mutation', approveTimesheetWeekBatch: { __typename?: 'TimesheetWeekBatch', id: string, status: string, employeeId: string, weekStartDate: any, workflowInstanceId?: string | null } };

export type RejectTimesheetWeekBatchMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  rejectionReason?: InputMaybe<Scalars['String']['input']>;
}>;


export type RejectTimesheetWeekBatchMutation = { __typename?: 'Mutation', rejectTimesheetWeekBatch: boolean };

export type UpsertAttendanceAdjustmentPolicyHrMutationVariables = Exact<{
  input: UpsertAttendanceAdjustmentPolicyInput;
}>;


export type UpsertAttendanceAdjustmentPolicyHrMutation = { __typename?: 'Mutation', upsertAttendanceAdjustmentPolicy: { __typename?: 'AttendanceAdjustmentPolicy', maxSelfAdjustDays: number } };

export type UpsertTimesheetLockPolicyHrMutationVariables = Exact<{
  input: UpsertTimesheetLockPolicyInput;
}>;


export type UpsertTimesheetLockPolicyHrMutation = { __typename?: 'Mutation', upsertTimesheetLockPolicy: { __typename?: 'TimesheetLockPolicy', editableWeekSpan: number, lockApprovedEntries: boolean } };

export type UpsertTimesheetProjectHrMutationVariables = Exact<{
  code: Scalars['String']['input'];
  name: Scalars['String']['input'];
  displayOrder?: InputMaybe<Scalars['Int']['input']>;
}>;


export type UpsertTimesheetProjectHrMutation = { __typename?: 'Mutation', upsertTimesheetProject: boolean };

export type UpsertTimesheetTaskTypesHrMutationVariables = Exact<{
  projectCode: Scalars['String']['input'];
  taskCodes: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type UpsertTimesheetTaskTypesHrMutation = { __typename?: 'Mutation', upsertTimesheetTaskTypes: boolean };

export type TaxComputationsListQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type TaxComputationsListQuery = { __typename?: 'Query', taxComputations: Array<{ __typename?: 'TaxComputation', id: string, fiscalYear: number, taxConfigVersionId: string, taxRegimeChosen?: string | null, grossIncome?: string | null, totalDeductions?: string | null, taxableIncome?: string | null, finalTax?: string | null, tdsPerMonth?: string | null, computedAt: any }> };

export type TaxProofLinesQueryVariables = Exact<{
  employeeId?: InputMaybe<Scalars['ID']['input']>;
  taxConfigVersionId?: InputMaybe<Scalars['ID']['input']>;
  fiscalYear?: InputMaybe<Scalars['Int']['input']>;
}>;


export type TaxProofLinesQuery = { __typename?: 'Query', taxProofLines: Array<{ __typename?: 'TaxProofLine', id: string, sectionCode: string, declaredAmount: string, actualAmount: string, status: string, fileStorageId?: string | null, rejectionReason?: string | null, fiscalYear: number }> };

export type OrgDocumentsListQueryVariables = Exact<{
  tlim?: Scalars['Int']['input'];
  dlim?: Scalars['Int']['input'];
}>;


export type OrgDocumentsListQuery = { __typename?: 'Query', companyDocuments: Array<{ __typename?: 'CompanyDocument', id: string, category: string, title: string, description?: string | null, fileStorageId: string, originalFileName?: string | null, mimeType?: string | null, fileSizeBytes?: number | null, status: string, visibleToEmployees: boolean, uploadedByUserId?: string | null, createdAt: any, updatedAt: any }>, documentTypes: Array<{ __typename?: 'DocumentType', id: string, name: string, category?: string | null, isRequired: boolean }>, employeeDocuments: Array<{ __typename?: 'EmployeeDocument', id: string, documentTypeId: string, status: string, uploadedAt: any, expiryDate?: any | null }> };

export type ClientOpsPayslipsListQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type ClientOpsPayslipsListQuery = { __typename?: 'Query', payslips: Array<{ __typename?: 'Payslip', id: string, netSalary: string, grossSalary: string, totalDeductions: string, status: string, generatedAt: any, lines: Array<{ __typename?: 'PayslipComponentLine', id: string, salaryComponentId: string, amount: string, componentType?: string | null }> }> };

export type IndiaTdsMonthlySummaryCsvQueryVariables = Exact<{
  month: Scalars['Int']['input'];
  year: Scalars['Int']['input'];
}>;


export type IndiaTdsMonthlySummaryCsvQuery = { __typename?: 'Query', indiaTdsMonthlySummaryCsv: string };

export type IndiaPfEsiMonthlySummaryCsvQueryVariables = Exact<{
  month: Scalars['Int']['input'];
  year: Scalars['Int']['input'];
}>;


export type IndiaPfEsiMonthlySummaryCsvQuery = { __typename?: 'Query', indiaPfEsiMonthlySummaryCsv: string };

export type PayrollBankTransferCsvQueryVariables = Exact<{
  month: Scalars['Int']['input'];
  year: Scalars['Int']['input'];
}>;


export type PayrollBankTransferCsvQuery = { __typename?: 'Query', payrollBankTransferCsv: string };

export type PayrollIndiaBulkNeftCreditCsvQueryVariables = Exact<{
  month: Scalars['Int']['input'];
  year: Scalars['Int']['input'];
}>;


export type PayrollIndiaBulkNeftCreditCsvQuery = { __typename?: 'Query', payrollIndiaBulkNeftCreditCsv: string };

export type IndiaFyPayrollEmployeeTotalsCsvQueryVariables = Exact<{
  fyStartYear: Scalars['Int']['input'];
}>;


export type IndiaFyPayrollEmployeeTotalsCsvQuery = { __typename?: 'Query', indiaFyPayrollEmployeeTotalsCsv: string };

export type IndiaFyQuarterPayrollEmployeeTotalsCsvQueryVariables = Exact<{
  fyStartYear: Scalars['Int']['input'];
  quarter: Scalars['Int']['input'];
}>;


export type IndiaFyQuarterPayrollEmployeeTotalsCsvQuery = { __typename?: 'Query', indiaFyQuarterPayrollEmployeeTotalsCsv: string };

export type IndiaForm16PartBFyPrepStubCsvQueryVariables = Exact<{
  fyStartYear: Scalars['Int']['input'];
}>;


export type IndiaForm16PartBFyPrepStubCsvQuery = { __typename?: 'Query', indiaForm16PartBFyPrepStubCsv: string };

export type IndiaForm24qSalaryPaymentMonthlyStubCsvQueryVariables = Exact<{
  month: Scalars['Int']['input'];
  year: Scalars['Int']['input'];
}>;


export type IndiaForm24qSalaryPaymentMonthlyStubCsvQuery = { __typename?: 'Query', indiaForm24qSalaryPaymentMonthlyStubCsv: string };

export type PayrollComplianceSettingQueryVariables = Exact<{ [key: string]: never; }>;


export type PayrollComplianceSettingQuery = { __typename?: 'Query', payrollComplianceSetting?: { __typename?: 'PayrollComplianceSetting', employerTan?: string | null, employerLegalName?: string | null, baseSalaryComponentCode: string, arrearSalaryComponentCode: string, payslipHeaderTitle?: string | null, payslipLogoFileStorageId?: string | null } | null };

export type PayslipLogoSignedReadUrlQueryVariables = Exact<{
  fileStorageId: Scalars['ID']['input'];
  ttlSeconds?: InputMaybe<Scalars['Int']['input']>;
}>;


export type PayslipLogoSignedReadUrlQuery = { __typename?: 'Query', payslipLogoSignedReadUrl: string };

export type UpsertPayrollComplianceSettingMutationVariables = Exact<{
  input: UpsertPayrollComplianceSettingInput;
}>;


export type UpsertPayrollComplianceSettingMutation = { __typename?: 'Mutation', upsertPayrollComplianceSetting: { __typename?: 'PayrollComplianceSetting', employerTan?: string | null, employerLegalName?: string | null, baseSalaryComponentCode: string, arrearSalaryComponentCode: string, payslipHeaderTitle?: string | null, payslipLogoFileStorageId?: string | null } };

export type TaxSectionDefinitionsQueryVariables = Exact<{
  activeOnly?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type TaxSectionDefinitionsQuery = { __typename?: 'Query', taxSectionDefinitions: Array<{ __typename?: 'TaxSectionDefinition', id: string, sectionCode: string, sectionLabel: string, regimeScope?: string | null, countryCode: string, displayOrder: number, isActive: boolean, maxDeductionAmount?: string | null }> };

export type UpsertTaxSectionDefinitionMutationVariables = Exact<{
  input: UpsertTaxSectionDefinitionInput;
}>;


export type UpsertTaxSectionDefinitionMutation = { __typename?: 'Mutation', upsertTaxSectionDefinition: { __typename?: 'TaxSectionDefinition', id: string, sectionCode: string, sectionLabel: string, regimeScope?: string | null } };

export type UpsertTaxConfigurationVersionMutationVariables = Exact<{
  input: UpsertTaxConfigurationVersionInput;
}>;


export type UpsertTaxConfigurationVersionMutation = { __typename?: 'Mutation', upsertTaxConfigurationVersion: { __typename?: 'TaxConfigurationVersion', id: string, fiscalYear: number, regime?: string | null, countryCode: string, isActive: boolean } };

export type UpsertTaxSlabMutationVariables = Exact<{
  input: UpsertTaxSlabInput;
}>;


export type UpsertTaxSlabMutation = { __typename?: 'Mutation', upsertTaxSlab: { __typename?: 'TaxSlab', id: string, taxConfigVersionId: string, incomeFrom: string, incomeTo?: string | null, taxRate?: string | null, surchargeRate?: string | null, cessRate?: string | null } };

export type IndiaEpfMonthlyEcrPrepStubCsvQueryVariables = Exact<{
  month: Scalars['Int']['input'];
  year: Scalars['Int']['input'];
}>;


export type IndiaEpfMonthlyEcrPrepStubCsvQuery = { __typename?: 'Query', indiaEpfMonthlyEcrPrepStubCsv: string };

export type RunPayrollForCycleMutationVariables = Exact<{
  payrollCycleId: Scalars['ID']['input'];
}>;


export type RunPayrollForCycleMutation = { __typename?: 'Mutation', runPayrollForCycle: { __typename?: 'PayrollCycle', id: string, status: string, month: number, year: number, name: string } };

export type CreatePayrollCycleMutationVariables = Exact<{
  input: CreatePayrollCycleInput;
}>;


export type CreatePayrollCycleMutation = { __typename?: 'Mutation', createPayrollCycle: { __typename?: 'PayrollCycle', id: string, status: string, month: number, year: number, name: string, paymentDate?: any | null } };

export type SubmitLeaveRequestMutationVariables = Exact<{
  input: SubmitLeaveRequestInput;
}>;


export type SubmitLeaveRequestMutation = { __typename?: 'Mutation', submitLeaveRequest: { __typename?: 'LeaveRequest', id: string, status: string, fromDate: any, toDate: any, daysRequested: string, workflowInstanceId?: string | null } };

export type ApproveLeaveRequestMutationVariables = Exact<{
  leaveRequestId: Scalars['ID']['input'];
}>;


export type ApproveLeaveRequestMutation = { __typename?: 'Mutation', approveLeaveRequest: { __typename?: 'LeaveRequest', id: string, status: string, employeeId: string, fromDate: any, toDate: any, daysRequested: string, workflowInstanceId?: string | null } };

export type RejectLeaveRequestMutationVariables = Exact<{
  leaveRequestId: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
}>;


export type RejectLeaveRequestMutation = { __typename?: 'Mutation', rejectLeaveRequest: { __typename?: 'LeaveRequest', id: string, status: string, reason?: string | null, workflowInstanceId?: string | null } };

export type CancelLeaveRequestMutationVariables = Exact<{
  leaveRequestId: Scalars['ID']['input'];
}>;


export type CancelLeaveRequestMutation = { __typename?: 'Mutation', cancelLeaveRequest: { __typename?: 'LeaveRequest', id: string, status: string, employeeId: string } };

export type UpsertLeaveTypeAdminMutationVariables = Exact<{
  input: UpsertLeaveTypeInput;
}>;


export type UpsertLeaveTypeAdminMutation = { __typename?: 'Mutation', upsertLeaveType: { __typename?: 'LeaveType', id: string, name: string, code: string, isPaid: boolean, carryForward: boolean, sandwichRule: boolean, halfDayAllowed: boolean, requiresDocument: boolean } };

export type DeleteLeaveTypeAdminMutationVariables = Exact<{
  leaveTypeId: Scalars['ID']['input'];
}>;


export type DeleteLeaveTypeAdminMutation = { __typename?: 'Mutation', deleteLeaveType: { __typename?: 'LeaveType', id: string, name: string, code: string } };

export type UpsertLeavePolicyAdminMutationVariables = Exact<{
  input: UpsertLeavePolicyInput;
}>;


export type UpsertLeavePolicyAdminMutation = { __typename?: 'Mutation', upsertLeavePolicy: { __typename?: 'LeavePolicy', id: string, leaveTypeId: string, annualEntitlement?: number | null, accrualFrequency?: string | null, accrualDays?: string | null, maxConsecutiveDays?: number | null, minNoticeDays?: number | null } };

export type DeleteLeavePolicyAdminMutationVariables = Exact<{
  leavePolicyId: Scalars['ID']['input'];
}>;


export type DeleteLeavePolicyAdminMutation = { __typename?: 'Mutation', deleteLeavePolicy: boolean };

export type UpsertLeaveBalanceAdminMutationVariables = Exact<{
  input: UpsertLeaveBalanceInput;
}>;


export type UpsertLeaveBalanceAdminMutation = { __typename?: 'Mutation', upsertLeaveBalance: { __typename?: 'LeaveBalance', id: string, employeeId: string, leaveTypeId: string, year: number, entitledDays: string, balanceDays: string, pendingDays: string, usedDays: string } };

export type AdjustLeaveBalanceEntitlementAdminMutationVariables = Exact<{
  input: AdjustLeaveBalanceEntitlementInput;
}>;


export type AdjustLeaveBalanceEntitlementAdminMutation = { __typename?: 'Mutation', adjustLeaveBalanceEntitlement: { __typename?: 'LeaveBalance', id: string, entitledDays: string, balanceDays: string } };

export type ProvisionLeaveBalancesFromPoliciesMutationVariables = Exact<{
  year: Scalars['Int']['input'];
}>;


export type ProvisionLeaveBalancesFromPoliciesMutation = { __typename?: 'Mutation', provisionLeaveBalancesFromPolicies: number };

export type UpsertHolidayCalendarAdminMutationVariables = Exact<{
  input: UpsertHolidayCalendarInput;
}>;


export type UpsertHolidayCalendarAdminMutation = { __typename?: 'Mutation', upsertHolidayCalendar: { __typename?: 'HolidayCalendar', id: string, name: string, year: number } };

export type DeleteHolidayCalendarAdminMutationVariables = Exact<{
  calendarId: Scalars['ID']['input'];
}>;


export type DeleteHolidayCalendarAdminMutation = { __typename?: 'Mutation', deleteHolidayCalendar: boolean };

export type UpsertHolidayDayAdminMutationVariables = Exact<{
  input: UpsertHolidayDayInput;
}>;


export type UpsertHolidayDayAdminMutation = { __typename?: 'Mutation', upsertHolidayDay: { __typename?: 'HolidayDay', id: string, calendarId: string, holidayDate: any, name: string } };

export type DeleteHolidayDayAdminMutationVariables = Exact<{
  holidayId: Scalars['ID']['input'];
}>;


export type DeleteHolidayDayAdminMutation = { __typename?: 'Mutation', deleteHolidayDay: boolean };

export type SubmitExpenseMutationVariables = Exact<{
  input: SubmitExpenseInput;
}>;


export type SubmitExpenseMutation = { __typename?: 'Mutation', submitExpense: { __typename?: 'Expense', id: string, status: string, amount: string, title: string, workflowInstanceId?: string | null, paymentStatus: string, receiptFileStorageId?: string | null } };

export type CreatePayrollArrearMutationVariables = Exact<{
  input: CreatePayrollArrearInput;
}>;


export type CreatePayrollArrearMutation = { __typename?: 'Mutation', createPayrollArrear: { __typename?: 'PayrollArrear', id: string, employeeId: string, amount: string, status: string } };

export type ApproveExpenseMutationVariables = Exact<{
  expenseId: Scalars['ID']['input'];
  approvedAmount?: InputMaybe<Scalars['String']['input']>;
}>;


export type ApproveExpenseMutation = { __typename?: 'Mutation', approveExpense: { __typename?: 'Expense', id: string, status: string, amount: string, title: string, workflowInstanceId?: string | null, approvedAmount?: string | null, paymentStatus: string } };

export type MarkExpensePaymentStatusMutationVariables = Exact<{
  expenseId: Scalars['ID']['input'];
  paymentStatus: Scalars['String']['input'];
  paymentReference?: InputMaybe<Scalars['String']['input']>;
}>;


export type MarkExpensePaymentStatusMutation = { __typename?: 'Mutation', markExpensePaymentStatus: { __typename?: 'Expense', id: string, status: string, amount: string, approvedAmount?: string | null, paymentStatus: string, paidAt?: any | null, paymentReference?: string | null } };

export type RejectExpenseMutationVariables = Exact<{
  expenseId: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
}>;


export type RejectExpenseMutation = { __typename?: 'Mutation', rejectExpense: { __typename?: 'Expense', id: string, status: string, title: string, workflowInstanceId?: string | null, paymentStatus: string } };

export type SubmitTravelRequestMutationVariables = Exact<{
  input: SubmitTravelRequestInput;
}>;


export type SubmitTravelRequestMutation = { __typename?: 'Mutation', submitTravelRequest: { __typename?: 'TravelRequest', id: string, status: string, purpose: string, fromDate: any, toDate: any, workflowInstanceId?: string | null } };

export type ApproveTravelRequestMutationVariables = Exact<{
  travelRequestId: Scalars['ID']['input'];
}>;


export type ApproveTravelRequestMutation = { __typename?: 'Mutation', approveTravelRequest: { __typename?: 'TravelRequest', id: string, status: string, approvedBy?: string | null, rejectedBy?: string | null, rejectionReason?: string | null, workflowInstanceId?: string | null } };

export type RejectTravelRequestMutationVariables = Exact<{
  travelRequestId: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
}>;


export type RejectTravelRequestMutation = { __typename?: 'Mutation', rejectTravelRequest: { __typename?: 'TravelRequest', id: string, status: string, approvedBy?: string | null, rejectedBy?: string | null, rejectionReason?: string | null, workflowInstanceId?: string | null } };

export type UpsertExpenseCategoryAdminMutationVariables = Exact<{
  input: UpsertExpenseCategoryAdminInput;
}>;


export type UpsertExpenseCategoryAdminMutation = { __typename?: 'Mutation', upsertExpenseCategoryAdmin: { __typename?: 'ExpenseCategory', id: string, name: string, code: string, maxAmountPerClaim?: string | null, createdAt: any, updatedAt: any } };

export type DeleteExpenseCategoryAdminMutationVariables = Exact<{
  expenseCategoryId: Scalars['ID']['input'];
}>;


export type DeleteExpenseCategoryAdminMutation = { __typename?: 'Mutation', deleteExpenseCategoryAdmin: boolean };

export type UpsertExpensePolicyAdminMutationVariables = Exact<{
  input: UpsertExpensePolicyAdminInput;
}>;


export type UpsertExpensePolicyAdminMutation = { __typename?: 'Mutation', upsertExpensePolicyAdmin: { __typename?: 'ExpensePolicy', id: string, tenantId: string, expenseCategoryId: string, applicableTo: string, departmentId?: string | null, designationId?: string | null, roleId?: string | null, limitPerDay?: string | null, limitPerMonth?: string | null, maxAmountPerClaim?: string | null, receiptRequired: boolean, approvalRequired: boolean, createdAt: any, updatedAt: any } };

export type DeleteExpensePolicyAdminMutationVariables = Exact<{
  expensePolicyId: Scalars['ID']['input'];
}>;


export type DeleteExpensePolicyAdminMutation = { __typename?: 'Mutation', deleteExpensePolicyAdmin: boolean };

export type ExpenseSubmissionHintsQueryVariables = Exact<{
  expenseCategoryId: Scalars['ID']['input'];
}>;


export type ExpenseSubmissionHintsQuery = { __typename?: 'Query', expenseSubmissionHints: { __typename?: 'ExpenseSubmissionHints', expenseCategoryId: string, maxAmountPerClaim?: string | null, receiptRequired: boolean, limitPerMonth?: string | null, limitPerDay?: string | null } };

export type ExpensePoliciesForAdminQueryVariables = Exact<{
  expenseCategoryId: Scalars['ID']['input'];
}>;


export type ExpensePoliciesForAdminQuery = { __typename?: 'Query', expensePoliciesForAdmin: Array<{ __typename?: 'ExpensePolicy', id: string, applicableTo: string, departmentId?: string | null, designationId?: string | null, roleId?: string | null, limitPerDay?: string | null, limitPerMonth?: string | null, maxAmountPerClaim?: string | null, receiptRequired: boolean, approvalRequired: boolean }> };

export type AdminExpenseCategoriesQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type AdminExpenseCategoriesQuery = { __typename?: 'Query', expenseCategories: Array<{ __typename?: 'ExpenseCategory', id: string, name: string, code: string, maxAmountPerClaim?: string | null, createdAt: any, updatedAt: any }> };

export type MarkNotificationReadMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type MarkNotificationReadMutation = { __typename?: 'Mutation', markNotificationRead: { __typename?: 'Notification', id: string, isRead: boolean } };

export type MarkAllNotificationsReadMutationVariables = Exact<{ [key: string]: never; }>;


export type MarkAllNotificationsReadMutation = { __typename?: 'Mutation', markAllNotificationsRead: number };

export type PunchTodayMutationVariables = Exact<{
  input?: InputMaybe<PunchTodayInput>;
}>;


export type PunchTodayMutation = { __typename?: 'Mutation', punchToday: { __typename?: 'Attendance', id: string, workDate: any, checkInTime?: any | null, checkOutTime?: any | null, checkInLat?: string | null, checkInLng?: string | null, checkOutLat?: string | null, checkOutLng?: string | null, source?: string | null, status?: string | null } };

export type AddManualAttendanceSegmentMutationVariables = Exact<{
  input: AddManualAttendanceSegmentInput;
}>;


export type AddManualAttendanceSegmentMutation = { __typename?: 'Mutation', addManualAttendanceSegment: { __typename?: 'Attendance', id: string, workDate: any, checkInTime?: any | null, checkOutTime?: any | null, source?: string | null, status?: string | null } };

export type UpdateManualAttendanceSegmentMutationVariables = Exact<{
  input: UpdateManualAttendanceSegmentInput;
}>;


export type UpdateManualAttendanceSegmentMutation = { __typename?: 'Mutation', updateManualAttendanceSegment: { __typename?: 'Attendance', id: string, workDate: any, checkInTime?: any | null, checkOutTime?: any | null, source?: string | null, status?: string | null } };

export type CreateTimesheetEntryMutationVariables = Exact<{
  input: CreateTimesheetEntryInput;
}>;


export type CreateTimesheetEntryMutation = { __typename?: 'Mutation', createTimesheetEntry: { __typename?: 'TimesheetEntry', id: string, workDate: any, hoursWorked: string, projectCode?: string | null, status: string } };

export type DeleteTimesheetEntryMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteTimesheetEntryMutation = { __typename?: 'Mutation', deleteTimesheetEntry: boolean };

export type UpsertTaxComputationMutationVariables = Exact<{
  input: UpsertTaxComputationInput;
}>;


export type UpsertTaxComputationMutation = { __typename?: 'Mutation', upsertTaxComputation: { __typename?: 'TaxComputation', id: string, fiscalYear: number, taxRegimeChosen?: string | null } };

export type SubmitTaxProofLineMutationVariables = Exact<{
  input: SubmitTaxProofLineInput;
}>;


export type SubmitTaxProofLineMutation = { __typename?: 'Mutation', submitTaxProofLine: { __typename?: 'TaxProofLine', id: string, status: string, sectionCode: string, declaredAmount: string, actualAmount: string } };

export type ApproveTaxProofLineMutationVariables = Exact<{
  taxProofLineId: Scalars['ID']['input'];
}>;


export type ApproveTaxProofLineMutation = { __typename?: 'Mutation', approveTaxProofLine: { __typename?: 'TaxProofLine', id: string, status: string, sectionCode: string } };

export type RejectTaxProofLineMutationVariables = Exact<{
  taxProofLineId: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
}>;


export type RejectTaxProofLineMutation = { __typename?: 'Mutation', rejectTaxProofLine: { __typename?: 'TaxProofLine', id: string, status: string, sectionCode: string } };

export type CreateEmployeeMutationVariables = Exact<{
  input: CreateEmployeeInput;
}>;


export type CreateEmployeeMutation = { __typename?: 'Mutation', createEmployee: { __typename?: 'Employee', id: string, employeeCode: string, fullName: string, status: string, dateOfJoining: any, reportingManagerId?: string | null, userId?: string | null, linkedUserUsername?: string | null, linkedUserEmail?: string | null } };

export type ProvisionEmployeeLoginMutationVariables = Exact<{
  input: ProvisionEmployeeLoginInput;
}>;


export type ProvisionEmployeeLoginMutation = { __typename?: 'Mutation', provisionEmployeeLogin: { __typename?: 'Employee', id: string, userId?: string | null, linkedUserUsername?: string | null, linkedUserEmail?: string | null } };

export type ResetEmployeePasswordMutationVariables = Exact<{
  input: ResetEmployeePasswordInput;
}>;


export type ResetEmployeePasswordMutation = { __typename?: 'Mutation', resetEmployeePassword: boolean };

export type UpdateEmployeeMutationVariables = Exact<{
  input: UpdateEmployeeInput;
}>;


export type UpdateEmployeeMutation = { __typename?: 'Mutation', updateEmployee: { __typename?: 'Employee', id: string, employeeCode: string, fullName: string, status: string, dateOfJoining: any, departmentId?: string | null, designationId?: string | null, employmentType?: string | null, reportingManagerId?: string | null, linkedUserEmail?: string | null } };

export type CompanyDocumentAttachmentQueryVariables = Exact<{
  companyDocumentId: Scalars['ID']['input'];
}>;


export type CompanyDocumentAttachmentQuery = { __typename?: 'Query', companyDocumentAttachment: { __typename?: 'TenantFileAttachment', fileName: string, mimeType: string, fileSizeBytes?: number | null, contentBase64: string } };

export type UpdateEmployeePersonalProfileMutationVariables = Exact<{
  input: UpdateEmployeePersonalProfileInput;
}>;


export type UpdateEmployeePersonalProfileMutation = { __typename?: 'Mutation', updateEmployeePersonalProfile: { __typename?: 'Employee', id: string, firstName: string, lastName: string, fullName: string, dateOfBirth?: any | null, gender?: string | null, nationality?: string | null, bloodGroup?: string | null, emergencyContactName?: string | null, emergencyContactPhone?: string | null, emergencyContactRelation?: string | null } };

export type UpsertEmployeePrimaryBankMutationVariables = Exact<{
  input: UpsertEmployeePrimaryBankInput;
}>;


export type UpsertEmployeePrimaryBankMutation = { __typename?: 'Mutation', upsertEmployeePrimaryBank: { __typename?: 'EmployeeBankAccount', id: string, bankName: string, accountNumberMasked: string, ifscCode: string, accountType?: string | null, isVerified: boolean } };

export type UpsertEmployeePrimaryPanMutationVariables = Exact<{
  input: UpsertEmployeePrimaryPanInput;
}>;


export type UpsertEmployeePrimaryPanMutation = { __typename?: 'Mutation', upsertEmployeePrimaryPan: { __typename?: 'EmployeePanRecord', id: string, maskedPan: string, isVerified: boolean } };

export type UpsertEmployeePrimaryAadhaarMutationVariables = Exact<{
  input: UpsertEmployeePrimaryAadhaarInput;
}>;


export type UpsertEmployeePrimaryAadhaarMutation = { __typename?: 'Mutation', upsertEmployeePrimaryAadhaar: { __typename?: 'EmployeeAadhaarRecord', id: string, maskedAadhaar: string, isVerified: boolean } };

export type UploadEmployeeDocumentProfileMutationVariables = Exact<{
  input: UploadEmployeeDocumentInput;
}>;


export type UploadEmployeeDocumentProfileMutation = { __typename?: 'Mutation', uploadEmployeeDocument: { __typename?: 'EmployeeDocument', id: string, status: string, documentTypeId: string, originalFileName?: string | null, mimeType?: string | null, documentTypeName?: string | null, uploadedAt: any } };

export type UpdateEmployeeSelfServiceProfileMutationVariables = Exact<{
  input: UpdateEmployeeSelfServiceProfileInput;
}>;


export type UpdateEmployeeSelfServiceProfileMutation = { __typename?: 'Mutation', updateEmployeeSelfServiceProfile: { __typename?: 'Employee', id: string, gender?: string | null, nationality?: string | null, bloodGroup?: string | null, personalPhone?: string | null, currentAddress?: string | null, permanentAddress?: string | null, emergencyContactName?: string | null, emergencyContactPhone?: string | null, emergencyContactRelation?: string | null, updatedAt: any } };

export type SubmitEmployeeProfileChangeMutationVariables = Exact<{
  input: SubmitEmployeeProfileChangeInput;
}>;


export type SubmitEmployeeProfileChangeMutation = { __typename?: 'Mutation', submitEmployeeProfileChange: { __typename?: 'EmployeeProfileChangeRequest', id: string, requestType: string, status: string, requestedSummary: string, supportingDocumentId?: string | null, rejectionReason?: string | null, createdAt: any, updatedAt: any } };

export type CancelEmployeeProfileChangeMutationVariables = Exact<{
  requestId: Scalars['ID']['input'];
}>;


export type CancelEmployeeProfileChangeMutation = { __typename?: 'Mutation', cancelEmployeeProfileChange: { __typename?: 'EmployeeProfileChangeRequest', id: string, status: string, updatedAt: any } };

export type ResolveEmployeeProfileChangeMutationVariables = Exact<{
  requestId: Scalars['ID']['input'];
  approved: Scalars['Boolean']['input'];
  rejectionReason?: InputMaybe<Scalars['String']['input']>;
}>;


export type ResolveEmployeeProfileChangeMutation = { __typename?: 'Mutation', resolveEmployeeProfileChange: { __typename?: 'EmployeeProfileChangeRequest', id: string, status: string, requestedSummary: string, reviewedAt?: any | null, rejectionReason?: string | null, updatedAt: any } };

export type UpsertEmployeeEducationMutationVariables = Exact<{
  input: UpsertEmployeeEducationInput;
}>;


export type UpsertEmployeeEducationMutation = { __typename?: 'Mutation', upsertEmployeeEducation: { __typename?: 'EmployeeEducation', id: string, employeeId: string, educationLevel: string, qualification: string, fieldOfStudy?: string | null, institution: string, boardUniversity?: string | null, startDate?: any | null, completionYear: number, gradeScore?: string | null, description?: string | null, verificationStatus: string, evidenceDocumentIds: Array<string>, rejectionReason?: string | null, updatedAt: any } };

export type DeleteEmployeeEducationMutationVariables = Exact<{
  employeeId: Scalars['ID']['input'];
  educationId: Scalars['ID']['input'];
}>;


export type DeleteEmployeeEducationMutation = { __typename?: 'Mutation', deleteEmployeeEducation: boolean };

export type LinkEmployeeEducationEvidenceMutationVariables = Exact<{
  employeeId: Scalars['ID']['input'];
  educationId: Scalars['ID']['input'];
  employeeDocumentId: Scalars['ID']['input'];
}>;


export type LinkEmployeeEducationEvidenceMutation = { __typename?: 'Mutation', linkEmployeeEducationEvidence: { __typename?: 'EmployeeEducation', id: string, verificationStatus: string, evidenceDocumentIds: Array<string>, updatedAt: any } };

export type UploadEmployeeEducationEvidenceMutationVariables = Exact<{
  educationId: Scalars['ID']['input'];
  input: UploadEmployeeDocumentInput;
}>;


export type UploadEmployeeEducationEvidenceMutation = { __typename?: 'Mutation', uploadEmployeeEducationEvidence: { __typename?: 'EmployeeEducation', id: string, verificationStatus: string, evidenceDocumentIds: Array<string>, updatedAt: any } };

export type ResolveEmployeeEducationMutationVariables = Exact<{
  educationId: Scalars['ID']['input'];
  approved: Scalars['Boolean']['input'];
  rejectionReason?: InputMaybe<Scalars['String']['input']>;
}>;


export type ResolveEmployeeEducationMutation = { __typename?: 'Mutation', resolveEmployeeEducation: { __typename?: 'EmployeeEducation', id: string, verificationStatus: string, rejectionReason?: string | null, updatedAt: any } };

export type UpsertEmployeeWorkExperienceMutationVariables = Exact<{
  input: UpsertEmployeeWorkExperienceInput;
}>;


export type UpsertEmployeeWorkExperienceMutation = { __typename?: 'Mutation', upsertEmployeeWorkExperience: { __typename?: 'EmployeeWorkExperience', id: string, employeeId: string, company: string, roleTitle: string, employmentType?: string | null, location?: string | null, startDate: any, endDate?: any | null, isCurrent: boolean, description?: string | null, verificationStatus: string, evidenceDocumentIds: Array<string>, rejectionReason?: string | null, updatedAt: any } };

export type DeleteEmployeeWorkExperienceMutationVariables = Exact<{
  employeeId: Scalars['ID']['input'];
  workExperienceId: Scalars['ID']['input'];
}>;


export type DeleteEmployeeWorkExperienceMutation = { __typename?: 'Mutation', deleteEmployeeWorkExperience: boolean };

export type LinkEmployeeWorkExperienceEvidenceMutationVariables = Exact<{
  employeeId: Scalars['ID']['input'];
  workExperienceId: Scalars['ID']['input'];
  employeeDocumentId: Scalars['ID']['input'];
}>;


export type LinkEmployeeWorkExperienceEvidenceMutation = { __typename?: 'Mutation', linkEmployeeWorkExperienceEvidence: { __typename?: 'EmployeeWorkExperience', id: string, verificationStatus: string, evidenceDocumentIds: Array<string>, updatedAt: any } };

export type UploadEmployeeWorkExperienceEvidenceMutationVariables = Exact<{
  workExperienceId: Scalars['ID']['input'];
  input: UploadEmployeeDocumentInput;
}>;


export type UploadEmployeeWorkExperienceEvidenceMutation = { __typename?: 'Mutation', uploadEmployeeWorkExperienceEvidence: { __typename?: 'EmployeeWorkExperience', id: string, verificationStatus: string, evidenceDocumentIds: Array<string>, updatedAt: any } };

export type ResolveEmployeeWorkExperienceMutationVariables = Exact<{
  workExperienceId: Scalars['ID']['input'];
  approved: Scalars['Boolean']['input'];
  rejectionReason?: InputMaybe<Scalars['String']['input']>;
}>;


export type ResolveEmployeeWorkExperienceMutation = { __typename?: 'Mutation', resolveEmployeeWorkExperience: { __typename?: 'EmployeeWorkExperience', id: string, verificationStatus: string, rejectionReason?: string | null, updatedAt: any } };

export type UploadTenantFileMutationVariables = Exact<{
  input: UploadTenantFileInput;
}>;


export type UploadTenantFileMutation = { __typename?: 'Mutation', uploadTenantFile: { __typename?: 'UploadedTenantFile', id: string, tenantId: string, originalFileName?: string | null, mimeType?: string | null, fileSizeBytes?: number | null, createdAt: any } };

export type TenantFileAttachmentQueryVariables = Exact<{
  fileStorageId: Scalars['ID']['input'];
}>;


export type TenantFileAttachmentQuery = { __typename?: 'Query', tenantFileAttachment: { __typename?: 'TenantFileAttachment', fileName: string, mimeType: string, fileSizeBytes?: number | null, contentBase64: string } };

export type CreateCompanyDocumentMutationVariables = Exact<{
  input: CreateCompanyDocumentInput;
}>;


export type CreateCompanyDocumentMutation = { __typename?: 'Mutation', createCompanyDocument: { __typename?: 'CompanyDocument', id: string, category: string, title: string, description?: string | null, fileStorageId: string, originalFileName?: string | null, mimeType?: string | null, fileSizeBytes?: number | null, status: string, visibleToEmployees: boolean, uploadedByUserId?: string | null, createdAt: any, updatedAt: any } };

export type DeleteCompanyDocumentMutationVariables = Exact<{
  companyDocumentId: Scalars['ID']['input'];
}>;


export type DeleteCompanyDocumentMutation = { __typename?: 'Mutation', deleteCompanyDocument: boolean };

export type ResolveEmployeeDocumentMutationVariables = Exact<{
  employeeDocumentId: Scalars['ID']['input'];
  approved: Scalars['Boolean']['input'];
}>;


export type ResolveEmployeeDocumentMutation = { __typename?: 'Mutation', resolveEmployeeDocument: { __typename?: 'EmployeeDocument', id: string, status: string } };

export type OrgDepartmentsQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type OrgDepartmentsQuery = { __typename?: 'Query', departments: Array<{ __typename?: 'Department', id: string, name: string, code: string, parentDepartmentId?: string | null }> };

export type ExpensePolicyDirectoryQueryVariables = Exact<{
  lim?: Scalars['Int']['input'];
}>;


export type ExpensePolicyDirectoryQuery = { __typename?: 'Query', departments: Array<{ __typename?: 'Department', id: string, name: string, code: string, parentDepartmentId?: string | null }>, designations: Array<{ __typename?: 'Designation', id: string, title: string, departmentId: string, level?: string | null }>, expenseAssignableRoles: Array<{ __typename?: 'TenantDirectoryRole', id: string, name: string, description?: string | null, isSystemRole: boolean }> };

export type OrgChartQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type OrgChartQuery = { __typename?: 'Query', orgChart: Array<{ __typename?: 'OrgChartRow', employeeId: string, employeeCode: string, fullName: string, reportingManagerId?: string | null, departmentName?: string | null, designationTitle?: string | null }> };

export type OrganizationDirectoryChartQueryVariables = Exact<{ [key: string]: never; }>;


export type OrganizationDirectoryChartQuery = { __typename?: 'Query', organizationDirectoryChart: Array<{ __typename?: 'EmployeeDirectoryEntry', employeeId: string, employeeCode: string, fullName: string, reportingManagerId?: string | null, departmentName?: string | null, designationTitle?: string | null }> };

export type ViewerEmployeeIdQueryVariables = Exact<{ [key: string]: never; }>;


export type ViewerEmployeeIdQuery = { __typename?: 'Query', viewerEmployeeId: string };

export type WorkplaceSuccessionDataQueryVariables = Exact<{
  clim?: Scalars['Int']['input'];
  plim?: Scalars['Int']['input'];
}>;


export type WorkplaceSuccessionDataQuery = { __typename?: 'Query', competencies: Array<{ __typename?: 'Competency', id: string, name: string, category?: string | null, description?: string | null }>, talentPools: Array<{ __typename?: 'TalentPool', id: string, name: string, description?: string | null }> };

export type AnalyticsWebhookDeliveryLogsQueryVariables = Exact<{
  lim?: Scalars['Int']['input'];
}>;


export type AnalyticsWebhookDeliveryLogsQuery = { __typename?: 'Query', webhookDeliveryLogs: Array<{ __typename?: 'WebhookDeliveryLogRow', id: string, webhookSubscriptionId: string, eventName?: string | null, payloadJson?: string | null, httpStatus?: number | null, responseBody?: string | null, isSuccess: boolean, attemptNumber: number, deliveredAt: any, createdAt: any }> };

export type OnboardingChecklistQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type OnboardingChecklistQuery = { __typename?: 'Query', onboardingChecklist: Array<{ __typename?: 'OnboardingChecklistItem', id: string, taskName: string, taskCategory?: string | null, dueDate?: any | null, isCompleted: boolean }> };

export type SetOnboardingChecklistItemMutationVariables = Exact<{
  checklistItemId: Scalars['ID']['input'];
  isCompleted: Scalars['Boolean']['input'];
}>;


export type SetOnboardingChecklistItemMutation = { __typename?: 'Mutation', setOnboardingChecklistItemCompleted: { __typename?: 'OnboardingChecklistItem', id: string, isCompleted: boolean } };

export type AdminWorkflowsDataQueryVariables = Exact<{
  wl?: Scalars['Int']['input'];
  il?: Scalars['Int']['input'];
}>;


export type AdminWorkflowsDataQuery = { __typename?: 'Query', workflows: Array<{ __typename?: 'Workflow', id: string, name: string, entityType: string, isActive: boolean }>, workflowInstances: Array<{ __typename?: 'WorkflowInstance', id: string, status: string, entityType: string, entityId: string }> };

export type AdminWorkflowsStepsDataQueryVariables = Exact<{
  wl?: Scalars['Int']['input'];
}>;


export type AdminWorkflowsStepsDataQuery = { __typename?: 'Query', workflowsWithSteps: Array<{ __typename?: 'WorkflowWithSteps', workflow: { __typename?: 'Workflow', id: string, name: string, entityType: string, isActive: boolean }, steps: Array<{ __typename?: 'WorkflowStep', id: string, sequenceOrder: number, stepName: string, approverType?: string | null, canSkip: boolean, slaHours?: number | null }> }> };

export type AdminCreateWorkflowMutationVariables = Exact<{
  input: CreateWorkflowInput;
}>;


export type AdminCreateWorkflowMutation = { __typename?: 'Mutation', createWorkflow: { __typename?: 'Workflow', id: string, name: string, entityType: string, isActive: boolean } };

export type AdminCreateWorkflowStepMutationVariables = Exact<{
  input: CreateWorkflowStepInput;
}>;


export type AdminCreateWorkflowStepMutation = { __typename?: 'Mutation', createWorkflowStep: { __typename?: 'WorkflowStep', id: string, workflowId: string, sequenceOrder: number, stepName: string, approverType?: string | null, canSkip: boolean, slaHours?: number | null } };

export type AdminDeleteWorkflowStepMutationVariables = Exact<{
  stepId: Scalars['ID']['input'];
}>;


export type AdminDeleteWorkflowStepMutation = { __typename?: 'Mutation', deleteWorkflowStep: boolean };

export type AdminReorderWorkflowStepsMutationVariables = Exact<{
  workflowId: Scalars['ID']['input'];
  stepIdsOrdered: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type AdminReorderWorkflowStepsMutation = { __typename?: 'Mutation', reorderWorkflowSteps: Array<{ __typename?: 'WorkflowStep', id: string, workflowId: string, sequenceOrder: number, stepName: string, approverType?: string | null, canSkip: boolean, slaHours?: number | null }> };

export type ClientOpsSeparationsListQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type ClientOpsSeparationsListQuery = { __typename?: 'Query', separations: Array<{ __typename?: 'Separation', id: string, separationType: string, resignationDate?: any | null, lastWorkingDate: any, reason?: string | null, status: string, createdAt: any }> };

export type ClientOpsSubmitSeparationMutationVariables = Exact<{
  input: SubmitSeparationInput;
}>;


export type ClientOpsSubmitSeparationMutation = { __typename?: 'Mutation', submitSeparation: { __typename?: 'Separation', id: string, status: string, lastWorkingDate: any } };

export type ApproveSeparationMutationVariables = Exact<{
  separationId: Scalars['ID']['input'];
}>;


export type ApproveSeparationMutation = { __typename?: 'Mutation', approveSeparation: { __typename?: 'Separation', id: string, status: string } };

export type RejectSeparationMutationVariables = Exact<{
  separationId: Scalars['ID']['input'];
}>;


export type RejectSeparationMutation = { __typename?: 'Mutation', rejectSeparation: { __typename?: 'Separation', id: string, status: string } };

export type ClientOpsFnfBySeparationQueryVariables = Exact<{
  separationId: Scalars['ID']['input'];
}>;


export type ClientOpsFnfBySeparationQuery = { __typename?: 'Query', fnfSettlement?: { __typename?: 'FnfSettlement', id: string, separationId: string, leaveEncashment?: string | null, gratuityAmount?: string | null, bonusPayable?: string | null, recoveryAmount?: string | null, netPayable?: string | null, status: string, processedAt?: any | null, createdAt: any } | null };

export type ClientOpsClearanceBySeparationQueryVariables = Exact<{
  separationId: Scalars['ID']['input'];
}>;


export type ClientOpsClearanceBySeparationQuery = { __typename?: 'Query', clearanceChecklist: Array<{ __typename?: 'ClearanceChecklistItem', id: string, separationId: string, department: string, taskName: string, isCleared: boolean, clearedAt?: any | null }> };

export type ClientOpsUpsertFnfMutationVariables = Exact<{
  input: UpsertFnfSettlementInput;
}>;


export type ClientOpsUpsertFnfMutation = { __typename?: 'Mutation', upsertFnfSettlement: { __typename?: 'FnfSettlement', id: string, leaveEncashment?: string | null, gratuityAmount?: string | null, bonusPayable?: string | null, recoveryAmount?: string | null, netPayable?: string | null, status: string } };

export type ClientOpsFinalizeFnfMutationVariables = Exact<{
  separationId: Scalars['ID']['input'];
}>;


export type ClientOpsFinalizeFnfMutation = { __typename?: 'Mutation', finalizeFnfSettlement: { __typename?: 'FnfSettlement', id: string, status: string, netPayable?: string | null, processedAt?: any | null } };

export type ClientOpsSetClearanceClearedMutationVariables = Exact<{
  clearanceId: Scalars['ID']['input'];
  isCleared: Scalars['Boolean']['input'];
}>;


export type ClientOpsSetClearanceClearedMutation = { __typename?: 'Mutation', setClearanceItemCleared: { __typename?: 'ClearanceChecklistItem', id: string, isCleared: boolean, clearedAt?: any | null } };

export type ClientOpsEnsureOffboardingMutationVariables = Exact<{
  separationId: Scalars['ID']['input'];
}>;


export type ClientOpsEnsureOffboardingMutation = { __typename?: 'Mutation', ensureSeparationOffboardingArtifacts: boolean };

export type WorkplaceCompensationDataQueryVariables = Exact<{
  blim?: Scalars['Int']['input'];
  clim?: Scalars['Int']['input'];
  dlim?: Scalars['Int']['input'];
}>;


export type WorkplaceCompensationDataQuery = { __typename?: 'Query', designations: Array<{ __typename?: 'Designation', id: string, title: string }>, salaryBands: Array<{ __typename?: 'SalaryBand', id: string, designationId: string, grade?: number | null, minSalary?: string | null, midSalary?: string | null, maxSalary?: string | null, currency?: string | null, effectiveYear?: number | null }>, compensationReviewCycles: Array<{ __typename?: 'CompensationReviewCycle', id: string, name: string, year: number, startDate: any, endDate: any, status: string, budgetPercentage?: string | null }> };

export type WorkplaceGrievanceQueryVariables = Exact<{
  clim?: Scalars['Int']['input'];
  calim?: Scalars['Int']['input'];
}>;


export type WorkplaceGrievanceQuery = { __typename?: 'Query', grievanceCategories: Array<{ __typename?: 'GrievanceCategory', id: string, name: string, code: string, isPosh: boolean }>, grievanceCases: Array<{ __typename?: 'GrievanceCase', id: string, subject: string, description?: string | null, status: string, filedAt: any, grievanceCategoryId: string }> };

export type SubmitGrievanceCaseMutationVariables = Exact<{
  input: SubmitGrievanceCaseInput;
}>;


export type SubmitGrievanceCaseMutation = { __typename?: 'Mutation', submitGrievanceCase: { __typename?: 'GrievanceCase', id: string, status: string, subject: string } };

export type WorkplaceAssetsQueryVariables = Exact<{
  calim?: Scalars['Int']['input'];
  alim?: Scalars['Int']['input'];
}>;


export type WorkplaceAssetsQuery = { __typename?: 'Query', assetCategories: Array<{ __typename?: 'AssetCategory', id: string, name: string, code?: string | null }>, assets: Array<{ __typename?: 'Asset', id: string, name: string, assetCategoryId: string, serialNumber?: string | null, assetTag?: string | null, status: string, purchaseDate?: any | null, purchaseValue?: string | null }> };

export type WorkplaceLearningQueryVariables = Exact<{
  slim?: Scalars['Int']['input'];
  clim?: Scalars['Int']['input'];
}>;


export type WorkplaceLearningQuery = { __typename?: 'Query', skills: Array<{ __typename?: 'Skill', id: string, name: string, category?: string | null, level?: string | null }>, courses: Array<{ __typename?: 'Course', id: string, title: string, category?: string | null, deliveryMode?: string | null, durationMinutes?: number | null, isMandatory: boolean }> };

export type WorkplacePerformanceQueryVariables = Exact<{
  clim?: Scalars['Int']['input'];
  glim?: Scalars['Int']['input'];
}>;


export type WorkplacePerformanceQuery = { __typename?: 'Query', reviewCycles: Array<{ __typename?: 'ReviewCycle', id: string, name: string, startDate: any, endDate: any, status: string, reviewType?: string | null }>, goals: Array<{ __typename?: 'Goal', id: string, employeeId: string, reviewCycleId: string, title: string, status: string, weightage?: string | null }> };

export type WorkplaceRecruitmentQueryVariables = Exact<{
  jlim?: Scalars['Int']['input'];
  alim?: Scalars['Int']['input'];
}>;


export type WorkplaceRecruitmentQuery = { __typename?: 'Query', jobPostings: Array<{ __typename?: 'JobPosting', id: string, title: string, status: string, vacancies: number, employmentType?: string | null, openDate?: any | null, closeDate?: any | null }>, applications: Array<{ __typename?: 'Application', id: string, jobId: string, candidateName: string, candidateEmail: string, status: string, appliedAt: any }> };

export type WorkplaceBenefitsQueryVariables = Exact<{
  tlim?: Scalars['Int']['input'];
  plim?: Scalars['Int']['input'];
}>;


export type WorkplaceBenefitsQuery = { __typename?: 'Query', benefitTypes: Array<{ __typename?: 'BenefitType', id: string, name: string, code: string, category?: string | null }>, benefitPlans: Array<{ __typename?: 'BenefitPlan', id: string, name: string, benefitTypeId: string, employerContribution?: string | null, employeeContribution?: string | null, contributionType?: string | null, isMandatory: boolean, isActive: boolean }> };

export type MyBenefitEnrollmentsQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type MyBenefitEnrollmentsQuery = { __typename?: 'Query', myBenefitEnrollments: Array<{ __typename?: 'BenefitEnrollment', id: string, benefitPlanId: string, status: string, enrolledOn?: any | null, effectiveFrom: any, effectiveTo?: any | null, employeeContributionAmount?: string | null, employerContributionAmount?: string | null, createdAt: any, updatedAt: any }> };

export type EnrollInBenefitPlanMutationVariables = Exact<{
  benefitPlanId: Scalars['ID']['input'];
}>;


export type EnrollInBenefitPlanMutation = { __typename?: 'Mutation', enrollInBenefitPlan: { __typename?: 'BenefitEnrollment', id: string, benefitPlanId: string, status: string, effectiveFrom: any, enrolledOn?: any | null } };

export type ExpenseBoardQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type ExpenseBoardQuery = { __typename?: 'Query', expenseCategories: Array<{ __typename?: 'ExpenseCategory', id: string, name: string, code: string, maxAmountPerClaim?: string | null }>, expenses: Array<{ __typename?: 'Expense', id: string, employeeId: string, expenseCategoryId: string, travelRequestId?: string | null, workflowInstanceId?: string | null, amount: string, currency: string, expenseDate: any, title: string, status: string, pendingApprovalStage?: string | null, viewerMayApprove: boolean, submittedAt: any, approvedAmount?: string | null, paymentStatus: string, paidAt?: any | null, paymentReference?: string | null, receiptFileStorageId?: string | null }>, travelRequests: Array<{ __typename?: 'TravelRequest', id: string, employeeId: string, originLocation?: string | null, destinationLocation?: string | null, fromDate: any, toDate: any, purpose: string, estimatedAmount?: string | null, currency: string, status: string, pendingApprovalStage?: string | null, viewerMayApprove: boolean, rejectionReason?: string | null, approvedBy?: string | null, rejectedBy?: string | null, workflowInstanceId?: string | null, submittedAt: any }> };

export type LeaveBoardQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
  balanceYear?: InputMaybe<Scalars['Int']['input']>;
  fromDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  toDate?: InputMaybe<Scalars['NaiveDate']['input']>;
}>;


export type LeaveBoardQuery = { __typename?: 'Query', viewerEmployeeId: string, upcomingHolidays: Array<{ __typename?: 'HolidayEntry', id: string, calendarId: string, calendarName: string, holidayDate: any, name: string, holidayType?: string | null }>, leavePolicies: Array<{ __typename?: 'LeavePolicy', id: string, leaveTypeId: string, applicableTo?: string | null, annualEntitlement?: number | null, accrualFrequency?: string | null, accrualDays?: string | null, maxConsecutiveDays?: number | null, minNoticeDays?: number | null }>, leaveTypes: Array<{ __typename?: 'LeaveType', id: string, name: string, code: string, isPaid: boolean, carryForward: boolean, requiresDocument: boolean, halfDayAllowed: boolean, sandwichRule: boolean }>, leaveRequests: Array<{ __typename?: 'LeaveRequest', id: string, employeeId: string, leaveTypeId: string, fromDate: any, toDate: any, daysRequested: string, status: string, reason?: string | null, rejectionReason?: string | null, isHalfDay: boolean, halfDaySession?: string | null, appliedAt: any, workflowInstanceId?: string | null, supportingDocumentReference?: string | null }>, leaveBalances: Array<{ __typename?: 'LeaveBalance', id: string, leaveTypeId: string, year: number, entitledDays: string, usedDays: string, pendingDays: string, balanceDays: string, carriedForwardDays: string }> };

export type AllCompanyHolidaysQueryVariables = Exact<{
  fromDate: Scalars['NaiveDate']['input'];
  limit?: Scalars['Int']['input'];
}>;


export type AllCompanyHolidaysQuery = { __typename?: 'Query', upcomingHolidays: Array<{ __typename?: 'HolidayEntry', id: string, holidayDate: any, name: string, calendarName: string, holidayType?: string | null }> };

export type HrLeaveCalendarQueryVariables = Exact<{
  reqLim?: Scalars['Int']['input'];
  orgLim?: Scalars['Int']['input'];
  typeLim?: Scalars['Int']['input'];
  holidayFrom: Scalars['NaiveDate']['input'];
  holidayLimit?: Scalars['Int']['input'];
  fromDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  toDate?: InputMaybe<Scalars['NaiveDate']['input']>;
}>;


export type HrLeaveCalendarQuery = { __typename?: 'Query', leaveRequests: Array<{ __typename?: 'LeaveRequest', id: string, employeeId: string, leaveTypeId: string, fromDate: any, toDate: any, status: string, isHalfDay: boolean, halfDaySession?: string | null }>, orgChart: Array<{ __typename?: 'OrgChartRow', employeeId: string, fullName: string, employeeCode: string }>, leaveTypes: Array<{ __typename?: 'LeaveType', id: string, name: string, code: string }>, upcomingHolidays: Array<{ __typename?: 'HolidayEntry', id: string, holidayDate: any, name: string, calendarName: string }> };

export type LeaveWorkflowTrailQueryQueryVariables = Exact<{
  leaveRequestId: Scalars['ID']['input'];
}>;


export type LeaveWorkflowTrailQueryQuery = { __typename?: 'Query', leaveRequestWorkflowTrail: Array<{ __typename?: 'LeaveWorkflowAction', workflowStepName: string, action: string, remarks?: string | null, actedAt: any, performedByUserId?: string | null }> };

export type AdminLeaveConsoleQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
  policyLimit?: Scalars['Int']['input'];
  calendarYear: Scalars['Int']['input'];
}>;


export type AdminLeaveConsoleQuery = { __typename?: 'Query', employees: Array<{ __typename?: 'Employee', id: string, employeeCode: string, fullName: string }>, leaveTypes: Array<{ __typename?: 'LeaveType', id: string, tenantId: string, name: string, code: string, isPaid: boolean, carryForward: boolean, maxCarryForwardDays?: number | null, sandwichRule: boolean, halfDayAllowed: boolean, requiresDocument: boolean, createdAt: any, updatedAt: any }>, leavePolicies: Array<{ __typename?: 'LeavePolicy', id: string, tenantId: string, leaveTypeId: string, applicableTo?: string | null, annualEntitlement?: number | null, accrualFrequency?: string | null, accrualDays?: string | null, maxConsecutiveDays?: number | null, minNoticeDays?: number | null, createdAt: any, updatedAt: any }>, holidayCalendars: Array<{ __typename?: 'HolidayCalendar', id: string, tenantId: string, locationId?: string | null, name: string, year: number, createdAt: any, updatedAt: any }> };

export type HolidaysInCalendarQueryVariables = Exact<{
  calendarId: Scalars['ID']['input'];
  limit?: Scalars['Int']['input'];
}>;


export type HolidaysInCalendarQuery = { __typename?: 'Query', holidaysInCalendar: Array<{ __typename?: 'HolidayDay', id: string, calendarId: string, holidayDate: any, name: string, holidayType?: string | null }> };

export type AttendanceBoardQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
  fromDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  toDate?: InputMaybe<Scalars['NaiveDate']['input']>;
}>;


export type AttendanceBoardQuery = { __typename?: 'Query', shifts: Array<{ __typename?: 'Shift', id: string, name: string, startTime?: any | null, endTime?: any | null, workHours?: number | null, isNightShift: boolean }>, attendance: Array<{ __typename?: 'Attendance', id: string, employeeId: string, workDate: any, checkInTime?: any | null, checkOutTime?: any | null, checkInLat?: string | null, checkInLng?: string | null, checkOutLat?: string | null, checkOutLng?: string | null, status?: string | null, source?: string | null, lateMinutes?: number | null }> };

export type PunchDaySummaryQueryVariables = Exact<{ [key: string]: never; }>;


export type PunchDaySummaryQuery = { __typename?: 'Query', punchDaySummary: { __typename?: 'PunchDaySummary', workDate: any, totalWorkedMinutes: number, openSegment?: { __typename?: 'Attendance', id: string, checkInTime?: any | null, checkOutTime?: any | null, checkInLat?: string | null, checkInLng?: string | null, checkOutLat?: string | null, checkOutLng?: string | null, source?: string | null, status?: string | null } | null, segments: Array<{ __typename?: 'Attendance', id: string, checkInTime?: any | null, checkOutTime?: any | null, checkInLat?: string | null, checkInLng?: string | null, checkOutLat?: string | null, checkOutLng?: string | null, source?: string | null, status?: string | null }> } };

export type OnLeaveTodayQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
  orgLim?: Scalars['Int']['input'];
  typeLim?: Scalars['Int']['input'];
  today?: InputMaybe<Scalars['NaiveDate']['input']>;
}>;


export type OnLeaveTodayQuery = { __typename?: 'Query', leaveRequests: Array<{ __typename?: 'LeaveRequest', id: string, employeeId: string, leaveTypeId: string, fromDate: any, toDate: any, status: string, isHalfDay: boolean, halfDaySession?: string | null }>, leaveTypes: Array<{ __typename?: 'LeaveType', id: string, name: string, code: string }>, orgChart: Array<{ __typename?: 'OrgChartRow', employeeId: string, fullName: string, employeeCode: string }> };

export type NotificationBoardQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type NotificationBoardQuery = { __typename?: 'Query', unreadNotificationCount: number, announcements: Array<{ __typename?: 'Announcement', id: string, title: string, body?: string | null, targetAudience?: string | null, targetDepartmentId?: string | null, targetLocationId?: string | null, postSource: string, publishAt?: any | null, expiresAt?: any | null, imageAttachment?: { __typename?: 'AnnouncementAttachment', fileName: string, mimeType: string, fileSizeBytes?: number | null, contentBase64: string } | null, documentAttachment?: { __typename?: 'AnnouncementAttachment', fileName: string, mimeType: string, fileSizeBytes?: number | null, contentBase64: string } | null }>, notifications: Array<{ __typename?: 'Notification', id: string, kind?: string | null, title?: string | null, message?: string | null, actionUrl?: string | null, isRead: boolean, createdAt: any }> };

export type MyNotificationPreferencesQueryVariables = Exact<{ [key: string]: never; }>;


export type MyNotificationPreferencesQuery = { __typename?: 'Query', myNotificationPreferences: { __typename?: 'NotificationPreferences', inAppEnabled: boolean, announcementsEnabled: boolean, mutedTopics: Array<string> } };

export type UpdateNotificationPreferencesMutationVariables = Exact<{
  input: UpdateNotificationPreferencesInput;
}>;


export type UpdateNotificationPreferencesMutation = { __typename?: 'Mutation', updateNotificationPreferences: { __typename?: 'NotificationPreferences', inAppEnabled: boolean, announcementsEnabled: boolean, mutedTopics: Array<string> } };

export type AdminNotificationsConsoleQueryVariables = Exact<{
  annLim?: Scalars['Int']['input'];
  notLim?: Scalars['Int']['input'];
  empLim?: Scalars['Int']['input'];
  deptLim?: Scalars['Int']['input'];
}>;


export type AdminNotificationsConsoleQuery = { __typename?: 'Query', adminAnnouncements: Array<{ __typename?: 'Announcement', id: string, title: string, body?: string | null, targetAudience?: string | null, targetDepartmentId?: string | null, targetLocationId?: string | null, postSource: string, publishAt?: any | null, expiresAt?: any | null, createdAt: any }>, adminNotifications: Array<{ __typename?: 'Notification', id: string, userId: string, kind?: string | null, title?: string | null, message?: string | null, actionUrl?: string | null, isRead: boolean, createdAt: any }>, employees: Array<{ __typename?: 'Employee', id: string, fullName: string, userId?: string | null, linkedUserEmail?: string | null, linkedUserUsername?: string | null }>, departments: Array<{ __typename?: 'Department', id: string, name: string }> };

export type UpdateAnnouncementMutationVariables = Exact<{
  input: UpdateAnnouncementInput;
}>;


export type UpdateAnnouncementMutation = { __typename?: 'Mutation', updateAnnouncement: { __typename?: 'Announcement', id: string, title: string, postSource: string } };

export type DeleteAnnouncementMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteAnnouncementMutation = { __typename?: 'Mutation', deleteAnnouncement: boolean };

export type CreateDirectNotificationsMutationVariables = Exact<{
  input: CreateDirectNotificationsInput;
}>;


export type CreateDirectNotificationsMutation = { __typename?: 'Mutation', createDirectNotifications: number };

export type UpdateNotificationAdminMutationVariables = Exact<{
  input: UpdateNotificationAdminInput;
}>;


export type UpdateNotificationAdminMutation = { __typename?: 'Mutation', updateNotificationAdmin: { __typename?: 'Notification', id: string, title?: string | null, message?: string | null } };

export type DeleteNotificationAdminMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteNotificationAdminMutation = { __typename?: 'Mutation', deleteNotificationAdmin: boolean };

export type CreateAnnouncementMutationVariables = Exact<{
  input: CreateAnnouncementInput;
}>;


export type CreateAnnouncementMutation = { __typename?: 'Mutation', createAnnouncement: { __typename?: 'Announcement', id: string, title: string, body?: string | null, postSource: string } };

export type ClientOpsNotificationPreviewQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type ClientOpsNotificationPreviewQuery = { __typename?: 'Query', unreadNotificationCount: number, notifications: Array<{ __typename?: 'Notification', id: string, title?: string | null, message?: string | null, isRead: boolean }> };

export type ClientOpsLeaveTypeNamesQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type ClientOpsLeaveTypeNamesQuery = { __typename?: 'Query', leaveTypes: Array<{ __typename?: 'LeaveType', id: string, name: string, code: string }> };

export type PayrollBoardQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type PayrollBoardQuery = { __typename?: 'Query', salaryComponents: Array<{ __typename?: 'SalaryComponent', id: string, name: string, code: string, componentType: string, isTaxable: boolean, isFixed: boolean, isActive: boolean }>, payrollCycles: Array<{ __typename?: 'PayrollCycle', id: string, name: string, month: number, year: number, status: string, paymentDate?: any | null }> };

export type PayrollArrearsListQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type PayrollArrearsListQuery = { __typename?: 'Query', payrollArrears: Array<{ __typename?: 'PayrollArrear', id: string, employeeId: string, amount: string, reason?: string | null, status: string, createdAt: any }> };

export type PayrollShellQueryVariables = Exact<{ [key: string]: never; }>;


export type PayrollShellQuery = { __typename?: 'Query', payrollCycles: Array<{ __typename?: 'PayrollCycle', id: string, name: string, month: number, year: number, status: string, paymentDate?: any | null }>, taxConfigurations: Array<{ __typename?: 'TaxConfigurationVersion', id: string, fiscalYear: number, regime?: string | null, countryCode: string, isActive: boolean }>, taxSlabs: Array<{ __typename?: 'TaxSlab', id: string, taxConfigVersionId: string, incomeFrom: string, incomeTo?: string | null, taxRate?: string | null }> };

export type PayrollSalaryComponentsQueryVariables = Exact<{ [key: string]: never; }>;


export type PayrollSalaryComponentsQuery = { __typename?: 'Query', salaryComponents: Array<{ __typename?: 'SalaryComponent', id: string, name: string, code: string, componentType: string, isTaxable: boolean, isFixed: boolean, isActive: boolean }> };

export type ClientOpsPayslipsForPayrollHubQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type ClientOpsPayslipsForPayrollHubQuery = { __typename?: 'Query', payslips: Array<{ __typename?: 'Payslip', id: string, payrollCycleId: string, grossSalary: string, totalDeductions: string, netSalary: string, pfEmployee?: string | null, pfEmployer?: string | null, esiEmployee?: string | null, esiEmployer?: string | null, tdsAmount?: string | null, professionalTax?: string | null, uanNumber?: string | null, esicNumber?: string | null, status: string, generatedAt: any, lines: Array<{ __typename?: 'PayslipComponentLine', id: string, salaryComponentId: string, amount: string, componentType?: string | null }> }> };

export type ClientOpsPayrollTaxBoardQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type ClientOpsPayrollTaxBoardQuery = { __typename?: 'Query', taxConfigurations: Array<{ __typename?: 'TaxConfigurationVersion', id: string, fiscalYear: number, regime?: string | null, countryCode: string, isActive: boolean }>, taxSlabs: Array<{ __typename?: 'TaxSlab', id: string, taxConfigVersionId: string, incomeFrom: string, incomeTo?: string | null, taxRate?: string | null, surchargeRate?: string | null, cessRate?: string | null }> };

export type ClientOpsAdminEmployeesQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type ClientOpsAdminEmployeesQuery = { __typename?: 'Query', employees: Array<{ __typename?: 'Employee', id: string, employeeCode: string, firstName: string, lastName: string, fullName: string, status: string, employmentType?: string | null, dateOfJoining: any, departmentId?: string | null, designationId?: string | null, reportingManagerId?: string | null, userId?: string | null, departmentName?: string | null, designationTitle?: string | null, linkedUserEmail?: string | null, linkedUserUsername?: string | null, reportingManagerName?: string | null }> };

export type ClientOpsAdminOrgLabelsQueryVariables = Exact<{
  dlim?: Scalars['Int']['input'];
  glim?: Scalars['Int']['input'];
}>;


export type ClientOpsAdminOrgLabelsQuery = { __typename?: 'Query', departments: Array<{ __typename?: 'Department', id: string, name: string }>, designations: Array<{ __typename?: 'Designation', id: string, title: string }> };

export type ClientOpsOrgListsForEmployeeModalQueryVariables = Exact<{
  dlim?: Scalars['Int']['input'];
  glim?: Scalars['Int']['input'];
  elim?: Scalars['Int']['input'];
  rlim?: Scalars['Int']['input'];
}>;


export type ClientOpsOrgListsForEmployeeModalQuery = { __typename?: 'Query', departments: Array<{ __typename?: 'Department', id: string, name: string, code: string }>, designations: Array<{ __typename?: 'Designation', id: string, title: string }>, employees: Array<{ __typename?: 'Employee', id: string, employeeCode: string, fullName: string }>, tenantDirectoryRoles: Array<{ __typename?: 'TenantDirectoryRole', id: string, name: string, isSystemRole: boolean }> };

export type ClientOpsAdminAttendancePolicyQueryVariables = Exact<{
  slim?: Scalars['Int']['input'];
}>;


export type ClientOpsAdminAttendancePolicyQuery = { __typename?: 'Query', attendancePunchPolicy: { __typename?: 'AttendancePunchPolicy', id?: string | null, tenantId: string, isEnforced: boolean, siteLatitude?: number | null, siteLongitude?: number | null, maxDistanceMeters?: number | null, ipAllowlist?: string | null, updatedAt?: any | null }, shifts: Array<{ __typename?: 'Shift', id: string, name: string, startTime?: any | null, endTime?: any | null, workHours?: number | null, isNightShift: boolean }> };

export type ClientOpsUpsertAttendancePunchPolicyMutationVariables = Exact<{
  input: UpsertAttendancePunchPolicyInput;
}>;


export type ClientOpsUpsertAttendancePunchPolicyMutation = { __typename?: 'Mutation', upsertAttendancePunchPolicy: { __typename?: 'AttendancePunchPolicy', id?: string | null, isEnforced: boolean, siteLatitude?: number | null, siteLongitude?: number | null, maxDistanceMeters?: number | null, ipAllowlist?: string | null, updatedAt?: any | null } };

export type ClientOpsEmployeesDirectoryQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type ClientOpsEmployeesDirectoryQuery = { __typename?: 'Query', employeeDirectoryPage: { __typename?: 'EmployeeDirectoryPage', nextCursor?: string | null, hasMore: boolean, rows: Array<{ __typename?: 'EmployeeDirectoryEntry', employeeId: string, employeeCode: string, fullName: string, status: string, employmentType?: string | null, dateOfJoining: any, departmentName?: string | null, designationTitle?: string | null, reportingManagerId?: string | null, reportingManagerName?: string | null }> } };

export type EmployeeProfileAccessQueryVariables = Exact<{
  employeeId: Scalars['ID']['input'];
}>;


export type EmployeeProfileAccessQuery = { __typename?: 'Query', employeeProfileAccess?: { __typename?: 'EmployeeProfileAccess', isSelf: boolean, canViewPrivateProfile: boolean, canEditPersonalProfile: boolean, canManageOrganizationFields: boolean, canReviewProfileChanges: boolean, directoryEntry: { __typename?: 'EmployeeDirectoryEntry', employeeId: string, employeeCode: string, fullName: string, status: string, employmentType?: string | null, dateOfJoining: any, departmentName?: string | null, designationTitle?: string | null, reportingManagerId?: string | null, reportingManagerName?: string | null } } | null };

export type EmployeeDocumentAttachmentQueryVariables = Exact<{
  employeeDocumentId: Scalars['ID']['input'];
}>;


export type EmployeeDocumentAttachmentQuery = { __typename?: 'Query', employeeDocumentAttachment: { __typename?: 'EmployeeDocumentAttachment', fileName: string, mimeType: string, fileSizeBytes?: number | null, contentBase64: string } };

export type EmployeeProfileReviewQueueQueryVariables = Exact<{
  status?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
}>;


export type EmployeeProfileReviewQueueQuery = { __typename?: 'Query', employeeProfileReviewQueue: Array<{ __typename?: 'EmployeeProfileReviewQueueItem', employeeCode: string, employeeName: string, hasSupportingDocument: boolean, request: { __typename?: 'EmployeeProfileChangeRequest', id: string, employeeId: string, requestType: string, status: string, requestedSummary: string, supportingDocumentId?: string | null, reviewedAt?: any | null, rejectionReason?: string | null, createdAt: any, updatedAt: any } }> };

export type EmployeeProfileChangeReviewDetailQueryVariables = Exact<{
  requestId: Scalars['ID']['input'];
}>;


export type EmployeeProfileChangeReviewDetailQuery = { __typename?: 'Query', employeeProfileChangeReviewDetail: { __typename?: 'EmployeeProfileChangeReviewDetail', employeeCode: string, employeeName: string, currentValues: any, requestedValues: any, request: { __typename?: 'EmployeeProfileChangeRequest', id: string, employeeId: string, requestType: string, status: string, requestedSummary: string, supportingDocumentId?: string | null, reviewedAt?: any | null, rejectionReason?: string | null, createdAt: any, updatedAt: any } } };

export type EmployeeEvidenceReviewQueueQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type EmployeeEvidenceReviewQueueQuery = { __typename?: 'Query', employeeEvidenceReviewQueue: Array<{ __typename?: 'EmployeeEvidenceReviewQueueItem', recordId: string, employeeId: string, employeeCode: string, employeeName: string, evidenceType: string, summary: string, evidenceDocumentIds: Array<string>, createdAt: any }> };

export type EmployeePrivateProfileQueryVariables = Exact<{
  employeeId: Scalars['ID']['input'];
}>;


export type EmployeePrivateProfileQuery = { __typename?: 'Query', employee?: { __typename?: 'Employee', id: string, employeeCode: string, firstName: string, lastName: string, fullName: string, status: string, employmentType?: string | null, dateOfJoining: any, departmentId?: string | null, designationId?: string | null, reportingManagerId?: string | null, userId?: string | null, departmentName?: string | null, designationTitle?: string | null, linkedUserEmail?: string | null, linkedUserUsername?: string | null, reportingManagerName?: string | null, personalPhone?: string | null, currentAddress?: string | null, permanentAddress?: string | null, dateOfBirth?: any | null, gender?: string | null, nationality?: string | null, bloodGroup?: string | null, emergencyContactName?: string | null, emergencyContactPhone?: string | null, emergencyContactRelation?: string | null, createdAt: any, updatedAt: any } | null, employeeDocuments: Array<{ __typename?: 'EmployeeDocument', id: string, documentTypeId: string, status: string, uploadedAt: any, originalFileName?: string | null, mimeType?: string | null, uploadedByUserId?: string | null, documentTypeName?: string | null, documentTypeCategory?: string | null }>, documentTypes: Array<{ __typename?: 'DocumentType', id: string, name: string, category?: string | null, systemKey?: string | null }>, employmentHistoryRecords: Array<{ __typename?: 'EmploymentHistoryRecord', id: string, monthlySalary?: string | null, effectiveFrom: any, effectiveTo?: any | null, changeReason?: string | null, updatedAt: any }>, employeePrimaryBank?: { __typename?: 'EmployeeBankAccount', id: string, bankName: string, accountNumberMasked: string, ifscCode: string, accountType?: string | null, isVerified: boolean } | null, employeeIdentityProfile: { __typename?: 'EmployeeIdentityProfile', pan?: { __typename?: 'EmployeePanRecord', id: string, maskedPan: string, isVerified: boolean } | null, aadhaar?: { __typename?: 'EmployeeAadhaarRecord', id: string, maskedAadhaar: string, isVerified: boolean } | null }, employeeProfileChangeRequests: Array<{ __typename?: 'EmployeeProfileChangeRequest', id: string, requestType: string, status: string, requestedSummary: string, supportingDocumentId?: string | null, reviewedAt?: any | null, rejectionReason?: string | null, createdAt: any, updatedAt: any }>, employeeEducationRecords: Array<{ __typename?: 'EmployeeEducation', id: string, employeeId: string, educationLevel: string, qualification: string, fieldOfStudy?: string | null, institution: string, boardUniversity?: string | null, startDate?: any | null, completionYear: number, gradeScore?: string | null, description?: string | null, verificationStatus: string, evidenceDocumentIds: Array<string>, rejectionReason?: string | null, updatedAt: any }>, employeeWorkExperienceRecords: Array<{ __typename?: 'EmployeeWorkExperience', id: string, employeeId: string, company: string, roleTitle: string, employmentType?: string | null, location?: string | null, startDate: any, endDate?: any | null, isCurrent: boolean, description?: string | null, verificationStatus: string, evidenceDocumentIds: Array<string>, rejectionReason?: string | null, updatedAt: any }> };

export type ClientOpsEmployeeDetailQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ClientOpsEmployeeDetailQuery = { __typename?: 'Query', employee?: { __typename?: 'Employee', id: string, employeeCode: string, firstName: string, lastName: string, fullName: string, status: string, employmentType?: string | null, dateOfJoining: any, dateOfBirth?: any | null, gender?: string | null, nationality?: string | null, bloodGroup?: string | null, emergencyContactName?: string | null, emergencyContactPhone?: string | null, emergencyContactRelation?: string | null, departmentId?: string | null, designationId?: string | null, reportingManagerId?: string | null, userId?: string | null, departmentName?: string | null, designationTitle?: string | null, linkedUserEmail?: string | null, linkedUserUsername?: string | null, reportingManagerName?: string | null, createdAt: any, updatedAt: any } | null };

export type EmployeeProfileBundleQueryVariables = Exact<{
  employeeId: Scalars['ID']['input'];
}>;


export type EmployeeProfileBundleQuery = { __typename?: 'Query', employee?: { __typename?: 'Employee', id: string, employeeCode: string, firstName: string, lastName: string, fullName: string, status: string, employmentType?: string | null, dateOfJoining: any, dateOfBirth?: any | null, gender?: string | null, nationality?: string | null, bloodGroup?: string | null, emergencyContactName?: string | null, emergencyContactPhone?: string | null, emergencyContactRelation?: string | null, departmentId?: string | null, designationId?: string | null, reportingManagerId?: string | null, userId?: string | null, departmentName?: string | null, designationTitle?: string | null, linkedUserEmail?: string | null, linkedUserUsername?: string | null, reportingManagerName?: string | null, createdAt: any, updatedAt: any } | null, employeeDocuments: Array<{ __typename?: 'EmployeeDocument', id: string, documentTypeId: string, status: string, uploadedAt: any, originalFileName?: string | null, mimeType?: string | null, uploadedByUserId?: string | null, documentTypeName?: string | null, documentTypeCategory?: string | null }>, documentTypes: Array<{ __typename?: 'DocumentType', id: string, name: string, category?: string | null }>, employmentHistoryRecords: Array<{ __typename?: 'EmploymentHistoryRecord', id: string, monthlySalary?: string | null, effectiveFrom: any, effectiveTo?: any | null, changeReason?: string | null, updatedAt: any }>, employeePrimaryBank?: { __typename?: 'EmployeeBankAccount', id: string, bankName: string, accountNumberMasked: string, ifscCode: string, accountType?: string | null, isVerified: boolean } | null, employeeIdentityProfile: { __typename?: 'EmployeeIdentityProfile', pan?: { __typename?: 'EmployeePanRecord', id: string, maskedPan: string, isVerified: boolean } | null, aadhaar?: { __typename?: 'EmployeeAadhaarRecord', id: string, maskedAadhaar: string, isVerified: boolean } | null } };

export type ClientOpsAdminSettingsEmployeesQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type ClientOpsAdminSettingsEmployeesQuery = { __typename?: 'Query', employees: Array<{ __typename?: 'Employee', id: string, employeeCode: string, fullName: string, status: string, employmentType?: string | null, userId?: string | null, departmentId?: string | null, designationId?: string | null, reportingManagerId?: string | null, departmentName?: string | null, designationTitle?: string | null, linkedUserEmail?: string | null, linkedUserUsername?: string | null, reportingManagerName?: string | null }> };

export type ClientOpsAdminReportsDataQueryVariables = Exact<{
  fromDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  toDate?: InputMaybe<Scalars['NaiveDate']['input']>;
}>;


export type ClientOpsAdminReportsDataQuery = { __typename?: 'Query', employees: Array<{ __typename?: 'Employee', id: string, employeeCode: string, fullName: string }>, attendance: Array<{ __typename?: 'Attendance', id: string, employeeId: string, workDate: any, status?: string | null, checkInTime?: any | null, checkOutTime?: any | null }>, leaveRequests: Array<{ __typename?: 'LeaveRequest', id: string, employeeId: string, fromDate: any, toDate: any, status: string }>, payrollCycles: Array<{ __typename?: 'PayrollCycle', id: string, name: string, month: number, year: number, status: string, paymentDate?: any | null }>, salaryComponents: Array<{ __typename?: 'SalaryComponent', id: string, componentType: string, isActive: boolean, isTaxable: boolean }> };

export type PayrollEmploymentHistoryQueryVariables = Exact<{
  employeeId: Scalars['ID']['input'];
  limit?: Scalars['Int']['input'];
}>;


export type PayrollEmploymentHistoryQuery = { __typename?: 'Query', employmentHistoryRecords: Array<{ __typename?: 'EmploymentHistoryRecord', id: string, monthlySalary?: string | null, effectiveFrom: any, effectiveTo?: any | null, changeReason?: string | null, changedBy?: string | null, updatedAt: any }> };

export type PayrollSetEmployeeCompensationMutationVariables = Exact<{
  input: SetEmployeeCompensationInput;
}>;


export type PayrollSetEmployeeCompensationMutation = { __typename?: 'Mutation', setEmployeeCompensation: { __typename?: 'EmploymentHistoryRecord', id: string, monthlySalary?: string | null, effectiveFrom: any, changeReason?: string | null, updatedAt: any } };

export type RbacAdminBoardQueryVariables = Exact<{
  uLim?: Scalars['Int']['input'];
  rLim?: Scalars['Int']['input'];
  pLim?: Scalars['Int']['input'];
}>;


export type RbacAdminBoardQuery = { __typename?: 'Query', tenantDirectoryUsers: Array<{ __typename?: 'TenantDirectoryUser', id: string, username: string, email?: string | null, isActive: boolean }>, tenantDirectoryRoles: Array<{ __typename?: 'TenantDirectoryRole', id: string, name: string, description?: string | null, isSystemRole: boolean }>, tenantCatalogPermissions: Array<{ __typename?: 'TenantCatalogPermission', id: string, resource: string, action: string, description?: string | null }> };

export type PermissionIdsForRoleQueryVariables = Exact<{
  roleId: Scalars['ID']['input'];
}>;


export type PermissionIdsForRoleQuery = { __typename?: 'Query', permissionIdsForRole: Array<string> };

export type RoleIdsForUserQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type RoleIdsForUserQuery = { __typename?: 'Query', roleIdsForUser: Array<string> };

export type PermissionScopesForRoleQueryVariables = Exact<{
  roleId: Scalars['ID']['input'];
}>;


export type PermissionScopesForRoleQuery = { __typename?: 'Query', permissionScopesForRole: Array<{ __typename?: 'TenantPermissionScopeAssignment', id: string, resource: string, action: string, scopeType: string }> };

export type SetRolePermissionsMutationVariables = Exact<{
  roleId: Scalars['ID']['input'];
  permissionIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type SetRolePermissionsMutation = { __typename?: 'Mutation', setRolePermissions: boolean };

export type SetUserRolesMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
  roleIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type SetUserRolesMutation = { __typename?: 'Mutation', setUserRoles: boolean };

export type SetRolePermissionScopesMutationVariables = Exact<{
  roleId: Scalars['ID']['input'];
  scopes: Array<PermissionScopeAssignmentInput> | PermissionScopeAssignmentInput;
}>;


export type SetRolePermissionScopesMutation = { __typename?: 'Mutation', setRolePermissionScopes: boolean };

export type GatewayPingQueryVariables = Exact<{ [key: string]: never; }>;


export type GatewayPingQuery = { __typename: 'Query' };

export type ModuleProbeLeaveBoardQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type ModuleProbeLeaveBoardQuery = { __typename?: 'Query', leaveTypes: Array<{ __typename?: 'LeaveType', id: string, name: string, code: string, isPaid: boolean }>, leaveRequests: Array<{ __typename?: 'LeaveRequest', id: string, employeeId: string, status: string, fromDate: any, toDate: any, daysRequested: string }> };

export type ModuleProbeAttendanceBoardQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type ModuleProbeAttendanceBoardQuery = { __typename?: 'Query', shifts: Array<{ __typename?: 'Shift', id: string, name: string, startTime?: any | null, endTime?: any | null }>, attendance: Array<{ __typename?: 'Attendance', id: string, employeeId: string, workDate: any, checkInTime?: any | null, checkOutTime?: any | null, status?: string | null }> };

export type ModuleProbePayrollBoardQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type ModuleProbePayrollBoardQuery = { __typename?: 'Query', salaryComponents: Array<{ __typename?: 'SalaryComponent', id: string, name: string, code: string, componentType: string }>, payrollCycles: Array<{ __typename?: 'PayrollCycle', id: string, name: string, month: number, year: number, status: string, paymentDate?: any | null }> };

export type ModuleProbeTaxBoardQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type ModuleProbeTaxBoardQuery = { __typename?: 'Query', taxConfigurations: Array<{ __typename?: 'TaxConfigurationVersion', id: string, fiscalYear: number, regime?: string | null, countryCode: string, isActive: boolean }>, taxSlabs: Array<{ __typename?: 'TaxSlab', id: string, taxConfigVersionId: string, incomeFrom: string, incomeTo?: string | null, taxRate?: string | null }> };

export type ModuleProbeBenefitsBoardQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type ModuleProbeBenefitsBoardQuery = { __typename?: 'Query', benefitTypes: Array<{ __typename?: 'BenefitType', id: string, name: string, code: string, category?: string | null }>, benefitPlans: Array<{ __typename?: 'BenefitPlan', id: string, name: string, benefitTypeId: string, employeeContribution?: string | null, employerContribution?: string | null, isActive: boolean }> };

export type ModuleProbeExpenseBoardQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type ModuleProbeExpenseBoardQuery = { __typename?: 'Query', expenseCategories: Array<{ __typename?: 'ExpenseCategory', id: string, name: string, code: string }>, expenses: Array<{ __typename?: 'Expense', id: string, employeeId: string, expenseCategoryId: string, amount: string, status: string, expenseDate: any }> };

export type ModuleProbeDocumentQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type ModuleProbeDocumentQuery = { __typename?: 'Query', documentTypes: Array<{ __typename?: 'DocumentType', id: string, name: string, category?: string | null, isRequired: boolean }>, employeeDocuments: Array<{ __typename?: 'EmployeeDocument', id: string, documentTypeId: string, status: string, uploadedAt: any }> };

export type ModuleProbePayslipQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type ModuleProbePayslipQuery = { __typename?: 'Query', payslips: Array<{ __typename?: 'Payslip', id: string, netSalary: string, grossSalary: string, status: string, lines: Array<{ __typename?: 'PayslipComponentLine', id: string, amount: string, componentType?: string | null }> }> };

export type ModuleProbeRecruitmentBoardQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type ModuleProbeRecruitmentBoardQuery = { __typename?: 'Query', jobPostings: Array<{ __typename?: 'JobPosting', id: string, title: string, status: string, employmentType?: string | null, vacancies: number }>, applications: Array<{ __typename?: 'Application', id: string, jobId: string, candidateName: string, status: string }> };

export type ModuleProbePerformanceBoardQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type ModuleProbePerformanceBoardQuery = { __typename?: 'Query', reviewCycles: Array<{ __typename?: 'ReviewCycle', id: string, name: string, status: string, startDate: any, endDate: any }>, goals: Array<{ __typename?: 'Goal', id: string, employeeId: string, title: string, weightage?: string | null, status: string }> };

export type ModuleProbeLmsBoardQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type ModuleProbeLmsBoardQuery = { __typename?: 'Query', skills: Array<{ __typename?: 'Skill', id: string, name: string, category?: string | null }>, courses: Array<{ __typename?: 'Course', id: string, title: string, durationMinutes?: number | null, isActive: boolean }> };

export type ModuleProbeSuccessionBoardQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type ModuleProbeSuccessionBoardQuery = { __typename?: 'Query', competencies: Array<{ __typename?: 'Competency', id: string, name: string, category?: string | null }>, talentPools: Array<{ __typename?: 'TalentPool', id: string, name: string, description?: string | null }> };

export type ModuleProbeCompensationBoardQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type ModuleProbeCompensationBoardQuery = { __typename?: 'Query', salaryBands: Array<{ __typename?: 'SalaryBand', id: string, designationId: string, grade?: number | null, minSalary?: string | null, maxSalary?: string | null, currency?: string | null }>, compensationReviewCycles: Array<{ __typename?: 'CompensationReviewCycle', id: string, name: string, year: number, status: string }> };

export type ModuleProbeAssetsBoardQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type ModuleProbeAssetsBoardQuery = { __typename?: 'Query', assetCategories: Array<{ __typename?: 'AssetCategory', id: string, name: string, code?: string | null }>, assets: Array<{ __typename?: 'Asset', id: string, assetCategoryId: string, name: string, assetTag?: string | null, status: string }> };

export type ModuleProbeGrievanceBoardQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type ModuleProbeGrievanceBoardQuery = { __typename?: 'Query', grievanceCategories: Array<{ __typename?: 'GrievanceCategory', id: string, name: string, code: string, isPosh: boolean }>, grievanceCases: Array<{ __typename?: 'GrievanceCase', id: string, subject: string, status: string, priority?: string | null, filedAt: any }> };

export type ModuleProbeWorkflowBoardQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type ModuleProbeWorkflowBoardQuery = { __typename?: 'Query', workflows: Array<{ __typename?: 'Workflow', id: string, name: string, entityType: string, isActive: boolean }>, workflowInstances: Array<{ __typename?: 'WorkflowInstance', id: string, workflowId: string, status: string, entityType: string }> };

export type ModuleProbeNotificationBoardQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type ModuleProbeNotificationBoardQuery = { __typename?: 'Query', announcements: Array<{ __typename?: 'Announcement', id: string, title: string, targetAudience?: string | null, publishAt?: any | null }>, notifications: Array<{ __typename?: 'Notification', id: string, kind?: string | null, title?: string | null, isRead: boolean, createdAt: any }> };

export type ModuleProbeOpsOverviewQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type ModuleProbeOpsOverviewQuery = { __typename?: 'Query', tenants: Array<{ __typename?: 'Tenant', id: string, name: string, status: string, plan?: string | null, subdomain?: string | null }>, modules: Array<{ __typename?: 'Module', id: string, code: string, name: string, category?: string | null, isCore: boolean }>, tenantSubscriptions: Array<{ __typename?: 'TenantSubscription', id: string, tenantId: string, moduleId: string, status: string, contractedSeats: number, currentSeatUsage: number }>, invoices: Array<{ __typename?: 'Invoice', id: string, tenantId: string, invoiceNumber: string, totalAmount: string, status: string, dueDate?: any | null }>, operatorUsers: Array<{ __typename?: 'OperatorUser', id: string, email: string, fullName: string, isActive: boolean }> };

export type ModuleProbeAnalyticsQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type ModuleProbeAnalyticsQuery = { __typename?: 'Query', webhookDeliveryLogs: Array<{ __typename?: 'WebhookDeliveryLogRow', id: string, eventName?: string | null }> };

export type LeaveHealthQueryVariables = Exact<{ [key: string]: never; }>;


export type LeaveHealthQuery = { __typename?: 'Query', leaveTypes: Array<{ __typename?: 'LeaveType', id: string, name: string }> };

export type AttendanceHealthQueryVariables = Exact<{ [key: string]: never; }>;


export type AttendanceHealthQuery = { __typename?: 'Query', shifts: Array<{ __typename?: 'Shift', id: string, name: string }> };

export type PayrollHealthQueryVariables = Exact<{ [key: string]: never; }>;


export type PayrollHealthQuery = { __typename?: 'Query', salaryComponents: Array<{ __typename?: 'SalaryComponent', id: string, name: string }> };

export type TaxHealthQueryVariables = Exact<{ [key: string]: never; }>;


export type TaxHealthQuery = { __typename?: 'Query', taxConfigurations: Array<{ __typename?: 'TaxConfigurationVersion', id: string, fiscalYear: number, regime?: string | null }> };

export type BenefitsHealthQueryVariables = Exact<{ [key: string]: never; }>;


export type BenefitsHealthQuery = { __typename?: 'Query', benefitTypes: Array<{ __typename?: 'BenefitType', id: string, name: string }> };

export type ExpenseHealthQueryVariables = Exact<{ [key: string]: never; }>;


export type ExpenseHealthQuery = { __typename?: 'Query', expenseCategories: Array<{ __typename?: 'ExpenseCategory', id: string, name: string }> };

export type RecruitmentHealthQueryVariables = Exact<{ [key: string]: never; }>;


export type RecruitmentHealthQuery = { __typename?: 'Query', jobPostings: Array<{ __typename?: 'JobPosting', id: string, title: string }> };

export type PerformanceHealthQueryVariables = Exact<{ [key: string]: never; }>;


export type PerformanceHealthQuery = { __typename?: 'Query', reviewCycles: Array<{ __typename?: 'ReviewCycle', id: string, name: string }> };

export type LmsHealthQueryVariables = Exact<{ [key: string]: never; }>;


export type LmsHealthQuery = { __typename?: 'Query', skills: Array<{ __typename?: 'Skill', id: string, name: string }> };

export type SuccessionHealthQueryVariables = Exact<{ [key: string]: never; }>;


export type SuccessionHealthQuery = { __typename?: 'Query', competencies: Array<{ __typename?: 'Competency', id: string, name: string }> };

export type CompensationHealthQueryVariables = Exact<{ [key: string]: never; }>;


export type CompensationHealthQuery = { __typename?: 'Query', salaryBands: Array<{ __typename?: 'SalaryBand', id: string, grade?: number | null }> };

export type AssetsHealthQueryVariables = Exact<{ [key: string]: never; }>;


export type AssetsHealthQuery = { __typename?: 'Query', assetCategories: Array<{ __typename?: 'AssetCategory', id: string, name: string }> };

export type GrievanceHealthQueryVariables = Exact<{ [key: string]: never; }>;


export type GrievanceHealthQuery = { __typename?: 'Query', grievanceCategories: Array<{ __typename?: 'GrievanceCategory', id: string, name: string }> };

export type WorkflowHealthQueryVariables = Exact<{ [key: string]: never; }>;


export type WorkflowHealthQuery = { __typename?: 'Query', workflows: Array<{ __typename?: 'Workflow', id: string, name: string }> };

export type NotificationHealthQueryVariables = Exact<{ [key: string]: never; }>;


export type NotificationHealthQuery = { __typename?: 'Query', announcements: Array<{ __typename?: 'Announcement', id: string, title: string }> };

export type AnalyticsHealthQueryVariables = Exact<{ [key: string]: never; }>;


export type AnalyticsHealthQuery = { __typename?: 'Query', webhookDeliveryLogs: Array<{ __typename?: 'WebhookDeliveryLogRow', id: string }> };

export type TenantsHealthQueryVariables = Exact<{ [key: string]: never; }>;


export type TenantsHealthQuery = { __typename?: 'Query', tenants: Array<{ __typename?: 'Tenant', id: string, name: string }> };

export type BillingHealthQueryVariables = Exact<{ [key: string]: never; }>;


export type BillingHealthQuery = { __typename?: 'Query', invoices: Array<{ __typename?: 'Invoice', id: string, invoiceNumber: string }> };

export type OperatorHealthQueryVariables = Exact<{ [key: string]: never; }>;


export type OperatorHealthQuery = { __typename?: 'Query', operatorUsers: Array<{ __typename?: 'OperatorUser', id: string, email: string }> };

export type PayrollCompensationBoardQueryVariables = Exact<{
  employeeLimit?: Scalars['Int']['input'];
}>;


export type PayrollCompensationBoardQuery = { __typename?: 'Query', employees: Array<{ __typename?: 'Employee', id: string, employeeCode: string, fullName: string, status: string, dateOfJoining: any }>, salaryComponents: Array<{ __typename?: 'SalaryComponent', id: string, name: string, code: string, componentType: string, isTaxable: boolean, isFixed: boolean, isActive: boolean }>, salaryStructures: Array<{ __typename?: 'SalaryStructure', id: string, name: string, description?: string | null, components: Array<{ __typename?: 'SalaryStructureComponent', id: string, salaryComponentId: string, componentName: string, componentCode: string, componentType: string, calculationBasis: string, calculationValue?: string | null, displayOrder: number }> }> };

export type UpsertSalaryComponentMutationVariables = Exact<{
  input: UpsertSalaryComponentInput;
}>;


export type UpsertSalaryComponentMutation = { __typename?: 'Mutation', upsertSalaryComponent: { __typename?: 'SalaryComponent', id: string, name: string, code: string, componentType: string, isActive: boolean } };

export type UpsertSalaryStructureMutationVariables = Exact<{
  input: UpsertSalaryStructureInput;
}>;


export type UpsertSalaryStructureMutation = { __typename?: 'Mutation', upsertSalaryStructure: { __typename?: 'SalaryStructure', id: string, name: string, components: Array<{ __typename?: 'SalaryStructureComponent', id: string, componentCode: string, calculationBasis: string, calculationValue?: string | null }> } };

export type AssignEmployeeSalaryStructureMutationVariables = Exact<{
  input: AssignEmployeeSalaryStructureInput;
}>;


export type AssignEmployeeSalaryStructureMutation = { __typename?: 'Mutation', assignEmployeeSalaryStructure: { __typename?: 'EmployeeSalaryStructure', id: string, employeeId: string, salaryStructureId: string, ctc: string, effectiveFrom: any } };

export type EmployeeSalaryBreakupPreviewQueryVariables = Exact<{
  employeeId: Scalars['ID']['input'];
  asOf?: InputMaybe<Scalars['NaiveDate']['input']>;
}>;


export type EmployeeSalaryBreakupPreviewQuery = { __typename?: 'Query', employeeSalaryBreakupPreview?: { __typename?: 'SalaryBreakupPreview', employeeId: string, annualCtc: string, monthlyGross: string, monthlyDeductions: string, monthlyNetBeforeStatutory: string, lines: Array<{ __typename?: 'SalaryBreakupLine', salaryComponentId: string, componentName: string, componentCode: string, componentType: string, calculationBasis: string, calculationValue: string, annualAmount: string, monthlyAmount: string, isOverride: boolean }> } | null };

export type AssetsBoardQueryVariables = Exact<{
  withInventory: Scalars['Boolean']['input'];
  limit?: Scalars['Int']['input'];
}>;


export type AssetsBoardQuery = { __typename?: 'Query', assetCategories?: Array<{ __typename?: 'AssetCategory', id: string, name: string, code?: string | null }>, assets?: Array<{ __typename?: 'Asset', id: string, name: string, assetCategoryId: string, serialNumber?: string | null, assetTag?: string | null, status: string, purchaseDate?: any | null, purchaseValue?: string | null }>, assetAssignments: Array<{ __typename?: 'AssetAssignment', id: string, assetId: string, employeeId: string, assetName: string, assetTag?: string | null, serialNumber?: string | null, purchaseValue?: string | null, allocatedOn: any, expectedReturnOn?: any | null, conditionAtAllocation?: string | null, status: string }> };

export type AssignAssetToEmployeeMutationVariables = Exact<{
  input: AssignAssetInput;
}>;


export type AssignAssetToEmployeeMutation = { __typename?: 'Mutation', assignAssetToEmployee: { __typename?: 'AssetAssignment', id: string, assetId: string, employeeId: string, assetName: string, status: string } };

export type ReturnEmployeeAssetMutationVariables = Exact<{
  input: ReturnAssetInput;
}>;


export type ReturnEmployeeAssetMutation = { __typename?: 'Mutation', returnEmployeeAsset: { __typename?: 'AssetAssignment', id: string, assetId: string, employeeId: string, assetName: string, status: string } };

export type AssetsEmployeeOptionsQueryVariables = Exact<{
  limit?: Scalars['Int']['input'];
}>;


export type AssetsEmployeeOptionsQuery = { __typename?: 'Query', employees: Array<{ __typename?: 'Employee', id: string, employeeCode: string, fullName: string, status: string }> };


export const LeaveBalancesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LeaveBalances"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"year"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"leaveBalances"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"year"},"value":{"kind":"Variable","name":{"kind":"Name","value":"year"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"leaveTypeId"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"balanceDays"}},{"kind":"Field","name":{"kind":"Name","value":"entitledDays"}},{"kind":"Field","name":{"kind":"Name","value":"pendingDays"}},{"kind":"Field","name":{"kind":"Name","value":"usedDays"}},{"kind":"Field","name":{"kind":"Name","value":"carriedForwardDays"}}]}}]}}]} as unknown as DocumentNode<LeaveBalancesQuery, LeaveBalancesQueryVariables>;
export const ClientOpsUpcomingHolidaysDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ClientOpsUpcomingHolidays"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fromDate"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"NaiveDate"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"15"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upcomingHolidays"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"fromDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fromDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"holidayDate"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"calendarName"}},{"kind":"Field","name":{"kind":"Name","value":"holidayType"}}]}}]}}]} as unknown as DocumentNode<ClientOpsUpcomingHolidaysQuery, ClientOpsUpcomingHolidaysQueryVariables>;
export const TimesheetRowsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TimesheetRows"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"500"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"timesheetEntries"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"workDate"}},{"kind":"Field","name":{"kind":"Name","value":"hoursWorked"}},{"kind":"Field","name":{"kind":"Name","value":"projectCode"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"batchId"}}]}}]}}]} as unknown as DocumentNode<TimesheetRowsQuery, TimesheetRowsQueryVariables>;
export const SubmitTimesheetWeekDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SubmitTimesheetWeek"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"weekStartDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NaiveDate"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitTimesheetWeek"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"weekStartDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"weekStartDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"weekStartDate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"workflowInstanceId"}},{"kind":"Field","name":{"kind":"Name","value":"submittedAt"}}]}}]}}]} as unknown as DocumentNode<SubmitTimesheetWeekMutation, SubmitTimesheetWeekMutationVariables>;
export const UpdateTimesheetEntryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTimesheetEntry"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateTimesheetEntryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTimesheetEntry"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"workDate"}},{"kind":"Field","name":{"kind":"Name","value":"hoursWorked"}},{"kind":"Field","name":{"kind":"Name","value":"projectCode"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"batchId"}}]}}]}}]} as unknown as DocumentNode<UpdateTimesheetEntryMutation, UpdateTimesheetEntryMutationVariables>;
export const TimesheetProjectsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TimesheetProjects"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"timesheetProjects"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<TimesheetProjectsQuery, TimesheetProjectsQueryVariables>;
export const TimesheetProjectsForEmployeeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TimesheetProjectsForEmployee"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"100"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"timesheetProjectsForEmployee"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"employeeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<TimesheetProjectsForEmployeeQuery, TimesheetProjectsForEmployeeQueryVariables>;
export const EmployeeTimesheetProjectCodesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EmployeeTimesheetProjectCodes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employeeTimesheetProjectCodes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"employeeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}}]}]}}]} as unknown as DocumentNode<EmployeeTimesheetProjectCodesQuery, EmployeeTimesheetProjectCodesQueryVariables>;
export const SetEmployeeTimesheetProjectsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetEmployeeTimesheetProjects"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectCodes"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setEmployeeTimesheetProjects"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"employeeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"projectCodes"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectCodes"}}}]}]}}]} as unknown as DocumentNode<SetEmployeeTimesheetProjectsMutation, SetEmployeeTimesheetProjectsMutationVariables>;
export const TimesheetTaskTypesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TimesheetTaskTypes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectCode"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"timesheetTaskTypes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectCode"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectCode"}}}]}]}}]} as unknown as DocumentNode<TimesheetTaskTypesQuery, TimesheetTaskTypesQueryVariables>;
export const AttendanceAdjustmentPolicyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AttendanceAdjustmentPolicy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attendanceAdjustmentPolicy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"maxSelfAdjustDays"}}]}}]}}]} as unknown as DocumentNode<AttendanceAdjustmentPolicyQuery, AttendanceAdjustmentPolicyQueryVariables>;
export const TimesheetLockPolicyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TimesheetLockPolicy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"timesheetLockPolicy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"editableWeekSpan"}},{"kind":"Field","name":{"kind":"Name","value":"lockApprovedEntries"}}]}}]}}]} as unknown as DocumentNode<TimesheetLockPolicyQuery, TimesheetLockPolicyQueryVariables>;
export const TimesheetWeekBatchesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TimesheetWeekBatches"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"80"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"timesheetWeekBatches"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"weekStartDate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"submittedAt"}},{"kind":"Field","name":{"kind":"Name","value":"workflowInstanceId"}},{"kind":"Field","name":{"kind":"Name","value":"pendingApprovalStage"}},{"kind":"Field","name":{"kind":"Name","value":"viewerMayApprove"}}]}}]}}]} as unknown as DocumentNode<TimesheetWeekBatchesQuery, TimesheetWeekBatchesQueryVariables>;
export const ApproveTimesheetWeekBatchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ApproveTimesheetWeekBatch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"approveTimesheetWeekBatch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"weekStartDate"}},{"kind":"Field","name":{"kind":"Name","value":"workflowInstanceId"}}]}}]}}]} as unknown as DocumentNode<ApproveTimesheetWeekBatchMutation, ApproveTimesheetWeekBatchMutationVariables>;
export const RejectTimesheetWeekBatchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RejectTimesheetWeekBatch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"rejectionReason"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rejectTimesheetWeekBatch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"rejectionReason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"rejectionReason"}}}]}]}}]} as unknown as DocumentNode<RejectTimesheetWeekBatchMutation, RejectTimesheetWeekBatchMutationVariables>;
export const UpsertAttendanceAdjustmentPolicyHrDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertAttendanceAdjustmentPolicyHr"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertAttendanceAdjustmentPolicyInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertAttendanceAdjustmentPolicy"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"maxSelfAdjustDays"}}]}}]}}]} as unknown as DocumentNode<UpsertAttendanceAdjustmentPolicyHrMutation, UpsertAttendanceAdjustmentPolicyHrMutationVariables>;
export const UpsertTimesheetLockPolicyHrDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertTimesheetLockPolicyHr"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertTimesheetLockPolicyInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertTimesheetLockPolicy"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"editableWeekSpan"}},{"kind":"Field","name":{"kind":"Name","value":"lockApprovedEntries"}}]}}]}}]} as unknown as DocumentNode<UpsertTimesheetLockPolicyHrMutation, UpsertTimesheetLockPolicyHrMutationVariables>;
export const UpsertTimesheetProjectHrDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertTimesheetProjectHr"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"code"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"displayOrder"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertTimesheetProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"code"},"value":{"kind":"Variable","name":{"kind":"Name","value":"code"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"displayOrder"},"value":{"kind":"Variable","name":{"kind":"Name","value":"displayOrder"}}}]}]}}]} as unknown as DocumentNode<UpsertTimesheetProjectHrMutation, UpsertTimesheetProjectHrMutationVariables>;
export const UpsertTimesheetTaskTypesHrDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertTimesheetTaskTypesHr"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectCode"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"taskCodes"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertTimesheetTaskTypes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectCode"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectCode"}}},{"kind":"Argument","name":{"kind":"Name","value":"taskCodes"},"value":{"kind":"Variable","name":{"kind":"Name","value":"taskCodes"}}}]}]}}]} as unknown as DocumentNode<UpsertTimesheetTaskTypesHrMutation, UpsertTimesheetTaskTypesHrMutationVariables>;
export const TaxComputationsListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TaxComputationsList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"10"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"taxComputations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fiscalYear"}},{"kind":"Field","name":{"kind":"Name","value":"taxConfigVersionId"}},{"kind":"Field","name":{"kind":"Name","value":"taxRegimeChosen"}},{"kind":"Field","name":{"kind":"Name","value":"grossIncome"}},{"kind":"Field","name":{"kind":"Name","value":"totalDeductions"}},{"kind":"Field","name":{"kind":"Name","value":"taxableIncome"}},{"kind":"Field","name":{"kind":"Name","value":"finalTax"}},{"kind":"Field","name":{"kind":"Name","value":"tdsPerMonth"}},{"kind":"Field","name":{"kind":"Name","value":"computedAt"}}]}}]}}]} as unknown as DocumentNode<TaxComputationsListQuery, TaxComputationsListQueryVariables>;
export const TaxProofLinesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TaxProofLines"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"taxConfigVersionId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fiscalYear"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"taxProofLines"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"employeeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"taxConfigVersionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"taxConfigVersionId"}}},{"kind":"Argument","name":{"kind":"Name","value":"fiscalYear"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fiscalYear"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sectionCode"}},{"kind":"Field","name":{"kind":"Name","value":"declaredAmount"}},{"kind":"Field","name":{"kind":"Name","value":"actualAmount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"fileStorageId"}},{"kind":"Field","name":{"kind":"Name","value":"rejectionReason"}},{"kind":"Field","name":{"kind":"Name","value":"fiscalYear"}}]}}]}}]} as unknown as DocumentNode<TaxProofLinesQuery, TaxProofLinesQueryVariables>;
export const OrgDocumentsListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrgDocumentsList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tlim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"50"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dlim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"50"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"companyDocuments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"fileStorageId"}},{"kind":"Field","name":{"kind":"Name","value":"originalFileName"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"fileSizeBytes"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"visibleToEmployees"}},{"kind":"Field","name":{"kind":"Name","value":"uploadedByUserId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"documentTypes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tlim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"isRequired"}}]}},{"kind":"Field","name":{"kind":"Name","value":"employeeDocuments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dlim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"documentTypeId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"uploadedAt"}},{"kind":"Field","name":{"kind":"Name","value":"expiryDate"}}]}}]}}]} as unknown as DocumentNode<OrgDocumentsListQuery, OrgDocumentsListQueryVariables>;
export const ClientOpsPayslipsListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ClientOpsPayslipsList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"10"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payslips"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"netSalary"}},{"kind":"Field","name":{"kind":"Name","value":"grossSalary"}},{"kind":"Field","name":{"kind":"Name","value":"totalDeductions"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"generatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"salaryComponentId"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"componentType"}}]}}]}}]}}]} as unknown as DocumentNode<ClientOpsPayslipsListQuery, ClientOpsPayslipsListQueryVariables>;
export const IndiaTdsMonthlySummaryCsvDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"IndiaTdsMonthlySummaryCsv"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"month"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"year"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"indiaTdsMonthlySummaryCsv"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"month"},"value":{"kind":"Variable","name":{"kind":"Name","value":"month"}}},{"kind":"Argument","name":{"kind":"Name","value":"year"},"value":{"kind":"Variable","name":{"kind":"Name","value":"year"}}}]}]}}]} as unknown as DocumentNode<IndiaTdsMonthlySummaryCsvQuery, IndiaTdsMonthlySummaryCsvQueryVariables>;
export const IndiaPfEsiMonthlySummaryCsvDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"IndiaPfEsiMonthlySummaryCsv"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"month"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"year"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"indiaPfEsiMonthlySummaryCsv"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"month"},"value":{"kind":"Variable","name":{"kind":"Name","value":"month"}}},{"kind":"Argument","name":{"kind":"Name","value":"year"},"value":{"kind":"Variable","name":{"kind":"Name","value":"year"}}}]}]}}]} as unknown as DocumentNode<IndiaPfEsiMonthlySummaryCsvQuery, IndiaPfEsiMonthlySummaryCsvQueryVariables>;
export const PayrollBankTransferCsvDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PayrollBankTransferCsv"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"month"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"year"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payrollBankTransferCsv"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"month"},"value":{"kind":"Variable","name":{"kind":"Name","value":"month"}}},{"kind":"Argument","name":{"kind":"Name","value":"year"},"value":{"kind":"Variable","name":{"kind":"Name","value":"year"}}}]}]}}]} as unknown as DocumentNode<PayrollBankTransferCsvQuery, PayrollBankTransferCsvQueryVariables>;
export const PayrollIndiaBulkNeftCreditCsvDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PayrollIndiaBulkNeftCreditCsv"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"month"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"year"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payrollIndiaBulkNeftCreditCsv"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"month"},"value":{"kind":"Variable","name":{"kind":"Name","value":"month"}}},{"kind":"Argument","name":{"kind":"Name","value":"year"},"value":{"kind":"Variable","name":{"kind":"Name","value":"year"}}}]}]}}]} as unknown as DocumentNode<PayrollIndiaBulkNeftCreditCsvQuery, PayrollIndiaBulkNeftCreditCsvQueryVariables>;
export const IndiaFyPayrollEmployeeTotalsCsvDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"IndiaFyPayrollEmployeeTotalsCsv"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fyStartYear"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"indiaFyPayrollEmployeeTotalsCsv"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"fyStartYear"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fyStartYear"}}}]}]}}]} as unknown as DocumentNode<IndiaFyPayrollEmployeeTotalsCsvQuery, IndiaFyPayrollEmployeeTotalsCsvQueryVariables>;
export const IndiaFyQuarterPayrollEmployeeTotalsCsvDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"IndiaFyQuarterPayrollEmployeeTotalsCsv"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fyStartYear"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"quarter"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"indiaFyQuarterPayrollEmployeeTotalsCsv"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"fyStartYear"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fyStartYear"}}},{"kind":"Argument","name":{"kind":"Name","value":"quarter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"quarter"}}}]}]}}]} as unknown as DocumentNode<IndiaFyQuarterPayrollEmployeeTotalsCsvQuery, IndiaFyQuarterPayrollEmployeeTotalsCsvQueryVariables>;
export const IndiaForm16PartBFyPrepStubCsvDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"IndiaForm16PartBFyPrepStubCsv"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fyStartYear"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"indiaForm16PartBFyPrepStubCsv"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"fyStartYear"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fyStartYear"}}}]}]}}]} as unknown as DocumentNode<IndiaForm16PartBFyPrepStubCsvQuery, IndiaForm16PartBFyPrepStubCsvQueryVariables>;
export const IndiaForm24qSalaryPaymentMonthlyStubCsvDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"IndiaForm24qSalaryPaymentMonthlyStubCsv"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"month"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"year"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"indiaForm24qSalaryPaymentMonthlyStubCsv"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"month"},"value":{"kind":"Variable","name":{"kind":"Name","value":"month"}}},{"kind":"Argument","name":{"kind":"Name","value":"year"},"value":{"kind":"Variable","name":{"kind":"Name","value":"year"}}}]}]}}]} as unknown as DocumentNode<IndiaForm24qSalaryPaymentMonthlyStubCsvQuery, IndiaForm24qSalaryPaymentMonthlyStubCsvQueryVariables>;
export const PayrollComplianceSettingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PayrollComplianceSetting"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payrollComplianceSetting"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employerTan"}},{"kind":"Field","name":{"kind":"Name","value":"employerLegalName"}},{"kind":"Field","name":{"kind":"Name","value":"baseSalaryComponentCode"}},{"kind":"Field","name":{"kind":"Name","value":"arrearSalaryComponentCode"}},{"kind":"Field","name":{"kind":"Name","value":"payslipHeaderTitle"}},{"kind":"Field","name":{"kind":"Name","value":"payslipLogoFileStorageId"}}]}}]}}]} as unknown as DocumentNode<PayrollComplianceSettingQuery, PayrollComplianceSettingQueryVariables>;
export const PayslipLogoSignedReadUrlDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PayslipLogoSignedReadUrl"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fileStorageId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ttlSeconds"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"600"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payslipLogoSignedReadUrl"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"fileStorageId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fileStorageId"}}},{"kind":"Argument","name":{"kind":"Name","value":"ttlSeconds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ttlSeconds"}}}]}]}}]} as unknown as DocumentNode<PayslipLogoSignedReadUrlQuery, PayslipLogoSignedReadUrlQueryVariables>;
export const UpsertPayrollComplianceSettingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertPayrollComplianceSetting"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertPayrollComplianceSettingInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertPayrollComplianceSetting"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employerTan"}},{"kind":"Field","name":{"kind":"Name","value":"employerLegalName"}},{"kind":"Field","name":{"kind":"Name","value":"baseSalaryComponentCode"}},{"kind":"Field","name":{"kind":"Name","value":"arrearSalaryComponentCode"}},{"kind":"Field","name":{"kind":"Name","value":"payslipHeaderTitle"}},{"kind":"Field","name":{"kind":"Name","value":"payslipLogoFileStorageId"}}]}}]}}]} as unknown as DocumentNode<UpsertPayrollComplianceSettingMutation, UpsertPayrollComplianceSettingMutationVariables>;
export const TaxSectionDefinitionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TaxSectionDefinitions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"activeOnly"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}},"defaultValue":{"kind":"BooleanValue","value":true}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"taxSectionDefinitions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"activeOnly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"activeOnly"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sectionCode"}},{"kind":"Field","name":{"kind":"Name","value":"sectionLabel"}},{"kind":"Field","name":{"kind":"Name","value":"regimeScope"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"displayOrder"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"maxDeductionAmount"}}]}}]}}]} as unknown as DocumentNode<TaxSectionDefinitionsQuery, TaxSectionDefinitionsQueryVariables>;
export const UpsertTaxSectionDefinitionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertTaxSectionDefinition"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertTaxSectionDefinitionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertTaxSectionDefinition"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sectionCode"}},{"kind":"Field","name":{"kind":"Name","value":"sectionLabel"}},{"kind":"Field","name":{"kind":"Name","value":"regimeScope"}}]}}]}}]} as unknown as DocumentNode<UpsertTaxSectionDefinitionMutation, UpsertTaxSectionDefinitionMutationVariables>;
export const UpsertTaxConfigurationVersionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertTaxConfigurationVersion"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertTaxConfigurationVersionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertTaxConfigurationVersion"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fiscalYear"}},{"kind":"Field","name":{"kind":"Name","value":"regime"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<UpsertTaxConfigurationVersionMutation, UpsertTaxConfigurationVersionMutationVariables>;
export const UpsertTaxSlabDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertTaxSlab"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertTaxSlabInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertTaxSlab"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"taxConfigVersionId"}},{"kind":"Field","name":{"kind":"Name","value":"incomeFrom"}},{"kind":"Field","name":{"kind":"Name","value":"incomeTo"}},{"kind":"Field","name":{"kind":"Name","value":"taxRate"}},{"kind":"Field","name":{"kind":"Name","value":"surchargeRate"}},{"kind":"Field","name":{"kind":"Name","value":"cessRate"}}]}}]}}]} as unknown as DocumentNode<UpsertTaxSlabMutation, UpsertTaxSlabMutationVariables>;
export const IndiaEpfMonthlyEcrPrepStubCsvDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"IndiaEpfMonthlyEcrPrepStubCsv"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"month"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"year"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"indiaEpfMonthlyEcrPrepStubCsv"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"month"},"value":{"kind":"Variable","name":{"kind":"Name","value":"month"}}},{"kind":"Argument","name":{"kind":"Name","value":"year"},"value":{"kind":"Variable","name":{"kind":"Name","value":"year"}}}]}]}}]} as unknown as DocumentNode<IndiaEpfMonthlyEcrPrepStubCsvQuery, IndiaEpfMonthlyEcrPrepStubCsvQueryVariables>;
export const RunPayrollForCycleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RunPayrollForCycle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"payrollCycleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"runPayrollForCycle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"payrollCycleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"payrollCycleId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<RunPayrollForCycleMutation, RunPayrollForCycleMutationVariables>;
export const CreatePayrollCycleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreatePayrollCycle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreatePayrollCycleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPayrollCycle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"paymentDate"}}]}}]}}]} as unknown as DocumentNode<CreatePayrollCycleMutation, CreatePayrollCycleMutationVariables>;
export const SubmitLeaveRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SubmitLeaveRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SubmitLeaveRequestInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitLeaveRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"fromDate"}},{"kind":"Field","name":{"kind":"Name","value":"toDate"}},{"kind":"Field","name":{"kind":"Name","value":"daysRequested"}},{"kind":"Field","name":{"kind":"Name","value":"workflowInstanceId"}}]}}]}}]} as unknown as DocumentNode<SubmitLeaveRequestMutation, SubmitLeaveRequestMutationVariables>;
export const ApproveLeaveRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ApproveLeaveRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"leaveRequestId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"approveLeaveRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"leaveRequestId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"leaveRequestId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"fromDate"}},{"kind":"Field","name":{"kind":"Name","value":"toDate"}},{"kind":"Field","name":{"kind":"Name","value":"daysRequested"}},{"kind":"Field","name":{"kind":"Name","value":"workflowInstanceId"}}]}}]}}]} as unknown as DocumentNode<ApproveLeaveRequestMutation, ApproveLeaveRequestMutationVariables>;
export const RejectLeaveRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RejectLeaveRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"leaveRequestId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rejectLeaveRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"leaveRequestId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"leaveRequestId"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"workflowInstanceId"}}]}}]}}]} as unknown as DocumentNode<RejectLeaveRequestMutation, RejectLeaveRequestMutationVariables>;
export const CancelLeaveRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelLeaveRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"leaveRequestId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelLeaveRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"leaveRequestId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"leaveRequestId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}}]}}]}}]} as unknown as DocumentNode<CancelLeaveRequestMutation, CancelLeaveRequestMutationVariables>;
export const UpsertLeaveTypeAdminDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertLeaveTypeAdmin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertLeaveTypeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertLeaveType"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"isPaid"}},{"kind":"Field","name":{"kind":"Name","value":"carryForward"}},{"kind":"Field","name":{"kind":"Name","value":"sandwichRule"}},{"kind":"Field","name":{"kind":"Name","value":"halfDayAllowed"}},{"kind":"Field","name":{"kind":"Name","value":"requiresDocument"}}]}}]}}]} as unknown as DocumentNode<UpsertLeaveTypeAdminMutation, UpsertLeaveTypeAdminMutationVariables>;
export const DeleteLeaveTypeAdminDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteLeaveTypeAdmin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"leaveTypeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteLeaveType"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"leaveTypeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"leaveTypeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]} as unknown as DocumentNode<DeleteLeaveTypeAdminMutation, DeleteLeaveTypeAdminMutationVariables>;
export const UpsertLeavePolicyAdminDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertLeavePolicyAdmin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertLeavePolicyInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertLeavePolicy"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"leaveTypeId"}},{"kind":"Field","name":{"kind":"Name","value":"annualEntitlement"}},{"kind":"Field","name":{"kind":"Name","value":"accrualFrequency"}},{"kind":"Field","name":{"kind":"Name","value":"accrualDays"}},{"kind":"Field","name":{"kind":"Name","value":"maxConsecutiveDays"}},{"kind":"Field","name":{"kind":"Name","value":"minNoticeDays"}}]}}]}}]} as unknown as DocumentNode<UpsertLeavePolicyAdminMutation, UpsertLeavePolicyAdminMutationVariables>;
export const DeleteLeavePolicyAdminDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteLeavePolicyAdmin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"leavePolicyId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteLeavePolicy"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"leavePolicyId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"leavePolicyId"}}}]}]}}]} as unknown as DocumentNode<DeleteLeavePolicyAdminMutation, DeleteLeavePolicyAdminMutationVariables>;
export const UpsertLeaveBalanceAdminDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertLeaveBalanceAdmin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertLeaveBalanceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertLeaveBalance"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"leaveTypeId"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"entitledDays"}},{"kind":"Field","name":{"kind":"Name","value":"balanceDays"}},{"kind":"Field","name":{"kind":"Name","value":"pendingDays"}},{"kind":"Field","name":{"kind":"Name","value":"usedDays"}}]}}]}}]} as unknown as DocumentNode<UpsertLeaveBalanceAdminMutation, UpsertLeaveBalanceAdminMutationVariables>;
export const AdjustLeaveBalanceEntitlementAdminDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdjustLeaveBalanceEntitlementAdmin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdjustLeaveBalanceEntitlementInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adjustLeaveBalanceEntitlement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"entitledDays"}},{"kind":"Field","name":{"kind":"Name","value":"balanceDays"}}]}}]}}]} as unknown as DocumentNode<AdjustLeaveBalanceEntitlementAdminMutation, AdjustLeaveBalanceEntitlementAdminMutationVariables>;
export const ProvisionLeaveBalancesFromPoliciesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ProvisionLeaveBalancesFromPolicies"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"year"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"provisionLeaveBalancesFromPolicies"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"year"},"value":{"kind":"Variable","name":{"kind":"Name","value":"year"}}}]}]}}]} as unknown as DocumentNode<ProvisionLeaveBalancesFromPoliciesMutation, ProvisionLeaveBalancesFromPoliciesMutationVariables>;
export const UpsertHolidayCalendarAdminDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertHolidayCalendarAdmin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertHolidayCalendarInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertHolidayCalendar"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"year"}}]}}]}}]} as unknown as DocumentNode<UpsertHolidayCalendarAdminMutation, UpsertHolidayCalendarAdminMutationVariables>;
export const DeleteHolidayCalendarAdminDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteHolidayCalendarAdmin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"calendarId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteHolidayCalendar"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"calendarId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"calendarId"}}}]}]}}]} as unknown as DocumentNode<DeleteHolidayCalendarAdminMutation, DeleteHolidayCalendarAdminMutationVariables>;
export const UpsertHolidayDayAdminDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertHolidayDayAdmin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertHolidayDayInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertHolidayDay"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"calendarId"}},{"kind":"Field","name":{"kind":"Name","value":"holidayDate"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<UpsertHolidayDayAdminMutation, UpsertHolidayDayAdminMutationVariables>;
export const DeleteHolidayDayAdminDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteHolidayDayAdmin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"holidayId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteHolidayDay"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"holidayId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"holidayId"}}}]}]}}]} as unknown as DocumentNode<DeleteHolidayDayAdminMutation, DeleteHolidayDayAdminMutationVariables>;
export const SubmitExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SubmitExpense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SubmitExpenseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"workflowInstanceId"}},{"kind":"Field","name":{"kind":"Name","value":"paymentStatus"}},{"kind":"Field","name":{"kind":"Name","value":"receiptFileStorageId"}}]}}]}}]} as unknown as DocumentNode<SubmitExpenseMutation, SubmitExpenseMutationVariables>;
export const CreatePayrollArrearDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreatePayrollArrear"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreatePayrollArrearInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPayrollArrear"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<CreatePayrollArrearMutation, CreatePayrollArrearMutationVariables>;
export const ApproveExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ApproveExpense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expenseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"approvedAmount"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"approveExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"expenseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expenseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"approvedAmount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"approvedAmount"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"workflowInstanceId"}},{"kind":"Field","name":{"kind":"Name","value":"approvedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"paymentStatus"}}]}}]}}]} as unknown as DocumentNode<ApproveExpenseMutation, ApproveExpenseMutationVariables>;
export const MarkExpensePaymentStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkExpensePaymentStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expenseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"paymentStatus"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"paymentReference"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markExpensePaymentStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"expenseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expenseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"paymentStatus"},"value":{"kind":"Variable","name":{"kind":"Name","value":"paymentStatus"}}},{"kind":"Argument","name":{"kind":"Name","value":"paymentReference"},"value":{"kind":"Variable","name":{"kind":"Name","value":"paymentReference"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"approvedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"paymentStatus"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"paymentReference"}}]}}]}}]} as unknown as DocumentNode<MarkExpensePaymentStatusMutation, MarkExpensePaymentStatusMutationVariables>;
export const RejectExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RejectExpense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expenseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rejectExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"expenseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expenseId"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"workflowInstanceId"}},{"kind":"Field","name":{"kind":"Name","value":"paymentStatus"}}]}}]}}]} as unknown as DocumentNode<RejectExpenseMutation, RejectExpenseMutationVariables>;
export const SubmitTravelRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SubmitTravelRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SubmitTravelRequestInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitTravelRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"purpose"}},{"kind":"Field","name":{"kind":"Name","value":"fromDate"}},{"kind":"Field","name":{"kind":"Name","value":"toDate"}},{"kind":"Field","name":{"kind":"Name","value":"workflowInstanceId"}}]}}]}}]} as unknown as DocumentNode<SubmitTravelRequestMutation, SubmitTravelRequestMutationVariables>;
export const ApproveTravelRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ApproveTravelRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"travelRequestId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"approveTravelRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"travelRequestId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"travelRequestId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"approvedBy"}},{"kind":"Field","name":{"kind":"Name","value":"rejectedBy"}},{"kind":"Field","name":{"kind":"Name","value":"rejectionReason"}},{"kind":"Field","name":{"kind":"Name","value":"workflowInstanceId"}}]}}]}}]} as unknown as DocumentNode<ApproveTravelRequestMutation, ApproveTravelRequestMutationVariables>;
export const RejectTravelRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RejectTravelRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"travelRequestId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rejectTravelRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"travelRequestId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"travelRequestId"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"approvedBy"}},{"kind":"Field","name":{"kind":"Name","value":"rejectedBy"}},{"kind":"Field","name":{"kind":"Name","value":"rejectionReason"}},{"kind":"Field","name":{"kind":"Name","value":"workflowInstanceId"}}]}}]}}]} as unknown as DocumentNode<RejectTravelRequestMutation, RejectTravelRequestMutationVariables>;
export const UpsertExpenseCategoryAdminDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertExpenseCategoryAdmin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertExpenseCategoryAdminInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertExpenseCategoryAdmin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"maxAmountPerClaim"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpsertExpenseCategoryAdminMutation, UpsertExpenseCategoryAdminMutationVariables>;
export const DeleteExpenseCategoryAdminDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteExpenseCategoryAdmin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expenseCategoryId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteExpenseCategoryAdmin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"expenseCategoryId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expenseCategoryId"}}}]}]}}]} as unknown as DocumentNode<DeleteExpenseCategoryAdminMutation, DeleteExpenseCategoryAdminMutationVariables>;
export const UpsertExpensePolicyAdminDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertExpensePolicyAdmin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertExpensePolicyAdminInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertExpensePolicyAdmin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"tenantId"}},{"kind":"Field","name":{"kind":"Name","value":"expenseCategoryId"}},{"kind":"Field","name":{"kind":"Name","value":"applicableTo"}},{"kind":"Field","name":{"kind":"Name","value":"departmentId"}},{"kind":"Field","name":{"kind":"Name","value":"designationId"}},{"kind":"Field","name":{"kind":"Name","value":"roleId"}},{"kind":"Field","name":{"kind":"Name","value":"limitPerDay"}},{"kind":"Field","name":{"kind":"Name","value":"limitPerMonth"}},{"kind":"Field","name":{"kind":"Name","value":"maxAmountPerClaim"}},{"kind":"Field","name":{"kind":"Name","value":"receiptRequired"}},{"kind":"Field","name":{"kind":"Name","value":"approvalRequired"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpsertExpensePolicyAdminMutation, UpsertExpensePolicyAdminMutationVariables>;
export const DeleteExpensePolicyAdminDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteExpensePolicyAdmin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expensePolicyId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteExpensePolicyAdmin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"expensePolicyId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expensePolicyId"}}}]}]}}]} as unknown as DocumentNode<DeleteExpensePolicyAdminMutation, DeleteExpensePolicyAdminMutationVariables>;
export const ExpenseSubmissionHintsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExpenseSubmissionHints"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expenseCategoryId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"expenseSubmissionHints"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"expenseCategoryId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expenseCategoryId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"expenseCategoryId"}},{"kind":"Field","name":{"kind":"Name","value":"maxAmountPerClaim"}},{"kind":"Field","name":{"kind":"Name","value":"receiptRequired"}},{"kind":"Field","name":{"kind":"Name","value":"limitPerMonth"}},{"kind":"Field","name":{"kind":"Name","value":"limitPerDay"}}]}}]}}]} as unknown as DocumentNode<ExpenseSubmissionHintsQuery, ExpenseSubmissionHintsQueryVariables>;
export const ExpensePoliciesForAdminDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExpensePoliciesForAdmin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expenseCategoryId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"expensePoliciesForAdmin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"expenseCategoryId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expenseCategoryId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"applicableTo"}},{"kind":"Field","name":{"kind":"Name","value":"departmentId"}},{"kind":"Field","name":{"kind":"Name","value":"designationId"}},{"kind":"Field","name":{"kind":"Name","value":"roleId"}},{"kind":"Field","name":{"kind":"Name","value":"limitPerDay"}},{"kind":"Field","name":{"kind":"Name","value":"limitPerMonth"}},{"kind":"Field","name":{"kind":"Name","value":"maxAmountPerClaim"}},{"kind":"Field","name":{"kind":"Name","value":"receiptRequired"}},{"kind":"Field","name":{"kind":"Name","value":"approvalRequired"}}]}}]}}]} as unknown as DocumentNode<ExpensePoliciesForAdminQuery, ExpensePoliciesForAdminQueryVariables>;
export const AdminExpenseCategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminExpenseCategories"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"expenseCategories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"maxAmountPerClaim"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<AdminExpenseCategoriesQuery, AdminExpenseCategoriesQueryVariables>;
export const MarkNotificationReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkNotificationRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markNotificationRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}}]}}]}}]} as unknown as DocumentNode<MarkNotificationReadMutation, MarkNotificationReadMutationVariables>;
export const MarkAllNotificationsReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkAllNotificationsRead"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markAllNotificationsRead"}}]}}]} as unknown as DocumentNode<MarkAllNotificationsReadMutation, MarkAllNotificationsReadMutationVariables>;
export const PunchTodayDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PunchToday"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PunchTodayInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"punchToday"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"workDate"}},{"kind":"Field","name":{"kind":"Name","value":"checkInTime"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutTime"}},{"kind":"Field","name":{"kind":"Name","value":"checkInLat"}},{"kind":"Field","name":{"kind":"Name","value":"checkInLng"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutLat"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutLng"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<PunchTodayMutation, PunchTodayMutationVariables>;
export const AddManualAttendanceSegmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddManualAttendanceSegment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddManualAttendanceSegmentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addManualAttendanceSegment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"workDate"}},{"kind":"Field","name":{"kind":"Name","value":"checkInTime"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutTime"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<AddManualAttendanceSegmentMutation, AddManualAttendanceSegmentMutationVariables>;
export const UpdateManualAttendanceSegmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateManualAttendanceSegment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateManualAttendanceSegmentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateManualAttendanceSegment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"workDate"}},{"kind":"Field","name":{"kind":"Name","value":"checkInTime"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutTime"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<UpdateManualAttendanceSegmentMutation, UpdateManualAttendanceSegmentMutationVariables>;
export const CreateTimesheetEntryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateTimesheetEntry"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateTimesheetEntryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTimesheetEntry"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"workDate"}},{"kind":"Field","name":{"kind":"Name","value":"hoursWorked"}},{"kind":"Field","name":{"kind":"Name","value":"projectCode"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<CreateTimesheetEntryMutation, CreateTimesheetEntryMutationVariables>;
export const DeleteTimesheetEntryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteTimesheetEntry"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteTimesheetEntry"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteTimesheetEntryMutation, DeleteTimesheetEntryMutationVariables>;
export const UpsertTaxComputationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertTaxComputation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertTaxComputationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertTaxComputation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fiscalYear"}},{"kind":"Field","name":{"kind":"Name","value":"taxRegimeChosen"}}]}}]}}]} as unknown as DocumentNode<UpsertTaxComputationMutation, UpsertTaxComputationMutationVariables>;
export const SubmitTaxProofLineDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SubmitTaxProofLine"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SubmitTaxProofLineInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitTaxProofLine"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"sectionCode"}},{"kind":"Field","name":{"kind":"Name","value":"declaredAmount"}},{"kind":"Field","name":{"kind":"Name","value":"actualAmount"}}]}}]}}]} as unknown as DocumentNode<SubmitTaxProofLineMutation, SubmitTaxProofLineMutationVariables>;
export const ApproveTaxProofLineDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ApproveTaxProofLine"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"taxProofLineId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"approveTaxProofLine"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"taxProofLineId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"taxProofLineId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"sectionCode"}}]}}]}}]} as unknown as DocumentNode<ApproveTaxProofLineMutation, ApproveTaxProofLineMutationVariables>;
export const RejectTaxProofLineDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RejectTaxProofLine"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"taxProofLineId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rejectTaxProofLine"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"taxProofLineId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"taxProofLineId"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"sectionCode"}}]}}]}}]} as unknown as DocumentNode<RejectTaxProofLineMutation, RejectTaxProofLineMutationVariables>;
export const CreateEmployeeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateEmployee"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateEmployeeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createEmployee"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"dateOfJoining"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerId"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"linkedUserUsername"}},{"kind":"Field","name":{"kind":"Name","value":"linkedUserEmail"}}]}}]}}]} as unknown as DocumentNode<CreateEmployeeMutation, CreateEmployeeMutationVariables>;
export const ProvisionEmployeeLoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ProvisionEmployeeLogin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProvisionEmployeeLoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"provisionEmployeeLogin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"linkedUserUsername"}},{"kind":"Field","name":{"kind":"Name","value":"linkedUserEmail"}}]}}]}}]} as unknown as DocumentNode<ProvisionEmployeeLoginMutation, ProvisionEmployeeLoginMutationVariables>;
export const ResetEmployeePasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResetEmployeePassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ResetEmployeePasswordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resetEmployeePassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<ResetEmployeePasswordMutation, ResetEmployeePasswordMutationVariables>;
export const UpdateEmployeeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateEmployee"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateEmployeeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateEmployee"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"dateOfJoining"}},{"kind":"Field","name":{"kind":"Name","value":"departmentId"}},{"kind":"Field","name":{"kind":"Name","value":"designationId"}},{"kind":"Field","name":{"kind":"Name","value":"employmentType"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerId"}},{"kind":"Field","name":{"kind":"Name","value":"linkedUserEmail"}}]}}]}}]} as unknown as DocumentNode<UpdateEmployeeMutation, UpdateEmployeeMutationVariables>;
export const CompanyDocumentAttachmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CompanyDocumentAttachment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"companyDocumentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"companyDocumentAttachment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"companyDocumentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"companyDocumentId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fileName"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"fileSizeBytes"}},{"kind":"Field","name":{"kind":"Name","value":"contentBase64"}}]}}]}}]} as unknown as DocumentNode<CompanyDocumentAttachmentQuery, CompanyDocumentAttachmentQueryVariables>;
export const UpdateEmployeePersonalProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateEmployeePersonalProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateEmployeePersonalProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateEmployeePersonalProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"dateOfBirth"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"nationality"}},{"kind":"Field","name":{"kind":"Name","value":"bloodGroup"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactName"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactRelation"}}]}}]}}]} as unknown as DocumentNode<UpdateEmployeePersonalProfileMutation, UpdateEmployeePersonalProfileMutationVariables>;
export const UpsertEmployeePrimaryBankDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertEmployeePrimaryBank"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertEmployeePrimaryBankInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertEmployeePrimaryBank"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"bankName"}},{"kind":"Field","name":{"kind":"Name","value":"accountNumberMasked"}},{"kind":"Field","name":{"kind":"Name","value":"ifscCode"}},{"kind":"Field","name":{"kind":"Name","value":"accountType"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}}]}}]}}]} as unknown as DocumentNode<UpsertEmployeePrimaryBankMutation, UpsertEmployeePrimaryBankMutationVariables>;
export const UpsertEmployeePrimaryPanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertEmployeePrimaryPan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertEmployeePrimaryPanInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertEmployeePrimaryPan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"maskedPan"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}}]}}]}}]} as unknown as DocumentNode<UpsertEmployeePrimaryPanMutation, UpsertEmployeePrimaryPanMutationVariables>;
export const UpsertEmployeePrimaryAadhaarDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertEmployeePrimaryAadhaar"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertEmployeePrimaryAadhaarInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertEmployeePrimaryAadhaar"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"maskedAadhaar"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}}]}}]}}]} as unknown as DocumentNode<UpsertEmployeePrimaryAadhaarMutation, UpsertEmployeePrimaryAadhaarMutationVariables>;
export const UploadEmployeeDocumentProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UploadEmployeeDocumentProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UploadEmployeeDocumentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uploadEmployeeDocument"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"documentTypeId"}},{"kind":"Field","name":{"kind":"Name","value":"originalFileName"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"documentTypeName"}},{"kind":"Field","name":{"kind":"Name","value":"uploadedAt"}}]}}]}}]} as unknown as DocumentNode<UploadEmployeeDocumentProfileMutation, UploadEmployeeDocumentProfileMutationVariables>;
export const UpdateEmployeeSelfServiceProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateEmployeeSelfServiceProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateEmployeeSelfServiceProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateEmployeeSelfServiceProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"nationality"}},{"kind":"Field","name":{"kind":"Name","value":"bloodGroup"}},{"kind":"Field","name":{"kind":"Name","value":"personalPhone"}},{"kind":"Field","name":{"kind":"Name","value":"currentAddress"}},{"kind":"Field","name":{"kind":"Name","value":"permanentAddress"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactName"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactRelation"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateEmployeeSelfServiceProfileMutation, UpdateEmployeeSelfServiceProfileMutationVariables>;
export const SubmitEmployeeProfileChangeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SubmitEmployeeProfileChange"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SubmitEmployeeProfileChangeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitEmployeeProfileChange"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"requestType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"requestedSummary"}},{"kind":"Field","name":{"kind":"Name","value":"supportingDocumentId"}},{"kind":"Field","name":{"kind":"Name","value":"rejectionReason"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<SubmitEmployeeProfileChangeMutation, SubmitEmployeeProfileChangeMutationVariables>;
export const CancelEmployeeProfileChangeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelEmployeeProfileChange"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"requestId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelEmployeeProfileChange"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"requestId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"requestId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<CancelEmployeeProfileChangeMutation, CancelEmployeeProfileChangeMutationVariables>;
export const ResolveEmployeeProfileChangeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResolveEmployeeProfileChange"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"requestId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"approved"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"rejectionReason"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resolveEmployeeProfileChange"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"requestId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"requestId"}}},{"kind":"Argument","name":{"kind":"Name","value":"approved"},"value":{"kind":"Variable","name":{"kind":"Name","value":"approved"}}},{"kind":"Argument","name":{"kind":"Name","value":"rejectionReason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"rejectionReason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"requestedSummary"}},{"kind":"Field","name":{"kind":"Name","value":"reviewedAt"}},{"kind":"Field","name":{"kind":"Name","value":"rejectionReason"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ResolveEmployeeProfileChangeMutation, ResolveEmployeeProfileChangeMutationVariables>;
export const UpsertEmployeeEducationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertEmployeeEducation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertEmployeeEducationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertEmployeeEducation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"educationLevel"}},{"kind":"Field","name":{"kind":"Name","value":"qualification"}},{"kind":"Field","name":{"kind":"Name","value":"fieldOfStudy"}},{"kind":"Field","name":{"kind":"Name","value":"institution"}},{"kind":"Field","name":{"kind":"Name","value":"boardUniversity"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"completionYear"}},{"kind":"Field","name":{"kind":"Name","value":"gradeScore"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"verificationStatus"}},{"kind":"Field","name":{"kind":"Name","value":"evidenceDocumentIds"}},{"kind":"Field","name":{"kind":"Name","value":"rejectionReason"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpsertEmployeeEducationMutation, UpsertEmployeeEducationMutationVariables>;
export const DeleteEmployeeEducationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteEmployeeEducation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"educationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteEmployeeEducation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"employeeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"educationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"educationId"}}}]}]}}]} as unknown as DocumentNode<DeleteEmployeeEducationMutation, DeleteEmployeeEducationMutationVariables>;
export const LinkEmployeeEducationEvidenceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LinkEmployeeEducationEvidence"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"educationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"employeeDocumentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"linkEmployeeEducationEvidence"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"employeeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"educationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"educationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"employeeDocumentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeDocumentId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"verificationStatus"}},{"kind":"Field","name":{"kind":"Name","value":"evidenceDocumentIds"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<LinkEmployeeEducationEvidenceMutation, LinkEmployeeEducationEvidenceMutationVariables>;
export const UploadEmployeeEducationEvidenceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UploadEmployeeEducationEvidence"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"educationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UploadEmployeeDocumentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uploadEmployeeEducationEvidence"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"educationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"educationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"verificationStatus"}},{"kind":"Field","name":{"kind":"Name","value":"evidenceDocumentIds"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UploadEmployeeEducationEvidenceMutation, UploadEmployeeEducationEvidenceMutationVariables>;
export const ResolveEmployeeEducationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResolveEmployeeEducation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"educationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"approved"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"rejectionReason"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resolveEmployeeEducation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"educationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"educationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"approved"},"value":{"kind":"Variable","name":{"kind":"Name","value":"approved"}}},{"kind":"Argument","name":{"kind":"Name","value":"rejectionReason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"rejectionReason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"verificationStatus"}},{"kind":"Field","name":{"kind":"Name","value":"rejectionReason"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ResolveEmployeeEducationMutation, ResolveEmployeeEducationMutationVariables>;
export const UpsertEmployeeWorkExperienceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertEmployeeWorkExperience"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertEmployeeWorkExperienceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertEmployeeWorkExperience"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"company"}},{"kind":"Field","name":{"kind":"Name","value":"roleTitle"}},{"kind":"Field","name":{"kind":"Name","value":"employmentType"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"isCurrent"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"verificationStatus"}},{"kind":"Field","name":{"kind":"Name","value":"evidenceDocumentIds"}},{"kind":"Field","name":{"kind":"Name","value":"rejectionReason"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpsertEmployeeWorkExperienceMutation, UpsertEmployeeWorkExperienceMutationVariables>;
export const DeleteEmployeeWorkExperienceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteEmployeeWorkExperience"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workExperienceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteEmployeeWorkExperience"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"employeeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"workExperienceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workExperienceId"}}}]}]}}]} as unknown as DocumentNode<DeleteEmployeeWorkExperienceMutation, DeleteEmployeeWorkExperienceMutationVariables>;
export const LinkEmployeeWorkExperienceEvidenceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LinkEmployeeWorkExperienceEvidence"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workExperienceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"employeeDocumentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"linkEmployeeWorkExperienceEvidence"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"employeeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"workExperienceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workExperienceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"employeeDocumentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeDocumentId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"verificationStatus"}},{"kind":"Field","name":{"kind":"Name","value":"evidenceDocumentIds"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<LinkEmployeeWorkExperienceEvidenceMutation, LinkEmployeeWorkExperienceEvidenceMutationVariables>;
export const UploadEmployeeWorkExperienceEvidenceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UploadEmployeeWorkExperienceEvidence"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workExperienceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UploadEmployeeDocumentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uploadEmployeeWorkExperienceEvidence"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workExperienceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workExperienceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"verificationStatus"}},{"kind":"Field","name":{"kind":"Name","value":"evidenceDocumentIds"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UploadEmployeeWorkExperienceEvidenceMutation, UploadEmployeeWorkExperienceEvidenceMutationVariables>;
export const ResolveEmployeeWorkExperienceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResolveEmployeeWorkExperience"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workExperienceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"approved"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"rejectionReason"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resolveEmployeeWorkExperience"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workExperienceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workExperienceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"approved"},"value":{"kind":"Variable","name":{"kind":"Name","value":"approved"}}},{"kind":"Argument","name":{"kind":"Name","value":"rejectionReason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"rejectionReason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"verificationStatus"}},{"kind":"Field","name":{"kind":"Name","value":"rejectionReason"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ResolveEmployeeWorkExperienceMutation, ResolveEmployeeWorkExperienceMutationVariables>;
export const UploadTenantFileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UploadTenantFile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UploadTenantFileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uploadTenantFile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"tenantId"}},{"kind":"Field","name":{"kind":"Name","value":"originalFileName"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"fileSizeBytes"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<UploadTenantFileMutation, UploadTenantFileMutationVariables>;
export const TenantFileAttachmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TenantFileAttachment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fileStorageId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenantFileAttachment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"fileStorageId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fileStorageId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fileName"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"fileSizeBytes"}},{"kind":"Field","name":{"kind":"Name","value":"contentBase64"}}]}}]}}]} as unknown as DocumentNode<TenantFileAttachmentQuery, TenantFileAttachmentQueryVariables>;
export const CreateCompanyDocumentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCompanyDocument"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateCompanyDocumentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCompanyDocument"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"fileStorageId"}},{"kind":"Field","name":{"kind":"Name","value":"originalFileName"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"fileSizeBytes"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"visibleToEmployees"}},{"kind":"Field","name":{"kind":"Name","value":"uploadedByUserId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<CreateCompanyDocumentMutation, CreateCompanyDocumentMutationVariables>;
export const DeleteCompanyDocumentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteCompanyDocument"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"companyDocumentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteCompanyDocument"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"companyDocumentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"companyDocumentId"}}}]}]}}]} as unknown as DocumentNode<DeleteCompanyDocumentMutation, DeleteCompanyDocumentMutationVariables>;
export const ResolveEmployeeDocumentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResolveEmployeeDocument"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"employeeDocumentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"approved"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resolveEmployeeDocument"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"employeeDocumentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeDocumentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"approved"},"value":{"kind":"Variable","name":{"kind":"Name","value":"approved"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<ResolveEmployeeDocumentMutation, ResolveEmployeeDocumentMutationVariables>;
export const OrgDepartmentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrgDepartments"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"departments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"parentDepartmentId"}}]}}]}}]} as unknown as DocumentNode<OrgDepartmentsQuery, OrgDepartmentsQueryVariables>;
export const ExpensePolicyDirectoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExpensePolicyDirectory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"320"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"departments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"parentDepartmentId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"designations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"departmentId"}},{"kind":"Field","name":{"kind":"Name","value":"level"}}]}},{"kind":"Field","name":{"kind":"Name","value":"expenseAssignableRoles"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isSystemRole"}}]}}]}}]} as unknown as DocumentNode<ExpensePolicyDirectoryQuery, ExpensePolicyDirectoryQueryVariables>;
export const OrgChartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrgChart"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"500"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orgChart"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerId"}},{"kind":"Field","name":{"kind":"Name","value":"departmentName"}},{"kind":"Field","name":{"kind":"Name","value":"designationTitle"}}]}}]}}]} as unknown as DocumentNode<OrgChartQuery, OrgChartQueryVariables>;
export const OrganizationDirectoryChartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganizationDirectoryChart"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizationDirectoryChart"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerId"}},{"kind":"Field","name":{"kind":"Name","value":"departmentName"}},{"kind":"Field","name":{"kind":"Name","value":"designationTitle"}}]}}]}}]} as unknown as DocumentNode<OrganizationDirectoryChartQuery, OrganizationDirectoryChartQueryVariables>;
export const ViewerEmployeeIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ViewerEmployeeId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"viewerEmployeeId"}}]}}]} as unknown as DocumentNode<ViewerEmployeeIdQuery, ViewerEmployeeIdQueryVariables>;
export const WorkplaceSuccessionDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkplaceSuccessionData"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"clim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"100"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"plim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"50"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"competencies"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"clim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"talentPools"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"plim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<WorkplaceSuccessionDataQuery, WorkplaceSuccessionDataQueryVariables>;
export const AnalyticsWebhookDeliveryLogsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AnalyticsWebhookDeliveryLogs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"80"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"webhookDeliveryLogs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"webhookSubscriptionId"}},{"kind":"Field","name":{"kind":"Name","value":"eventName"}},{"kind":"Field","name":{"kind":"Name","value":"payloadJson"}},{"kind":"Field","name":{"kind":"Name","value":"httpStatus"}},{"kind":"Field","name":{"kind":"Name","value":"responseBody"}},{"kind":"Field","name":{"kind":"Name","value":"isSuccess"}},{"kind":"Field","name":{"kind":"Name","value":"attemptNumber"}},{"kind":"Field","name":{"kind":"Name","value":"deliveredAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<AnalyticsWebhookDeliveryLogsQuery, AnalyticsWebhookDeliveryLogsQueryVariables>;
export const OnboardingChecklistDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OnboardingChecklist"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"onboardingChecklist"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"taskName"}},{"kind":"Field","name":{"kind":"Name","value":"taskCategory"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"isCompleted"}}]}}]}}]} as unknown as DocumentNode<OnboardingChecklistQuery, OnboardingChecklistQueryVariables>;
export const SetOnboardingChecklistItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetOnboardingChecklistItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"checklistItemId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isCompleted"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setOnboardingChecklistItemCompleted"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"checklistItemId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"checklistItemId"}}},{"kind":"Argument","name":{"kind":"Name","value":"isCompleted"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isCompleted"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isCompleted"}}]}}]}}]} as unknown as DocumentNode<SetOnboardingChecklistItemMutation, SetOnboardingChecklistItemMutationVariables>;
export const AdminWorkflowsDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminWorkflowsData"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"wl"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"30"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"il"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"50"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workflows"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"wl"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"entityType"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"Field","name":{"kind":"Name","value":"workflowInstances"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"il"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"entityType"}},{"kind":"Field","name":{"kind":"Name","value":"entityId"}}]}}]}}]} as unknown as DocumentNode<AdminWorkflowsDataQuery, AdminWorkflowsDataQueryVariables>;
export const AdminWorkflowsStepsDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminWorkflowsStepsData"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"wl"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"30"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workflowsWithSteps"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"wl"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workflow"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"entityType"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"Field","name":{"kind":"Name","value":"steps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sequenceOrder"}},{"kind":"Field","name":{"kind":"Name","value":"stepName"}},{"kind":"Field","name":{"kind":"Name","value":"approverType"}},{"kind":"Field","name":{"kind":"Name","value":"canSkip"}},{"kind":"Field","name":{"kind":"Name","value":"slaHours"}}]}}]}}]}}]} as unknown as DocumentNode<AdminWorkflowsStepsDataQuery, AdminWorkflowsStepsDataQueryVariables>;
export const AdminCreateWorkflowDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminCreateWorkflow"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateWorkflowInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createWorkflow"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"entityType"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<AdminCreateWorkflowMutation, AdminCreateWorkflowMutationVariables>;
export const AdminCreateWorkflowStepDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminCreateWorkflowStep"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateWorkflowStepInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createWorkflowStep"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"workflowId"}},{"kind":"Field","name":{"kind":"Name","value":"sequenceOrder"}},{"kind":"Field","name":{"kind":"Name","value":"stepName"}},{"kind":"Field","name":{"kind":"Name","value":"approverType"}},{"kind":"Field","name":{"kind":"Name","value":"canSkip"}},{"kind":"Field","name":{"kind":"Name","value":"slaHours"}}]}}]}}]} as unknown as DocumentNode<AdminCreateWorkflowStepMutation, AdminCreateWorkflowStepMutationVariables>;
export const AdminDeleteWorkflowStepDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminDeleteWorkflowStep"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"stepId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteWorkflowStep"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"stepId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"stepId"}}}]}]}}]} as unknown as DocumentNode<AdminDeleteWorkflowStepMutation, AdminDeleteWorkflowStepMutationVariables>;
export const AdminReorderWorkflowStepsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminReorderWorkflowSteps"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workflowId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"stepIdsOrdered"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reorderWorkflowSteps"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workflowId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workflowId"}}},{"kind":"Argument","name":{"kind":"Name","value":"stepIdsOrdered"},"value":{"kind":"Variable","name":{"kind":"Name","value":"stepIdsOrdered"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"workflowId"}},{"kind":"Field","name":{"kind":"Name","value":"sequenceOrder"}},{"kind":"Field","name":{"kind":"Name","value":"stepName"}},{"kind":"Field","name":{"kind":"Name","value":"approverType"}},{"kind":"Field","name":{"kind":"Name","value":"canSkip"}},{"kind":"Field","name":{"kind":"Name","value":"slaHours"}}]}}]}}]} as unknown as DocumentNode<AdminReorderWorkflowStepsMutation, AdminReorderWorkflowStepsMutationVariables>;
export const ClientOpsSeparationsListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ClientOpsSeparationsList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"50"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"separations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"separationType"}},{"kind":"Field","name":{"kind":"Name","value":"resignationDate"}},{"kind":"Field","name":{"kind":"Name","value":"lastWorkingDate"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<ClientOpsSeparationsListQuery, ClientOpsSeparationsListQueryVariables>;
export const ClientOpsSubmitSeparationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ClientOpsSubmitSeparation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SubmitSeparationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitSeparation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"lastWorkingDate"}}]}}]}}]} as unknown as DocumentNode<ClientOpsSubmitSeparationMutation, ClientOpsSubmitSeparationMutationVariables>;
export const ApproveSeparationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ApproveSeparation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"separationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"approveSeparation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"separationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"separationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<ApproveSeparationMutation, ApproveSeparationMutationVariables>;
export const RejectSeparationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RejectSeparation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"separationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rejectSeparation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"separationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"separationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<RejectSeparationMutation, RejectSeparationMutationVariables>;
export const ClientOpsFnfBySeparationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ClientOpsFnfBySeparation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"separationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fnfSettlement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"separationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"separationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"separationId"}},{"kind":"Field","name":{"kind":"Name","value":"leaveEncashment"}},{"kind":"Field","name":{"kind":"Name","value":"gratuityAmount"}},{"kind":"Field","name":{"kind":"Name","value":"bonusPayable"}},{"kind":"Field","name":{"kind":"Name","value":"recoveryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"netPayable"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"processedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<ClientOpsFnfBySeparationQuery, ClientOpsFnfBySeparationQueryVariables>;
export const ClientOpsClearanceBySeparationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ClientOpsClearanceBySeparation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"separationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"clearanceChecklist"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"separationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"separationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"separationId"}},{"kind":"Field","name":{"kind":"Name","value":"department"}},{"kind":"Field","name":{"kind":"Name","value":"taskName"}},{"kind":"Field","name":{"kind":"Name","value":"isCleared"}},{"kind":"Field","name":{"kind":"Name","value":"clearedAt"}}]}}]}}]} as unknown as DocumentNode<ClientOpsClearanceBySeparationQuery, ClientOpsClearanceBySeparationQueryVariables>;
export const ClientOpsUpsertFnfDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ClientOpsUpsertFnf"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertFnfSettlementInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertFnfSettlement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"leaveEncashment"}},{"kind":"Field","name":{"kind":"Name","value":"gratuityAmount"}},{"kind":"Field","name":{"kind":"Name","value":"bonusPayable"}},{"kind":"Field","name":{"kind":"Name","value":"recoveryAmount"}},{"kind":"Field","name":{"kind":"Name","value":"netPayable"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<ClientOpsUpsertFnfMutation, ClientOpsUpsertFnfMutationVariables>;
export const ClientOpsFinalizeFnfDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ClientOpsFinalizeFnf"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"separationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"finalizeFnfSettlement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"separationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"separationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"netPayable"}},{"kind":"Field","name":{"kind":"Name","value":"processedAt"}}]}}]}}]} as unknown as DocumentNode<ClientOpsFinalizeFnfMutation, ClientOpsFinalizeFnfMutationVariables>;
export const ClientOpsSetClearanceClearedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ClientOpsSetClearanceCleared"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"clearanceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isCleared"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setClearanceItemCleared"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"clearanceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"clearanceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"isCleared"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isCleared"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isCleared"}},{"kind":"Field","name":{"kind":"Name","value":"clearedAt"}}]}}]}}]} as unknown as DocumentNode<ClientOpsSetClearanceClearedMutation, ClientOpsSetClearanceClearedMutationVariables>;
export const ClientOpsEnsureOffboardingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ClientOpsEnsureOffboarding"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"separationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ensureSeparationOffboardingArtifacts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"separationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"separationId"}}}]}]}}]} as unknown as DocumentNode<ClientOpsEnsureOffboardingMutation, ClientOpsEnsureOffboardingMutationVariables>;
export const WorkplaceCompensationDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkplaceCompensationData"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"blim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"100"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"clim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dlim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"200"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"designations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dlim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"salaryBands"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"blim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"designationId"}},{"kind":"Field","name":{"kind":"Name","value":"grade"}},{"kind":"Field","name":{"kind":"Name","value":"minSalary"}},{"kind":"Field","name":{"kind":"Name","value":"midSalary"}},{"kind":"Field","name":{"kind":"Name","value":"maxSalary"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"effectiveYear"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compensationReviewCycles"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"clim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"budgetPercentage"}}]}}]}}]} as unknown as DocumentNode<WorkplaceCompensationDataQuery, WorkplaceCompensationDataQueryVariables>;
export const WorkplaceGrievanceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkplaceGrievance"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"clim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"30"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"calim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"50"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"grievanceCategories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"clim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"isPosh"}}]}},{"kind":"Field","name":{"kind":"Name","value":"grievanceCases"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"calim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"filedAt"}},{"kind":"Field","name":{"kind":"Name","value":"grievanceCategoryId"}}]}}]}}]} as unknown as DocumentNode<WorkplaceGrievanceQuery, WorkplaceGrievanceQueryVariables>;
export const SubmitGrievanceCaseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SubmitGrievanceCase"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SubmitGrievanceCaseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitGrievanceCase"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}}]}}]}}]} as unknown as DocumentNode<SubmitGrievanceCaseMutation, SubmitGrievanceCaseMutationVariables>;
export const WorkplaceAssetsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkplaceAssets"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"calim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"40"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"alim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assetCategories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"calim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"assets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"alim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"assetCategoryId"}},{"kind":"Field","name":{"kind":"Name","value":"serialNumber"}},{"kind":"Field","name":{"kind":"Name","value":"assetTag"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"purchaseDate"}},{"kind":"Field","name":{"kind":"Name","value":"purchaseValue"}}]}}]}}]} as unknown as DocumentNode<WorkplaceAssetsQuery, WorkplaceAssetsQueryVariables>;
export const WorkplaceLearningDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkplaceLearning"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"80"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"clim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"80"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"skills"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"level"}}]}},{"kind":"Field","name":{"kind":"Name","value":"courses"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"activeOnly"},"value":{"kind":"BooleanValue","value":true}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"clim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryMode"}},{"kind":"Field","name":{"kind":"Name","value":"durationMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"isMandatory"}}]}}]}}]} as unknown as DocumentNode<WorkplaceLearningQuery, WorkplaceLearningQueryVariables>;
export const WorkplacePerformanceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkplacePerformance"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"clim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"glim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"80"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reviewCycles"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"clim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"reviewType"}}]}},{"kind":"Field","name":{"kind":"Name","value":"goals"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"glim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCycleId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"weightage"}}]}}]}}]} as unknown as DocumentNode<WorkplacePerformanceQuery, WorkplacePerformanceQueryVariables>;
export const WorkplaceRecruitmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkplaceRecruitment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"jlim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"30"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"alim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"50"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobPostings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"jlim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"vacancies"}},{"kind":"Field","name":{"kind":"Name","value":"employmentType"}},{"kind":"Field","name":{"kind":"Name","value":"openDate"}},{"kind":"Field","name":{"kind":"Name","value":"closeDate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"applications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"alim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"jobId"}},{"kind":"Field","name":{"kind":"Name","value":"candidateName"}},{"kind":"Field","name":{"kind":"Name","value":"candidateEmail"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"appliedAt"}}]}}]}}]} as unknown as DocumentNode<WorkplaceRecruitmentQuery, WorkplaceRecruitmentQueryVariables>;
export const WorkplaceBenefitsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkplaceBenefits"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tlim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"50"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"plim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"50"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"benefitTypes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tlim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"category"}}]}},{"kind":"Field","name":{"kind":"Name","value":"benefitPlans"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"activeOnly"},"value":{"kind":"BooleanValue","value":true}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"plim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"benefitTypeId"}},{"kind":"Field","name":{"kind":"Name","value":"employerContribution"}},{"kind":"Field","name":{"kind":"Name","value":"employeeContribution"}},{"kind":"Field","name":{"kind":"Name","value":"contributionType"}},{"kind":"Field","name":{"kind":"Name","value":"isMandatory"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<WorkplaceBenefitsQuery, WorkplaceBenefitsQueryVariables>;
export const MyBenefitEnrollmentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyBenefitEnrollments"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"50"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myBenefitEnrollments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"benefitPlanId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"enrolledOn"}},{"kind":"Field","name":{"kind":"Name","value":"effectiveFrom"}},{"kind":"Field","name":{"kind":"Name","value":"effectiveTo"}},{"kind":"Field","name":{"kind":"Name","value":"employeeContributionAmount"}},{"kind":"Field","name":{"kind":"Name","value":"employerContributionAmount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<MyBenefitEnrollmentsQuery, MyBenefitEnrollmentsQueryVariables>;
export const EnrollInBenefitPlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"EnrollInBenefitPlan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"benefitPlanId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"enrollInBenefitPlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"benefitPlanId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"benefitPlanId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"benefitPlanId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"effectiveFrom"}},{"kind":"Field","name":{"kind":"Name","value":"enrolledOn"}}]}}]}}]} as unknown as DocumentNode<EnrollInBenefitPlanMutation, EnrollInBenefitPlanMutationVariables>;
export const ExpenseBoardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExpenseBoard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"expenseCategories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"maxAmountPerClaim"}}]}},{"kind":"Field","name":{"kind":"Name","value":"expenses"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"expenseCategoryId"}},{"kind":"Field","name":{"kind":"Name","value":"travelRequestId"}},{"kind":"Field","name":{"kind":"Name","value":"workflowInstanceId"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"expenseDate"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"pendingApprovalStage"}},{"kind":"Field","name":{"kind":"Name","value":"viewerMayApprove"}},{"kind":"Field","name":{"kind":"Name","value":"submittedAt"}},{"kind":"Field","name":{"kind":"Name","value":"approvedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"paymentStatus"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"paymentReference"}},{"kind":"Field","name":{"kind":"Name","value":"receiptFileStorageId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"travelRequests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"originLocation"}},{"kind":"Field","name":{"kind":"Name","value":"destinationLocation"}},{"kind":"Field","name":{"kind":"Name","value":"fromDate"}},{"kind":"Field","name":{"kind":"Name","value":"toDate"}},{"kind":"Field","name":{"kind":"Name","value":"purpose"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"pendingApprovalStage"}},{"kind":"Field","name":{"kind":"Name","value":"viewerMayApprove"}},{"kind":"Field","name":{"kind":"Name","value":"rejectionReason"}},{"kind":"Field","name":{"kind":"Name","value":"approvedBy"}},{"kind":"Field","name":{"kind":"Name","value":"rejectedBy"}},{"kind":"Field","name":{"kind":"Name","value":"workflowInstanceId"}},{"kind":"Field","name":{"kind":"Name","value":"submittedAt"}}]}}]}}]} as unknown as DocumentNode<ExpenseBoardQuery, ExpenseBoardQueryVariables>;
export const LeaveBoardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LeaveBoard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"balanceYear"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fromDate"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"NaiveDate"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"toDate"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"NaiveDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"viewerEmployeeId"}},{"kind":"Field","name":{"kind":"Name","value":"upcomingHolidays"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"calendarId"}},{"kind":"Field","name":{"kind":"Name","value":"calendarName"}},{"kind":"Field","name":{"kind":"Name","value":"holidayDate"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"holidayType"}}]}},{"kind":"Field","name":{"kind":"Name","value":"leavePolicies"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"50"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"leaveTypeId"}},{"kind":"Field","name":{"kind":"Name","value":"applicableTo"}},{"kind":"Field","name":{"kind":"Name","value":"annualEntitlement"}},{"kind":"Field","name":{"kind":"Name","value":"accrualFrequency"}},{"kind":"Field","name":{"kind":"Name","value":"accrualDays"}},{"kind":"Field","name":{"kind":"Name","value":"maxConsecutiveDays"}},{"kind":"Field","name":{"kind":"Name","value":"minNoticeDays"}}]}},{"kind":"Field","name":{"kind":"Name","value":"leaveTypes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"isPaid"}},{"kind":"Field","name":{"kind":"Name","value":"carryForward"}},{"kind":"Field","name":{"kind":"Name","value":"requiresDocument"}},{"kind":"Field","name":{"kind":"Name","value":"halfDayAllowed"}},{"kind":"Field","name":{"kind":"Name","value":"sandwichRule"}}]}},{"kind":"Field","name":{"kind":"Name","value":"leaveRequests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"fromDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fromDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"toDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"toDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"leaveTypeId"}},{"kind":"Field","name":{"kind":"Name","value":"fromDate"}},{"kind":"Field","name":{"kind":"Name","value":"toDate"}},{"kind":"Field","name":{"kind":"Name","value":"daysRequested"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"rejectionReason"}},{"kind":"Field","name":{"kind":"Name","value":"isHalfDay"}},{"kind":"Field","name":{"kind":"Name","value":"halfDaySession"}},{"kind":"Field","name":{"kind":"Name","value":"appliedAt"}},{"kind":"Field","name":{"kind":"Name","value":"workflowInstanceId"}},{"kind":"Field","name":{"kind":"Name","value":"supportingDocumentReference"}}]}},{"kind":"Field","name":{"kind":"Name","value":"leaveBalances"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"year"},"value":{"kind":"Variable","name":{"kind":"Name","value":"balanceYear"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"leaveTypeId"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"entitledDays"}},{"kind":"Field","name":{"kind":"Name","value":"usedDays"}},{"kind":"Field","name":{"kind":"Name","value":"pendingDays"}},{"kind":"Field","name":{"kind":"Name","value":"balanceDays"}},{"kind":"Field","name":{"kind":"Name","value":"carriedForwardDays"}}]}}]}}]} as unknown as DocumentNode<LeaveBoardQuery, LeaveBoardQueryVariables>;
export const AllCompanyHolidaysDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AllCompanyHolidays"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fromDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NaiveDate"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"400"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upcomingHolidays"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"fromDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fromDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"holidayDate"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"calendarName"}},{"kind":"Field","name":{"kind":"Name","value":"holidayType"}}]}}]}}]} as unknown as DocumentNode<AllCompanyHolidaysQuery, AllCompanyHolidaysQueryVariables>;
export const HrLeaveCalendarDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"HrLeaveCalendar"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reqLim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"400"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgLim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"500"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"typeLim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"80"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"holidayFrom"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NaiveDate"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"holidayLimit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"400"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fromDate"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"NaiveDate"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"toDate"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"NaiveDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"leaveRequests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reqLim"}}},{"kind":"Argument","name":{"kind":"Name","value":"fromDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fromDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"toDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"toDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"leaveTypeId"}},{"kind":"Field","name":{"kind":"Name","value":"fromDate"}},{"kind":"Field","name":{"kind":"Name","value":"toDate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isHalfDay"}},{"kind":"Field","name":{"kind":"Name","value":"halfDaySession"}}]}},{"kind":"Field","name":{"kind":"Name","value":"orgChart"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgLim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"leaveTypes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"typeLim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"upcomingHolidays"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"fromDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"holidayFrom"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"holidayLimit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"holidayDate"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"calendarName"}}]}}]}}]} as unknown as DocumentNode<HrLeaveCalendarQuery, HrLeaveCalendarQueryVariables>;
export const LeaveWorkflowTrailQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LeaveWorkflowTrailQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"leaveRequestId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"leaveRequestWorkflowTrail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"leaveRequestId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"leaveRequestId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workflowStepName"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"remarks"}},{"kind":"Field","name":{"kind":"Name","value":"actedAt"}},{"kind":"Field","name":{"kind":"Name","value":"performedByUserId"}}]}}]}}]} as unknown as DocumentNode<LeaveWorkflowTrailQueryQuery, LeaveWorkflowTrailQueryQueryVariables>;
export const AdminLeaveConsoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminLeaveConsole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"80"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"policyLimit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"150"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"calendarYear"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employees"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"leaveTypes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"tenantId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"isPaid"}},{"kind":"Field","name":{"kind":"Name","value":"carryForward"}},{"kind":"Field","name":{"kind":"Name","value":"maxCarryForwardDays"}},{"kind":"Field","name":{"kind":"Name","value":"sandwichRule"}},{"kind":"Field","name":{"kind":"Name","value":"halfDayAllowed"}},{"kind":"Field","name":{"kind":"Name","value":"requiresDocument"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"leavePolicies"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"policyLimit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"tenantId"}},{"kind":"Field","name":{"kind":"Name","value":"leaveTypeId"}},{"kind":"Field","name":{"kind":"Name","value":"applicableTo"}},{"kind":"Field","name":{"kind":"Name","value":"annualEntitlement"}},{"kind":"Field","name":{"kind":"Name","value":"accrualFrequency"}},{"kind":"Field","name":{"kind":"Name","value":"accrualDays"}},{"kind":"Field","name":{"kind":"Name","value":"maxConsecutiveDays"}},{"kind":"Field","name":{"kind":"Name","value":"minNoticeDays"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"holidayCalendars"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"year"},"value":{"kind":"Variable","name":{"kind":"Name","value":"calendarYear"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"24"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"tenantId"}},{"kind":"Field","name":{"kind":"Name","value":"locationId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<AdminLeaveConsoleQuery, AdminLeaveConsoleQueryVariables>;
export const HolidaysInCalendarDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"HolidaysInCalendar"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"calendarId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"200"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"holidaysInCalendar"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"calendarId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"calendarId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"calendarId"}},{"kind":"Field","name":{"kind":"Name","value":"holidayDate"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"holidayType"}}]}}]}}]} as unknown as DocumentNode<HolidaysInCalendarQuery, HolidaysInCalendarQueryVariables>;
export const AttendanceBoardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AttendanceBoard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"400"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fromDate"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"NaiveDate"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"toDate"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"NaiveDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shifts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"workHours"}},{"kind":"Field","name":{"kind":"Name","value":"isNightShift"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attendance"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"fromDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fromDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"toDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"toDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"workDate"}},{"kind":"Field","name":{"kind":"Name","value":"checkInTime"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutTime"}},{"kind":"Field","name":{"kind":"Name","value":"checkInLat"}},{"kind":"Field","name":{"kind":"Name","value":"checkInLng"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutLat"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutLng"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"lateMinutes"}}]}}]}}]} as unknown as DocumentNode<AttendanceBoardQuery, AttendanceBoardQueryVariables>;
export const PunchDaySummaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PunchDaySummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"punchDaySummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workDate"}},{"kind":"Field","name":{"kind":"Name","value":"totalWorkedMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"openSegment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"checkInTime"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutTime"}},{"kind":"Field","name":{"kind":"Name","value":"checkInLat"}},{"kind":"Field","name":{"kind":"Name","value":"checkInLng"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutLat"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutLng"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"Field","name":{"kind":"Name","value":"segments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"checkInTime"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutTime"}},{"kind":"Field","name":{"kind":"Name","value":"checkInLat"}},{"kind":"Field","name":{"kind":"Name","value":"checkInLng"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutLat"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutLng"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<PunchDaySummaryQuery, PunchDaySummaryQueryVariables>;
export const OnLeaveTodayDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OnLeaveToday"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"50"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgLim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"500"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"typeLim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"50"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"today"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"NaiveDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"leaveRequests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"fromDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"today"}}},{"kind":"Argument","name":{"kind":"Name","value":"toDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"today"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"leaveTypeId"}},{"kind":"Field","name":{"kind":"Name","value":"fromDate"}},{"kind":"Field","name":{"kind":"Name","value":"toDate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isHalfDay"}},{"kind":"Field","name":{"kind":"Name","value":"halfDaySession"}}]}},{"kind":"Field","name":{"kind":"Name","value":"leaveTypes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"typeLim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"orgChart"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgLim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}}]}}]}}]} as unknown as DocumentNode<OnLeaveTodayQuery, OnLeaveTodayQueryVariables>;
export const NotificationBoardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"NotificationBoard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unreadNotificationCount"}},{"kind":"Field","name":{"kind":"Name","value":"announcements"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"targetAudience"}},{"kind":"Field","name":{"kind":"Name","value":"targetDepartmentId"}},{"kind":"Field","name":{"kind":"Name","value":"targetLocationId"}},{"kind":"Field","name":{"kind":"Name","value":"postSource"}},{"kind":"Field","name":{"kind":"Name","value":"publishAt"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"imageAttachment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fileName"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"fileSizeBytes"}},{"kind":"Field","name":{"kind":"Name","value":"contentBase64"}}]}},{"kind":"Field","name":{"kind":"Name","value":"documentAttachment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fileName"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"fileSizeBytes"}},{"kind":"Field","name":{"kind":"Name","value":"contentBase64"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"notifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"actionUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<NotificationBoardQuery, NotificationBoardQueryVariables>;
export const MyNotificationPreferencesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyNotificationPreferences"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myNotificationPreferences"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"inAppEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"announcementsEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"mutedTopics"}}]}}]}}]} as unknown as DocumentNode<MyNotificationPreferencesQuery, MyNotificationPreferencesQueryVariables>;
export const UpdateNotificationPreferencesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateNotificationPreferences"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateNotificationPreferencesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateNotificationPreferences"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"inAppEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"announcementsEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"mutedTopics"}}]}}]}}]} as unknown as DocumentNode<UpdateNotificationPreferencesMutation, UpdateNotificationPreferencesMutationVariables>;
export const AdminNotificationsConsoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminNotificationsConsole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"annLim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"100"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"notLim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"150"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"empLim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"200"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"deptLim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"50"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminAnnouncements"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"annLim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"targetAudience"}},{"kind":"Field","name":{"kind":"Name","value":"targetDepartmentId"}},{"kind":"Field","name":{"kind":"Name","value":"targetLocationId"}},{"kind":"Field","name":{"kind":"Name","value":"postSource"}},{"kind":"Field","name":{"kind":"Name","value":"publishAt"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"adminNotifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"notLim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"actionUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"employees"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"empLim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"linkedUserEmail"}},{"kind":"Field","name":{"kind":"Name","value":"linkedUserUsername"}}]}},{"kind":"Field","name":{"kind":"Name","value":"departments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"deptLim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<AdminNotificationsConsoleQuery, AdminNotificationsConsoleQueryVariables>;
export const UpdateAnnouncementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateAnnouncement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateAnnouncementInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateAnnouncement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"postSource"}}]}}]}}]} as unknown as DocumentNode<UpdateAnnouncementMutation, UpdateAnnouncementMutationVariables>;
export const DeleteAnnouncementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteAnnouncement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteAnnouncement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteAnnouncementMutation, DeleteAnnouncementMutationVariables>;
export const CreateDirectNotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateDirectNotifications"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateDirectNotificationsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createDirectNotifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<CreateDirectNotificationsMutation, CreateDirectNotificationsMutationVariables>;
export const UpdateNotificationAdminDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateNotificationAdmin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateNotificationAdminInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateNotificationAdmin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<UpdateNotificationAdminMutation, UpdateNotificationAdminMutationVariables>;
export const DeleteNotificationAdminDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteNotificationAdmin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteNotificationAdmin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteNotificationAdminMutation, DeleteNotificationAdminMutationVariables>;
export const CreateAnnouncementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateAnnouncement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateAnnouncementInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createAnnouncement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"postSource"}}]}}]}}]} as unknown as DocumentNode<CreateAnnouncementMutation, CreateAnnouncementMutationVariables>;
export const ClientOpsNotificationPreviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ClientOpsNotificationPreview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unreadNotificationCount"}},{"kind":"Field","name":{"kind":"Name","value":"notifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}}]}}]}}]} as unknown as DocumentNode<ClientOpsNotificationPreviewQuery, ClientOpsNotificationPreviewQueryVariables>;
export const ClientOpsLeaveTypeNamesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ClientOpsLeaveTypeNames"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"50"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"leaveTypes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]} as unknown as DocumentNode<ClientOpsLeaveTypeNamesQuery, ClientOpsLeaveTypeNamesQueryVariables>;
export const PayrollBoardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PayrollBoard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salaryComponents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"componentType"}},{"kind":"Field","name":{"kind":"Name","value":"isTaxable"}},{"kind":"Field","name":{"kind":"Name","value":"isFixed"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payrollCycles"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paymentDate"}}]}}]}}]} as unknown as DocumentNode<PayrollBoardQuery, PayrollBoardQueryVariables>;
export const PayrollArrearsListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PayrollArrearsList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payrollArrears"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<PayrollArrearsListQuery, PayrollArrearsListQueryVariables>;
export const PayrollShellDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PayrollShell"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payrollCycles"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paymentDate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxConfigurations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fiscalYear"}},{"kind":"Field","name":{"kind":"Name","value":"regime"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxSlabs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"taxConfigVersionId"}},{"kind":"Field","name":{"kind":"Name","value":"incomeFrom"}},{"kind":"Field","name":{"kind":"Name","value":"incomeTo"}},{"kind":"Field","name":{"kind":"Name","value":"taxRate"}}]}}]}}]} as unknown as DocumentNode<PayrollShellQuery, PayrollShellQueryVariables>;
export const PayrollSalaryComponentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PayrollSalaryComponents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salaryComponents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"componentType"}},{"kind":"Field","name":{"kind":"Name","value":"isTaxable"}},{"kind":"Field","name":{"kind":"Name","value":"isFixed"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<PayrollSalaryComponentsQuery, PayrollSalaryComponentsQueryVariables>;
export const ClientOpsPayslipsForPayrollHubDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ClientOpsPayslipsForPayrollHub"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"24"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payslips"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"payrollCycleId"}},{"kind":"Field","name":{"kind":"Name","value":"grossSalary"}},{"kind":"Field","name":{"kind":"Name","value":"totalDeductions"}},{"kind":"Field","name":{"kind":"Name","value":"netSalary"}},{"kind":"Field","name":{"kind":"Name","value":"pfEmployee"}},{"kind":"Field","name":{"kind":"Name","value":"pfEmployer"}},{"kind":"Field","name":{"kind":"Name","value":"esiEmployee"}},{"kind":"Field","name":{"kind":"Name","value":"esiEmployer"}},{"kind":"Field","name":{"kind":"Name","value":"tdsAmount"}},{"kind":"Field","name":{"kind":"Name","value":"professionalTax"}},{"kind":"Field","name":{"kind":"Name","value":"uanNumber"}},{"kind":"Field","name":{"kind":"Name","value":"esicNumber"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"generatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"salaryComponentId"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"componentType"}}]}}]}}]}}]} as unknown as DocumentNode<ClientOpsPayslipsForPayrollHubQuery, ClientOpsPayslipsForPayrollHubQueryVariables>;
export const ClientOpsPayrollTaxBoardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ClientOpsPayrollTaxBoard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"taxConfigurations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fiscalYear"}},{"kind":"Field","name":{"kind":"Name","value":"regime"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxSlabs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"taxConfigVersionId"}},{"kind":"Field","name":{"kind":"Name","value":"incomeFrom"}},{"kind":"Field","name":{"kind":"Name","value":"incomeTo"}},{"kind":"Field","name":{"kind":"Name","value":"taxRate"}},{"kind":"Field","name":{"kind":"Name","value":"surchargeRate"}},{"kind":"Field","name":{"kind":"Name","value":"cessRate"}}]}}]}}]} as unknown as DocumentNode<ClientOpsPayrollTaxBoardQuery, ClientOpsPayrollTaxBoardQueryVariables>;
export const ClientOpsAdminEmployeesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ClientOpsAdminEmployees"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employees"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"employmentType"}},{"kind":"Field","name":{"kind":"Name","value":"dateOfJoining"}},{"kind":"Field","name":{"kind":"Name","value":"departmentId"}},{"kind":"Field","name":{"kind":"Name","value":"designationId"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerId"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"departmentName"}},{"kind":"Field","name":{"kind":"Name","value":"designationTitle"}},{"kind":"Field","name":{"kind":"Name","value":"linkedUserEmail"}},{"kind":"Field","name":{"kind":"Name","value":"linkedUserUsername"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerName"}}]}}]}}]} as unknown as DocumentNode<ClientOpsAdminEmployeesQuery, ClientOpsAdminEmployeesQueryVariables>;
export const ClientOpsAdminOrgLabelsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ClientOpsAdminOrgLabels"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dlim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"100"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"glim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"departments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dlim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"designations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"glim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}}]} as unknown as DocumentNode<ClientOpsAdminOrgLabelsQuery, ClientOpsAdminOrgLabelsQueryVariables>;
export const ClientOpsOrgListsForEmployeeModalDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ClientOpsOrgListsForEmployeeModal"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dlim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"100"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"glim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"100"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"elim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"100"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"rlim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"80"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"departments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dlim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"designations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"glim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"employees"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"elim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tenantDirectoryRoles"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"rlim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isSystemRole"}}]}}]}}]} as unknown as DocumentNode<ClientOpsOrgListsForEmployeeModalQuery, ClientOpsOrgListsForEmployeeModalQueryVariables>;
export const ClientOpsAdminAttendancePolicyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ClientOpsAdminAttendancePolicy"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"50"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attendancePunchPolicy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"tenantId"}},{"kind":"Field","name":{"kind":"Name","value":"isEnforced"}},{"kind":"Field","name":{"kind":"Name","value":"siteLatitude"}},{"kind":"Field","name":{"kind":"Name","value":"siteLongitude"}},{"kind":"Field","name":{"kind":"Name","value":"maxDistanceMeters"}},{"kind":"Field","name":{"kind":"Name","value":"ipAllowlist"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shifts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"workHours"}},{"kind":"Field","name":{"kind":"Name","value":"isNightShift"}}]}}]}}]} as unknown as DocumentNode<ClientOpsAdminAttendancePolicyQuery, ClientOpsAdminAttendancePolicyQueryVariables>;
export const ClientOpsUpsertAttendancePunchPolicyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ClientOpsUpsertAttendancePunchPolicy"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertAttendancePunchPolicyInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertAttendancePunchPolicy"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isEnforced"}},{"kind":"Field","name":{"kind":"Name","value":"siteLatitude"}},{"kind":"Field","name":{"kind":"Name","value":"siteLongitude"}},{"kind":"Field","name":{"kind":"Name","value":"maxDistanceMeters"}},{"kind":"Field","name":{"kind":"Name","value":"ipAllowlist"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ClientOpsUpsertAttendancePunchPolicyMutation, ClientOpsUpsertAttendancePunchPolicyMutationVariables>;
export const ClientOpsEmployeesDirectoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ClientOpsEmployeesDirectory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"100"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employeeDirectoryPage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rows"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"employmentType"}},{"kind":"Field","name":{"kind":"Name","value":"dateOfJoining"}},{"kind":"Field","name":{"kind":"Name","value":"departmentName"}},{"kind":"Field","name":{"kind":"Name","value":"designationTitle"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerId"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nextCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasMore"}}]}}]}}]} as unknown as DocumentNode<ClientOpsEmployeesDirectoryQuery, ClientOpsEmployeesDirectoryQueryVariables>;
export const EmployeeProfileAccessDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EmployeeProfileAccess"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employeeProfileAccess"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"employeeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isSelf"}},{"kind":"Field","name":{"kind":"Name","value":"canViewPrivateProfile"}},{"kind":"Field","name":{"kind":"Name","value":"canEditPersonalProfile"}},{"kind":"Field","name":{"kind":"Name","value":"canManageOrganizationFields"}},{"kind":"Field","name":{"kind":"Name","value":"canReviewProfileChanges"}},{"kind":"Field","name":{"kind":"Name","value":"directoryEntry"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"employmentType"}},{"kind":"Field","name":{"kind":"Name","value":"dateOfJoining"}},{"kind":"Field","name":{"kind":"Name","value":"departmentName"}},{"kind":"Field","name":{"kind":"Name","value":"designationTitle"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerId"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerName"}}]}}]}}]}}]} as unknown as DocumentNode<EmployeeProfileAccessQuery, EmployeeProfileAccessQueryVariables>;
export const EmployeeDocumentAttachmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EmployeeDocumentAttachment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"employeeDocumentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employeeDocumentAttachment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"employeeDocumentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeDocumentId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fileName"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"fileSizeBytes"}},{"kind":"Field","name":{"kind":"Name","value":"contentBase64"}}]}}]}}]} as unknown as DocumentNode<EmployeeDocumentAttachmentQuery, EmployeeDocumentAttachmentQueryVariables>;
export const EmployeeProfileReviewQueueDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EmployeeProfileReviewQueue"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}},"defaultValue":{"kind":"StringValue","value":"PENDING","block":false}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"50"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employeeProfileReviewQueue"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}},{"kind":"Field","name":{"kind":"Name","value":"employeeName"}},{"kind":"Field","name":{"kind":"Name","value":"hasSupportingDocument"}},{"kind":"Field","name":{"kind":"Name","value":"request"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"requestType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"requestedSummary"}},{"kind":"Field","name":{"kind":"Name","value":"supportingDocumentId"}},{"kind":"Field","name":{"kind":"Name","value":"reviewedAt"}},{"kind":"Field","name":{"kind":"Name","value":"rejectionReason"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]}}]} as unknown as DocumentNode<EmployeeProfileReviewQueueQuery, EmployeeProfileReviewQueueQueryVariables>;
export const EmployeeProfileChangeReviewDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EmployeeProfileChangeReviewDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"requestId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employeeProfileChangeReviewDetail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"requestId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"requestId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}},{"kind":"Field","name":{"kind":"Name","value":"employeeName"}},{"kind":"Field","name":{"kind":"Name","value":"currentValues"}},{"kind":"Field","name":{"kind":"Name","value":"requestedValues"}},{"kind":"Field","name":{"kind":"Name","value":"request"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"requestType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"requestedSummary"}},{"kind":"Field","name":{"kind":"Name","value":"supportingDocumentId"}},{"kind":"Field","name":{"kind":"Name","value":"reviewedAt"}},{"kind":"Field","name":{"kind":"Name","value":"rejectionReason"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]}}]} as unknown as DocumentNode<EmployeeProfileChangeReviewDetailQuery, EmployeeProfileChangeReviewDetailQueryVariables>;
export const EmployeeEvidenceReviewQueueDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EmployeeEvidenceReviewQueue"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employeeEvidenceReviewQueue"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}},{"kind":"Field","name":{"kind":"Name","value":"employeeName"}},{"kind":"Field","name":{"kind":"Name","value":"evidenceType"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"evidenceDocumentIds"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<EmployeeEvidenceReviewQueueQuery, EmployeeEvidenceReviewQueueQueryVariables>;
export const EmployeePrivateProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EmployeePrivateProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employee"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"employmentType"}},{"kind":"Field","name":{"kind":"Name","value":"dateOfJoining"}},{"kind":"Field","name":{"kind":"Name","value":"departmentId"}},{"kind":"Field","name":{"kind":"Name","value":"designationId"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerId"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"departmentName"}},{"kind":"Field","name":{"kind":"Name","value":"designationTitle"}},{"kind":"Field","name":{"kind":"Name","value":"linkedUserEmail"}},{"kind":"Field","name":{"kind":"Name","value":"linkedUserUsername"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerName"}},{"kind":"Field","name":{"kind":"Name","value":"personalPhone"}},{"kind":"Field","name":{"kind":"Name","value":"currentAddress"}},{"kind":"Field","name":{"kind":"Name","value":"permanentAddress"}},{"kind":"Field","name":{"kind":"Name","value":"dateOfBirth"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"nationality"}},{"kind":"Field","name":{"kind":"Name","value":"bloodGroup"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactName"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactRelation"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"employeeDocuments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"employeeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"documentTypeId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"uploadedAt"}},{"kind":"Field","name":{"kind":"Name","value":"originalFileName"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"uploadedByUserId"}},{"kind":"Field","name":{"kind":"Name","value":"documentTypeName"}},{"kind":"Field","name":{"kind":"Name","value":"documentTypeCategory"}}]}},{"kind":"Field","name":{"kind":"Name","value":"documentTypes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"systemKey"}}]}},{"kind":"Field","name":{"kind":"Name","value":"employmentHistoryRecords"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"employeeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"48"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"monthlySalary"}},{"kind":"Field","name":{"kind":"Name","value":"effectiveFrom"}},{"kind":"Field","name":{"kind":"Name","value":"effectiveTo"}},{"kind":"Field","name":{"kind":"Name","value":"changeReason"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"employeePrimaryBank"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"employeeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"bankName"}},{"kind":"Field","name":{"kind":"Name","value":"accountNumberMasked"}},{"kind":"Field","name":{"kind":"Name","value":"ifscCode"}},{"kind":"Field","name":{"kind":"Name","value":"accountType"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}}]}},{"kind":"Field","name":{"kind":"Name","value":"employeeIdentityProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"employeeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"maskedPan"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}}]}},{"kind":"Field","name":{"kind":"Name","value":"aadhaar"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"maskedAadhaar"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"employeeProfileChangeRequests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"employeeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"requestType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"requestedSummary"}},{"kind":"Field","name":{"kind":"Name","value":"supportingDocumentId"}},{"kind":"Field","name":{"kind":"Name","value":"reviewedAt"}},{"kind":"Field","name":{"kind":"Name","value":"rejectionReason"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"employeeEducationRecords"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"employeeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"educationLevel"}},{"kind":"Field","name":{"kind":"Name","value":"qualification"}},{"kind":"Field","name":{"kind":"Name","value":"fieldOfStudy"}},{"kind":"Field","name":{"kind":"Name","value":"institution"}},{"kind":"Field","name":{"kind":"Name","value":"boardUniversity"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"completionYear"}},{"kind":"Field","name":{"kind":"Name","value":"gradeScore"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"verificationStatus"}},{"kind":"Field","name":{"kind":"Name","value":"evidenceDocumentIds"}},{"kind":"Field","name":{"kind":"Name","value":"rejectionReason"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"employeeWorkExperienceRecords"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"employeeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"company"}},{"kind":"Field","name":{"kind":"Name","value":"roleTitle"}},{"kind":"Field","name":{"kind":"Name","value":"employmentType"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"isCurrent"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"verificationStatus"}},{"kind":"Field","name":{"kind":"Name","value":"evidenceDocumentIds"}},{"kind":"Field","name":{"kind":"Name","value":"rejectionReason"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<EmployeePrivateProfileQuery, EmployeePrivateProfileQueryVariables>;
export const ClientOpsEmployeeDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ClientOpsEmployeeDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employee"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"employmentType"}},{"kind":"Field","name":{"kind":"Name","value":"dateOfJoining"}},{"kind":"Field","name":{"kind":"Name","value":"dateOfBirth"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"nationality"}},{"kind":"Field","name":{"kind":"Name","value":"bloodGroup"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactName"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactRelation"}},{"kind":"Field","name":{"kind":"Name","value":"departmentId"}},{"kind":"Field","name":{"kind":"Name","value":"designationId"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerId"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"departmentName"}},{"kind":"Field","name":{"kind":"Name","value":"designationTitle"}},{"kind":"Field","name":{"kind":"Name","value":"linkedUserEmail"}},{"kind":"Field","name":{"kind":"Name","value":"linkedUserUsername"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ClientOpsEmployeeDetailQuery, ClientOpsEmployeeDetailQueryVariables>;
export const EmployeeProfileBundleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EmployeeProfileBundle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employee"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"employmentType"}},{"kind":"Field","name":{"kind":"Name","value":"dateOfJoining"}},{"kind":"Field","name":{"kind":"Name","value":"dateOfBirth"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"nationality"}},{"kind":"Field","name":{"kind":"Name","value":"bloodGroup"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactName"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactRelation"}},{"kind":"Field","name":{"kind":"Name","value":"departmentId"}},{"kind":"Field","name":{"kind":"Name","value":"designationId"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerId"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"departmentName"}},{"kind":"Field","name":{"kind":"Name","value":"designationTitle"}},{"kind":"Field","name":{"kind":"Name","value":"linkedUserEmail"}},{"kind":"Field","name":{"kind":"Name","value":"linkedUserUsername"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"employeeDocuments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"employeeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"50"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"documentTypeId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"uploadedAt"}},{"kind":"Field","name":{"kind":"Name","value":"originalFileName"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"uploadedByUserId"}},{"kind":"Field","name":{"kind":"Name","value":"documentTypeName"}},{"kind":"Field","name":{"kind":"Name","value":"documentTypeCategory"}}]}},{"kind":"Field","name":{"kind":"Name","value":"documentTypes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"}}]}},{"kind":"Field","name":{"kind":"Name","value":"employmentHistoryRecords"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"employeeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"48"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"monthlySalary"}},{"kind":"Field","name":{"kind":"Name","value":"effectiveFrom"}},{"kind":"Field","name":{"kind":"Name","value":"effectiveTo"}},{"kind":"Field","name":{"kind":"Name","value":"changeReason"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"employeePrimaryBank"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"employeeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"bankName"}},{"kind":"Field","name":{"kind":"Name","value":"accountNumberMasked"}},{"kind":"Field","name":{"kind":"Name","value":"ifscCode"}},{"kind":"Field","name":{"kind":"Name","value":"accountType"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}}]}},{"kind":"Field","name":{"kind":"Name","value":"employeeIdentityProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"employeeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"maskedPan"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}}]}},{"kind":"Field","name":{"kind":"Name","value":"aadhaar"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"maskedAadhaar"}},{"kind":"Field","name":{"kind":"Name","value":"isVerified"}}]}}]}}]}}]} as unknown as DocumentNode<EmployeeProfileBundleQuery, EmployeeProfileBundleQueryVariables>;
export const ClientOpsAdminSettingsEmployeesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ClientOpsAdminSettingsEmployees"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employees"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"employmentType"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"departmentId"}},{"kind":"Field","name":{"kind":"Name","value":"designationId"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerId"}},{"kind":"Field","name":{"kind":"Name","value":"departmentName"}},{"kind":"Field","name":{"kind":"Name","value":"designationTitle"}},{"kind":"Field","name":{"kind":"Name","value":"linkedUserEmail"}},{"kind":"Field","name":{"kind":"Name","value":"linkedUserUsername"}},{"kind":"Field","name":{"kind":"Name","value":"reportingManagerName"}}]}}]}}]} as unknown as DocumentNode<ClientOpsAdminSettingsEmployeesQuery, ClientOpsAdminSettingsEmployeesQueryVariables>;
export const ClientOpsAdminReportsDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ClientOpsAdminReportsData"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fromDate"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"NaiveDate"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"toDate"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"NaiveDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employees"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attendance"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"100"}},{"kind":"Argument","name":{"kind":"Name","value":"fromDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fromDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"toDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"toDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"workDate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"checkInTime"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutTime"}}]}},{"kind":"Field","name":{"kind":"Name","value":"leaveRequests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"100"}},{"kind":"Argument","name":{"kind":"Name","value":"fromDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fromDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"toDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"toDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"fromDate"}},{"kind":"Field","name":{"kind":"Name","value":"toDate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payrollCycles"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paymentDate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"salaryComponents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"componentType"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isTaxable"}}]}}]}}]} as unknown as DocumentNode<ClientOpsAdminReportsDataQuery, ClientOpsAdminReportsDataQueryVariables>;
export const PayrollEmploymentHistoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PayrollEmploymentHistory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"48"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employmentHistoryRecords"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"employeeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"monthlySalary"}},{"kind":"Field","name":{"kind":"Name","value":"effectiveFrom"}},{"kind":"Field","name":{"kind":"Name","value":"effectiveTo"}},{"kind":"Field","name":{"kind":"Name","value":"changeReason"}},{"kind":"Field","name":{"kind":"Name","value":"changedBy"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<PayrollEmploymentHistoryQuery, PayrollEmploymentHistoryQueryVariables>;
export const PayrollSetEmployeeCompensationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PayrollSetEmployeeCompensation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetEmployeeCompensationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setEmployeeCompensation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"monthlySalary"}},{"kind":"Field","name":{"kind":"Name","value":"effectiveFrom"}},{"kind":"Field","name":{"kind":"Name","value":"changeReason"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<PayrollSetEmployeeCompensationMutation, PayrollSetEmployeeCompensationMutationVariables>;
export const RbacAdminBoardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RbacAdminBoard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uLim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"120"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"rLim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"80"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pLim"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"400"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenantDirectoryUsers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uLim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tenantDirectoryRoles"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"rLim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isSystemRole"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tenantCatalogPermissions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pLim"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"resource"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<RbacAdminBoardQuery, RbacAdminBoardQueryVariables>;
export const PermissionIdsForRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PermissionIdsForRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"permissionIdsForRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"roleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roleId"}}}]}]}}]} as unknown as DocumentNode<PermissionIdsForRoleQuery, PermissionIdsForRoleQueryVariables>;
export const RoleIdsForUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RoleIdsForUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"roleIdsForUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}]}]}}]} as unknown as DocumentNode<RoleIdsForUserQuery, RoleIdsForUserQueryVariables>;
export const PermissionScopesForRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PermissionScopesForRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"permissionScopesForRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"roleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roleId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"resource"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"scopeType"}}]}}]}}]} as unknown as DocumentNode<PermissionScopesForRoleQuery, PermissionScopesForRoleQueryVariables>;
export const SetRolePermissionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetRolePermissions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"permissionIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setRolePermissions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"roleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roleId"}}},{"kind":"Argument","name":{"kind":"Name","value":"permissionIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"permissionIds"}}}]}]}}]} as unknown as DocumentNode<SetRolePermissionsMutation, SetRolePermissionsMutationVariables>;
export const SetUserRolesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetUserRoles"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roleIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setUserRoles"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"roleIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roleIds"}}}]}]}}]} as unknown as DocumentNode<SetUserRolesMutation, SetUserRolesMutationVariables>;
export const SetRolePermissionScopesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetRolePermissionScopes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"scopes"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PermissionScopeAssignmentInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setRolePermissionScopes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"roleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roleId"}}},{"kind":"Argument","name":{"kind":"Name","value":"scopes"},"value":{"kind":"Variable","name":{"kind":"Name","value":"scopes"}}}]}]}}]} as unknown as DocumentNode<SetRolePermissionScopesMutation, SetRolePermissionScopesMutationVariables>;
export const GatewayPingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GatewayPing"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]} as unknown as DocumentNode<GatewayPingQuery, GatewayPingQueryVariables>;
export const ModuleProbeLeaveBoardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ModuleProbeLeaveBoard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"leaveTypes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"isPaid"}}]}},{"kind":"Field","name":{"kind":"Name","value":"leaveRequests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"fromDate"}},{"kind":"Field","name":{"kind":"Name","value":"toDate"}},{"kind":"Field","name":{"kind":"Name","value":"daysRequested"}}]}}]}}]} as unknown as DocumentNode<ModuleProbeLeaveBoardQuery, ModuleProbeLeaveBoardQueryVariables>;
export const ModuleProbeAttendanceBoardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ModuleProbeAttendanceBoard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shifts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attendance"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"workDate"}},{"kind":"Field","name":{"kind":"Name","value":"checkInTime"}},{"kind":"Field","name":{"kind":"Name","value":"checkOutTime"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<ModuleProbeAttendanceBoardQuery, ModuleProbeAttendanceBoardQueryVariables>;
export const ModuleProbePayrollBoardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ModuleProbePayrollBoard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salaryComponents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"componentType"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payrollCycles"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paymentDate"}}]}}]}}]} as unknown as DocumentNode<ModuleProbePayrollBoardQuery, ModuleProbePayrollBoardQueryVariables>;
export const ModuleProbeTaxBoardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ModuleProbeTaxBoard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"taxConfigurations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fiscalYear"}},{"kind":"Field","name":{"kind":"Name","value":"regime"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxSlabs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"taxConfigVersionId"}},{"kind":"Field","name":{"kind":"Name","value":"incomeFrom"}},{"kind":"Field","name":{"kind":"Name","value":"incomeTo"}},{"kind":"Field","name":{"kind":"Name","value":"taxRate"}}]}}]}}]} as unknown as DocumentNode<ModuleProbeTaxBoardQuery, ModuleProbeTaxBoardQueryVariables>;
export const ModuleProbeBenefitsBoardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ModuleProbeBenefitsBoard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"benefitTypes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"category"}}]}},{"kind":"Field","name":{"kind":"Name","value":"benefitPlans"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"benefitTypeId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeContribution"}},{"kind":"Field","name":{"kind":"Name","value":"employerContribution"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<ModuleProbeBenefitsBoardQuery, ModuleProbeBenefitsBoardQueryVariables>;
export const ModuleProbeExpenseBoardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ModuleProbeExpenseBoard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"expenseCategories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"expenses"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"expenseCategoryId"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"expenseDate"}}]}}]}}]} as unknown as DocumentNode<ModuleProbeExpenseBoardQuery, ModuleProbeExpenseBoardQueryVariables>;
export const ModuleProbeDocumentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ModuleProbeDocument"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentTypes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"isRequired"}}]}},{"kind":"Field","name":{"kind":"Name","value":"employeeDocuments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"documentTypeId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"uploadedAt"}}]}}]}}]} as unknown as DocumentNode<ModuleProbeDocumentQuery, ModuleProbeDocumentQueryVariables>;
export const ModuleProbePayslipDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ModuleProbePayslip"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"5"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payslips"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"netSalary"}},{"kind":"Field","name":{"kind":"Name","value":"grossSalary"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"componentType"}}]}}]}}]}}]} as unknown as DocumentNode<ModuleProbePayslipQuery, ModuleProbePayslipQueryVariables>;
export const ModuleProbeRecruitmentBoardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ModuleProbeRecruitmentBoard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobPostings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"employmentType"}},{"kind":"Field","name":{"kind":"Name","value":"vacancies"}}]}},{"kind":"Field","name":{"kind":"Name","value":"applications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"jobId"}},{"kind":"Field","name":{"kind":"Name","value":"candidateName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<ModuleProbeRecruitmentBoardQuery, ModuleProbeRecruitmentBoardQueryVariables>;
export const ModuleProbePerformanceBoardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ModuleProbePerformanceBoard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reviewCycles"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"goals"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"weightage"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<ModuleProbePerformanceBoardQuery, ModuleProbePerformanceBoardQueryVariables>;
export const ModuleProbeLmsBoardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ModuleProbeLmsBoard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"skills"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"}}]}},{"kind":"Field","name":{"kind":"Name","value":"courses"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"durationMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<ModuleProbeLmsBoardQuery, ModuleProbeLmsBoardQueryVariables>;
export const ModuleProbeSuccessionBoardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ModuleProbeSuccessionBoard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"competencies"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"}}]}},{"kind":"Field","name":{"kind":"Name","value":"talentPools"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<ModuleProbeSuccessionBoardQuery, ModuleProbeSuccessionBoardQueryVariables>;
export const ModuleProbeCompensationBoardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ModuleProbeCompensationBoard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salaryBands"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"designationId"}},{"kind":"Field","name":{"kind":"Name","value":"grade"}},{"kind":"Field","name":{"kind":"Name","value":"minSalary"}},{"kind":"Field","name":{"kind":"Name","value":"maxSalary"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compensationReviewCycles"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<ModuleProbeCompensationBoardQuery, ModuleProbeCompensationBoardQueryVariables>;
export const ModuleProbeAssetsBoardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ModuleProbeAssetsBoard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assetCategories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"assets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"assetCategoryId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"assetTag"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<ModuleProbeAssetsBoardQuery, ModuleProbeAssetsBoardQueryVariables>;
export const ModuleProbeGrievanceBoardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ModuleProbeGrievanceBoard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"grievanceCategories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"isPosh"}}]}},{"kind":"Field","name":{"kind":"Name","value":"grievanceCases"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"filedAt"}}]}}]}}]} as unknown as DocumentNode<ModuleProbeGrievanceBoardQuery, ModuleProbeGrievanceBoardQueryVariables>;
export const ModuleProbeWorkflowBoardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ModuleProbeWorkflowBoard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workflows"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"entityType"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"Field","name":{"kind":"Name","value":"workflowInstances"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"workflowId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"entityType"}}]}}]}}]} as unknown as DocumentNode<ModuleProbeWorkflowBoardQuery, ModuleProbeWorkflowBoardQueryVariables>;
export const ModuleProbeNotificationBoardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ModuleProbeNotificationBoard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"announcements"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"targetAudience"}},{"kind":"Field","name":{"kind":"Name","value":"publishAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"notifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<ModuleProbeNotificationBoardQuery, ModuleProbeNotificationBoardQueryVariables>;
export const ModuleProbeOpsOverviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ModuleProbeOpsOverview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenants"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"subdomain"}}]}},{"kind":"Field","name":{"kind":"Name","value":"modules"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"isCore"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tenantSubscriptions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"tenantId"}},{"kind":"Field","name":{"kind":"Name","value":"moduleId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"contractedSeats"}},{"kind":"Field","name":{"kind":"Name","value":"currentSeatUsage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"invoices"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"tenantId"}},{"kind":"Field","name":{"kind":"Name","value":"invoiceNumber"}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"operatorUsers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<ModuleProbeOpsOverviewQuery, ModuleProbeOpsOverviewQueryVariables>;
export const ModuleProbeAnalyticsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ModuleProbeAnalytics"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"5"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"webhookDeliveryLogs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"eventName"}}]}}]}}]} as unknown as DocumentNode<ModuleProbeAnalyticsQuery, ModuleProbeAnalyticsQueryVariables>;
export const LeaveHealthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LeaveHealth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"leaveTypes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<LeaveHealthQuery, LeaveHealthQueryVariables>;
export const AttendanceHealthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AttendanceHealth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shifts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<AttendanceHealthQuery, AttendanceHealthQueryVariables>;
export const PayrollHealthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PayrollHealth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salaryComponents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<PayrollHealthQuery, PayrollHealthQueryVariables>;
export const TaxHealthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TaxHealth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"taxConfigurations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fiscalYear"}},{"kind":"Field","name":{"kind":"Name","value":"regime"}}]}}]}}]} as unknown as DocumentNode<TaxHealthQuery, TaxHealthQueryVariables>;
export const BenefitsHealthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BenefitsHealth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"benefitTypes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<BenefitsHealthQuery, BenefitsHealthQueryVariables>;
export const ExpenseHealthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExpenseHealth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"expenseCategories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<ExpenseHealthQuery, ExpenseHealthQueryVariables>;
export const RecruitmentHealthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RecruitmentHealth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobPostings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}}]} as unknown as DocumentNode<RecruitmentHealthQuery, RecruitmentHealthQueryVariables>;
export const PerformanceHealthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PerformanceHealth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reviewCycles"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<PerformanceHealthQuery, PerformanceHealthQueryVariables>;
export const LmsHealthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LmsHealth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"skills"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<LmsHealthQuery, LmsHealthQueryVariables>;
export const SuccessionHealthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SuccessionHealth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"competencies"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<SuccessionHealthQuery, SuccessionHealthQueryVariables>;
export const CompensationHealthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CompensationHealth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salaryBands"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"grade"}}]}}]}}]} as unknown as DocumentNode<CompensationHealthQuery, CompensationHealthQueryVariables>;
export const AssetsHealthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AssetsHealth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assetCategories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<AssetsHealthQuery, AssetsHealthQueryVariables>;
export const GrievanceHealthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GrievanceHealth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"grievanceCategories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<GrievanceHealthQuery, GrievanceHealthQueryVariables>;
export const WorkflowHealthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkflowHealth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workflows"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<WorkflowHealthQuery, WorkflowHealthQueryVariables>;
export const NotificationHealthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"NotificationHealth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"announcements"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}}]} as unknown as DocumentNode<NotificationHealthQuery, NotificationHealthQueryVariables>;
export const AnalyticsHealthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AnalyticsHealth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"webhookDeliveryLogs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AnalyticsHealthQuery, AnalyticsHealthQueryVariables>;
export const TenantsHealthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TenantsHealth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenants"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<TenantsHealthQuery, TenantsHealthQueryVariables>;
export const BillingHealthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BillingHealth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"invoices"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"invoiceNumber"}}]}}]}}]} as unknown as DocumentNode<BillingHealthQuery, BillingHealthQueryVariables>;
export const OperatorHealthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OperatorHealth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"operatorUsers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]} as unknown as DocumentNode<OperatorHealthQuery, OperatorHealthQueryVariables>;
export const PayrollCompensationBoardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PayrollCompensationBoard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"employeeLimit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"300"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employees"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeLimit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"dateOfJoining"}}]}},{"kind":"Field","name":{"kind":"Name","value":"salaryComponents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"200"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"componentType"}},{"kind":"Field","name":{"kind":"Name","value":"isTaxable"}},{"kind":"Field","name":{"kind":"Name","value":"isFixed"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"Field","name":{"kind":"Name","value":"salaryStructures"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"components"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"salaryComponentId"}},{"kind":"Field","name":{"kind":"Name","value":"componentName"}},{"kind":"Field","name":{"kind":"Name","value":"componentCode"}},{"kind":"Field","name":{"kind":"Name","value":"componentType"}},{"kind":"Field","name":{"kind":"Name","value":"calculationBasis"}},{"kind":"Field","name":{"kind":"Name","value":"calculationValue"}},{"kind":"Field","name":{"kind":"Name","value":"displayOrder"}}]}}]}}]}}]} as unknown as DocumentNode<PayrollCompensationBoardQuery, PayrollCompensationBoardQueryVariables>;
export const UpsertSalaryComponentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertSalaryComponent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertSalaryComponentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertSalaryComponent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"componentType"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<UpsertSalaryComponentMutation, UpsertSalaryComponentMutationVariables>;
export const UpsertSalaryStructureDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertSalaryStructure"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertSalaryStructureInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertSalaryStructure"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"components"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"componentCode"}},{"kind":"Field","name":{"kind":"Name","value":"calculationBasis"}},{"kind":"Field","name":{"kind":"Name","value":"calculationValue"}}]}}]}}]}}]} as unknown as DocumentNode<UpsertSalaryStructureMutation, UpsertSalaryStructureMutationVariables>;
export const AssignEmployeeSalaryStructureDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AssignEmployeeSalaryStructure"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AssignEmployeeSalaryStructureInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assignEmployeeSalaryStructure"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"salaryStructureId"}},{"kind":"Field","name":{"kind":"Name","value":"ctc"}},{"kind":"Field","name":{"kind":"Name","value":"effectiveFrom"}}]}}]}}]} as unknown as DocumentNode<AssignEmployeeSalaryStructureMutation, AssignEmployeeSalaryStructureMutationVariables>;
export const EmployeeSalaryBreakupPreviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EmployeeSalaryBreakupPreview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"asOf"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"NaiveDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employeeSalaryBreakupPreview"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"employeeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"asOf"},"value":{"kind":"Variable","name":{"kind":"Name","value":"asOf"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"annualCtc"}},{"kind":"Field","name":{"kind":"Name","value":"monthlyGross"}},{"kind":"Field","name":{"kind":"Name","value":"monthlyDeductions"}},{"kind":"Field","name":{"kind":"Name","value":"monthlyNetBeforeStatutory"}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salaryComponentId"}},{"kind":"Field","name":{"kind":"Name","value":"componentName"}},{"kind":"Field","name":{"kind":"Name","value":"componentCode"}},{"kind":"Field","name":{"kind":"Name","value":"componentType"}},{"kind":"Field","name":{"kind":"Name","value":"calculationBasis"}},{"kind":"Field","name":{"kind":"Name","value":"calculationValue"}},{"kind":"Field","name":{"kind":"Name","value":"annualAmount"}},{"kind":"Field","name":{"kind":"Name","value":"monthlyAmount"}},{"kind":"Field","name":{"kind":"Name","value":"isOverride"}}]}}]}}]}}]} as unknown as DocumentNode<EmployeeSalaryBreakupPreviewQuery, EmployeeSalaryBreakupPreviewQueryVariables>;
export const AssetsBoardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AssetsBoard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"withInventory"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assetCategories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"100"}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"withInventory"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"assets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"withInventory"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"assetCategoryId"}},{"kind":"Field","name":{"kind":"Name","value":"serialNumber"}},{"kind":"Field","name":{"kind":"Name","value":"assetTag"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"purchaseDate"}},{"kind":"Field","name":{"kind":"Name","value":"purchaseValue"}}]}},{"kind":"Field","name":{"kind":"Name","value":"assetAssignments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"activeOnly"},"value":{"kind":"BooleanValue","value":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"assetId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"assetName"}},{"kind":"Field","name":{"kind":"Name","value":"assetTag"}},{"kind":"Field","name":{"kind":"Name","value":"serialNumber"}},{"kind":"Field","name":{"kind":"Name","value":"purchaseValue"}},{"kind":"Field","name":{"kind":"Name","value":"allocatedOn"}},{"kind":"Field","name":{"kind":"Name","value":"expectedReturnOn"}},{"kind":"Field","name":{"kind":"Name","value":"conditionAtAllocation"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<AssetsBoardQuery, AssetsBoardQueryVariables>;
export const AssignAssetToEmployeeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AssignAssetToEmployee"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AssignAssetInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assignAssetToEmployee"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"assetId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"assetName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<AssignAssetToEmployeeMutation, AssignAssetToEmployeeMutationVariables>;
export const ReturnEmployeeAssetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ReturnEmployeeAsset"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ReturnAssetInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"returnEmployeeAsset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"assetId"}},{"kind":"Field","name":{"kind":"Name","value":"employeeId"}},{"kind":"Field","name":{"kind":"Name","value":"assetName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<ReturnEmployeeAssetMutation, ReturnEmployeeAssetMutationVariables>;
export const AssetsEmployeeOptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AssetsEmployeeOptions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"200"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employees"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeCode"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<AssetsEmployeeOptionsQuery, AssetsEmployeeOptionsQueryVariables>;