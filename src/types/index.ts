// Core types for the KabiPay application

/** Client-plane role for legacy UI checks (`admin` = any elevated tenant role from JWT). */
export type UserRole = 'employee' | 'admin';

export type AttendanceStatus = 'present' | 'absent' | 'half-day' | 'leave' | 'holiday';

export type LeaveType =
  | 'casual'
  | 'sick'
  | 'earned'
  | 'maternity'
  | 'paternity'
  | 'unpaid'
  | 'comp-off';

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export type ExpenseType = 'travel' | 'food' | 'accommodation' | 'supplies' | 'other';

export type ExpenseStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'reimbursed';

export type NotificationType = 'company' | 'personal' | 'system';

export type TaxRegime = 'old' | 'new';

export interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
  employeeId: string;
  department: string;
  designation: string;
  joiningDate: string;
  avatarUrl?: string;
}

export interface Tenant {
  id: string;
  name: string;
  companyCode: string;
  logoUrl?: string;
}

export interface AttendanceRecord {
  id: string;
  tenantId: string;
  userId: string;
  date: string;
  punchIn?: string;
  punchOut?: string;
  status: AttendanceStatus;
  workHours?: number;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  selfieUrl?: string;
  notes?: string;
}

export interface TimesheetEntry {
  id: string;
  tenantId: string;
  userId: string;
  date: string;
  projectId: string;
  projectName: string;
  taskDescription: string;
  hours: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
}

export interface LeaveBalance {
  leaveType: LeaveType;
  total: number;
  used: number;
  available: number;
}

export interface LeaveApplication {
  id: string;
  tenantId: string;
  userId: string;
  leaveType: LeaveType;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  approvedBy?: string;
  approvedOn?: string;
  rejectionReason?: string;
}

export interface Holiday {
  id: string;
  tenantId: string;
  date: string;
  name: string;
  type: 'national' | 'regional' | 'company';
}

export interface PayslipComponent {
  name: string;
  amount: number;
  type: 'earning' | 'deduction';
}

export interface Payslip {
  id: string;
  tenantId: string;
  userId: string;
  month: string; // YYYY-MM format
  basicSalary: number;
  components: PayslipComponent[];
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  taxRegime: TaxRegime;
  generatedOn: string;
}

export interface SalaryHistoryEntry {
  id: string;
  userId: string;
  tenantId: string;
  effectiveFrom: string; // YYYY-MM-DD
  effectiveTo: string | null; // null = current (infinite)
  totalMonthly: number;
  components: { name: string; amount: number }[];
  appraisalReason?: string;
}

export interface CompanyPayComponent {
  id: string;
  tenantId: string;
  name: string;
  type: 'earning' | 'deduction';
  isTaxable?: boolean;
}

export interface TaxDeductionSection {
  section: string;
  name: string;
  maxAmount?: number;
  subSections?: { name: string; limit?: number }[];
}

export interface DeclaredDeduction {
  section: string;
  name: string;
  amount: number;
  documentUploaded?: boolean;
}

export interface ExpenseClaim {
  id: string;
  tenantId: string;
  userId: string;
  type: ExpenseType;
  amount: number;
  date: string;
  description: string;
  billUrl?: string;
  status: ExpenseStatus;
  submittedOn?: string;
  approvedBy?: string;
  approvedOn?: string;
  rejectionReason?: string;
}

export interface TravelRequest {
  id: string;
  tenantId: string;
  userId: string;
  fromLocation: string;
  toLocation: string;
  fromDate: string;
  toDate: string;
  purpose: string;
  estimatedCost: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  submittedOn: string;
}

export interface Notification {
  id: string;
  tenantId: string;
  userId?: string; // undefined means company-wide
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface Employee {
  id: string;
  tenantId: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  workPhone?: string;
  department: string;
  designation: string;
  joiningDate: string;
  dateOfBirth: string;
  address: string;
  qualification: string;
  status: 'active' | 'inactive';
  avatarUrl?: string;
  location?: string;
  costCenter?: string;
  legalEntity?: string;
  businessUnit?: string;
}

// User profile (detailed) types
export interface UserProfileHeader {
  email: string;
  phone: string;
  companyName: string;
  employeeId: string;
}

export interface UserProfileOrg {
  businessUnit: string;
  department: string;
  reportingManager: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  board?: string;
  year: string;
  percentage?: string;
  summary?: string;
}

export interface PastExperience {
  id: string;
  company: string;
  role: string;
  from: string;
  to: string;
  summary?: string;
}

export interface ProfileTimelineEvent {
  id: string;
  type: 'designation' | 'appraisal' | 'project' | 'anniversary';
  title: string;
  description?: string;
  date: string;
}

export interface Identification {
  aadhar?: string;
  pan?: string;
  passport?: string;
}

export interface AddressDetail {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  proofDocument?: string;
}

export interface AlternateContact {
  personName: string;
  relation: string;
  phone: string;
}

export interface PrimaryDetails {
  name: string;
  displayName?: string;
  gender: string;
  maritalStatus: string;
  dateOfBirth: string;
  nationality: string;
  physicallyHandicapped: boolean;
}

export interface JobDetail {
  jobTitlePrimary: string;
  jobTitleSecondary?: string;
  managerName: string;
  managerEmail?: string;
  employeeId: string;
  joiningDate: string;
  workerType: string;
  timeType: 'full' | 'half';
}

export interface EmployeeTime {
  shift: string;
  weeklyOffPolicy: string;
  leavePlan: string;
  holidayCalendar: string;
  attendanceNumber: string;
  payrollTimeSource: string;
  disableAttendanceTracking: boolean;
  attendanceCaptureScheme: string;
  attendancePenalisationPolicy: string;
  attendanceTrackingPolicy: string;
  shiftWeeklyOffRule: string;
  shiftAllowancePolicy: string;
  overtime: string;
}

export interface CustomField {
  label: string;
  value: string;
}

export interface UserProfileFull {
  userId: string;
  header: UserProfileHeader;
  org: UserProfileOrg;
  primaryDetails: PrimaryDetails;
  identification: Identification;
  addresses: AddressDetail[];
  contact: { phone: string; alternate?: AlternateContact };
  education: EducationItem[];
  educationSummary?: string;
  pastExperience: PastExperience[];
  timeline: ProfileTimelineEvent[];
  jobDetail: JobDetail;
  employeeTime: EmployeeTime;
  customFields: CustomField[];
}

// Document folder and document types
export type DocumentFolderId =
  | 'onboarding'
  | 'employee-letters'
  | 'degrees-certificates'
  | 'previous-experience'
  | 'identity'
  | 'offer-letter'
  | 'exiting'
  | 'signatures';

export interface DocumentFolder {
  id: DocumentFolderId;
  label: string;
  count: number;
  icon: 'person' | 'folder' | 'graduation' | 'briefcase' | 'id' | 'offer' | 'exiting' | 'signature';
}

export interface DocumentDetailField {
  label: string;
  value: string;
  masked?: boolean; // show as XXXXXX492C with eye to reveal
}

export interface EmployeeDocument {
  id: string;
  folderId: DocumentFolderId;
  name: string;
  details: DocumentDetailField[];
  status: 'pending' | 'uploaded' | 'verified';
  requiresUpload?: boolean;
}

// GraphQL-style query/mutation types
export interface QueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export interface MutationResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
