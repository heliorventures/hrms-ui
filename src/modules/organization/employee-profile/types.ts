/** Domain types for the employee profile shell (API core + enrichable sections). */

import type { CanonicalEmployeeStatus } from '../../employeeStatus';

export interface TenantDocumentTypeOption {
  id: string;
  name: string;
  category?: string | null;
  systemKey?: string | null;
}

export type EmploymentStatusUi = CanonicalEmployeeStatus | 'UNKNOWN';

export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export type DocumentCategory =
  | 'PAN'
  | 'AADHAAR'
  | 'OFFER_LETTER'
  | 'APPRAISAL_LETTER'
  | 'PASSPORT'
  | 'OTHER';

export type DocumentApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type UploaderKind = 'EMPLOYEE' | 'HR';

export type GrowthEventType = 'JOINING' | 'APPRAISAL' | 'PROMOTION' | 'SALARY_CHANGE';

export type LifecycleEventType =
  | 'JOINING'
  | 'PROMOTION'
  | 'SALARY_CHANGE'
  | 'DEPARTMENT_CHANGE'
  | 'TERMINATION';

/** Fields currently returned by `ClientOpsEmployeeDetail` — single source for merging mock layers. */
export interface CoreEmployeeRecord {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  status: string;
  employmentType?: string | null;
  dateOfJoining: string;
  departmentId?: string | null;
  designationId?: string | null;
  userId?: string | null;
  reportingManagerId?: string | null;
  departmentName?: string | null;
  designationTitle?: string | null;
  linkedUserEmail?: string | null;
  linkedUserUsername?: string | null;
  reportingManagerName?: string | null;
  /** From `employee.bloodGroup` when loaded from API */
  bloodGroup?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalInfoFields {
  firstName: string;
  lastName: string;
  bloodGroup: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  permanentAddress: string;
  currentAddress: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
}

export interface BankingDetails {
  bankName: string;
  accountNumberMasked: string;
  accountNumberTail: string;
  ifscCode: string;
  accountType: string;
  verificationStatus: VerificationStatus;
}

export interface IdentityRecord {
  kind: 'PAN' | 'AADHAAR' | 'PASSPORT';
  maskedValue: string;
  verificationStatus: VerificationStatus;
  storageFileId?: string;
}

export interface EducationEntry {
  id: string;
  educationLevel: string;
  qualification: string;
  fieldOfStudy: string;
  institution: string;
  boardUniversity: string;
  startDate: string;
  completionYear: number;
  gradeScore: string;
  description: string;
  verificationStatus: VerificationStatus;
  evidenceDocumentIds: string[];
  rejectionReason?: string | null;
}

export interface WorkExperienceEntry {
  id: string;
  company: string;
  roleTitle: string;
  employmentType: string;
  location: string;
  startDate: string;
  endDate: string | null;
  description: string;
  isCurrent: boolean;
  verificationStatus: VerificationStatus;
  evidenceDocumentIds: string[];
  rejectionReason?: string | null;
}

export interface ProfileChangeRequest {
  id: string;
  requestType: string;
  status: string;
  requestedSummary: string;
  supportingDocumentId?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GrowthTimelineNode {
  id: string;
  type: GrowthEventType;
  date: string;
  title: string;
  salaryChangePercent?: number;
  notes?: string;
}

export interface SalaryHistoryEntry {
  id: string;
  effectiveDate: string;
  previousAnnual: number;
  newAnnual: number;
  changePercent: number;
  reason: string;
}

export interface DocumentRow {
  id: string;
  name: string;
  category: DocumentCategory;
  uploadedBy: UploaderKind;
  uploadedAt: string;
  status: DocumentApprovalStatus;
  mimeType: string;
  previewUrl?: string;
}

export interface RecentActivityItem {
  id: string;
  label: string;
  at: string;
}

export interface CompensationSnapshot {
  baseSalaryAnnual: number;
  components: { code: string; label: string; amountAnnual: number }[];
  lastUpdatedAt: string;
}

export interface RoleAssignmentSnapshot {
  designation: string;
  department: string;
  reportingManagerName: string;
  effectiveFrom: string;
}

export interface CompanyAssignment {
  leavePolicyName: string;
  shiftName: string;
  locationName: string;
  gradeBand: string;
}

export interface EmployeeProfileModel {
  core: CoreEmployeeRecord;
  /** Normalized status for badges / HR actions */
  statusUi: EmploymentStatusUi;
  personal: PersonalInfoFields;
  banking: BankingDetails;
  identities: IdentityRecord[];
  education: EducationEntry[];
  workExperience: WorkExperienceEntry[];
  profileChangeRequests: ProfileChangeRequest[];
  growthTimeline: GrowthTimelineNode[];
  documents: DocumentRow[];
  recentActivity: RecentActivityItem[];
  leaveBalanceDays?: number;
  compensation: CompensationSnapshot;
  salaryHistory: SalaryHistoryEntry[];
  roleAssignment: RoleAssignmentSnapshot;
  companyAssignment: CompanyAssignment;
  lifecycleEvents: {
    id: string;
    type: LifecycleEventType;
    date: string;
    label: string;
    detail?: string;
  }[];
}
