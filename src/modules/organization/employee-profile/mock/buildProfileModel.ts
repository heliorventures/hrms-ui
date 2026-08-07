import type {
  CompanyAssignment,
  CompensationSnapshot,
  CoreEmployeeRecord,
  DocumentRow,
  EducationEntry,
  EmployeeProfileModel,
  EmploymentStatusUi,
  GrowthTimelineNode,
  IdentityRecord,
  LifecycleEventType,
  PersonalInfoFields,
  RecentActivityItem,
  RoleAssignmentSnapshot,
  SalaryHistoryEntry,
  WorkExperienceEntry,
} from '../types';

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function pick<T>(seed: number, i: number, arr: readonly T[]): T {
  return arr[(seed + i * 17) % arr.length];
}

function normalizeStatus(status: string): EmploymentStatusUi {
  const u = status.toUpperCase();
  if (u.includes('TERM')) return 'TERMINATED';
  if (u.includes('LEAVE') || u === 'ON_LEAVE') return 'ON_LEAVE';
  if (u.includes('SUSPEND')) return 'SUSPENDED';
  return 'ACTIVE';
}

/**
 * Builds a rich profile view-model from live `CoreEmployeeRecord`.
 * Replace this with federation fields when HR subgraph exposes them.
 */
export function buildEmployeeProfileModel(core: CoreEmployeeRecord): EmployeeProfileModel {
  const seed = hashSeed(core.id);
  const dept = core.departmentName ?? 'General';
  const desig = core.designationTitle ?? 'Team Member';

  const personal: PersonalInfoFields = {
    firstName: core.firstName,
    lastName: core.lastName,
    bloodGroup: core.bloodGroup ?? '',
    email: core.linkedUserEmail ?? `employee.${core.employeeCode.toLowerCase()}@company.example`,
    phone: `+91 ${9800000000 + (seed % 99999999)}`,
    dateOfBirth: new Date(1990 + (seed % 12), (seed % 11) + 1, (seed % 27) + 1).toISOString(),
    gender: pick(seed, 1, ['Female', 'Male', 'Non-binary'] as const),
    nationality: 'Indian',
    permanentAddress: '221B Baker Street, Bengaluru, KA 560001',
    currentAddress: '12 Residency Road, Bengaluru, KA 560025',
    emergencyContactName: pick(seed, 2, ['A. Sharma', 'R. Patel', 'S. Khan'] as const),
    emergencyContactPhone: `+91 ${9000000000 + (seed % 88888888)}`,
    emergencyContactRelation: pick(seed, 8, ['Spouse', 'Parent', 'Sibling'] as const),
  };

  const tail = String(1000 + (seed % 9000));
  const identities: IdentityRecord[] = [
    {
      kind: 'PAN',
      maskedValue: `AB•••••${1000 + (seed % 9000)}`,
      verificationStatus: pick(seed, 3, ['VERIFIED', 'PENDING', 'UNVERIFIED'] as const),
    },
    {
      kind: 'AADHAAR',
      maskedValue: `XXXX XXXX ${2000 + (seed % 8000)}`,
      verificationStatus: pick(seed, 4, ['PENDING', 'VERIFIED'] as const),
    },
    {
      kind: 'PASSPORT',
      maskedValue: `Z•••••${3000 + (seed % 7000)}`,
      verificationStatus: 'UNVERIFIED',
    },
  ];

  const baseAnnual = 850000 + (seed % 400000) * 12;

  const compensation: CompensationSnapshot = {
    baseSalaryAnnual: baseAnnual,
    components: [
      { code: 'HRA', label: 'House Rent Allowance', amountAnnual: Math.round(baseAnnual * 0.4) },
      { code: 'PF', label: 'Employer PF', amountAnnual: Math.round(baseAnnual * 0.12) },
    ],
    lastUpdatedAt: new Date(Date.now() - (seed % 90) * 86400000).toISOString(),
  };

  const salaryHistory: SalaryHistoryEntry[] = [
    {
      id: `${core.id}-sh-1`,
      effectiveDate: new Date(new Date(core.dateOfJoining).getTime() + 86400000 * 365).toISOString(),
      previousAnnual: Math.round(baseAnnual / 1.12),
      newAnnual: Math.round(baseAnnual / 1.05),
      changePercent: 6.7,
      reason: 'Annual appraisal cycle',
    },
    {
      id: `${core.id}-sh-2`,
      effectiveDate: new Date(new Date(core.dateOfJoining).getTime() + 86400000 * 550).toISOString(),
      previousAnnual: Math.round(baseAnnual / 1.05),
      newAnnual: baseAnnual,
      changePercent: 5.0,
      reason: 'Promotion to ' + desig,
    },
  ];

  const education: EducationEntry[] = [
    {
      id: `${core.id}-ed-1`,
      degree: 'B.Tech — Computer Science',
      institution: pick(seed, 5, ['NITK Surathkal', 'BITS Pilani', 'IIIT Hyderabad'] as const),
      year: 2012 + (seed % 6),
    },
    {
      id: `${core.id}-ed-2`,
      degree: 'PG Diploma — Product Design',
      institution: 'IIMA — Blended',
      year: 2016 + (seed % 4),
    },
  ];

  const workExperience: WorkExperienceEntry[] = [
    {
      id: `${core.id}-wx-1`,
      company: pick(seed, 6, ['Contoso Labs', 'Fabrikam SaaS', 'Northwind Tech'] as const),
      role: 'Software Engineer II',
      startDate: new Date(new Date(core.dateOfJoining).getTime() - 86400000 * 700).toISOString(),
      endDate: new Date(new Date(core.dateOfJoining).getTime() - 86400000 * 14).toISOString(),
      description: 'Built core HR integrations and identity modules.',
      isCurrent: false,
    },
    {
      id: `${core.id}-wx-2`,
      company: 'HeliorHRMS (current org)',
      role: desig,
      startDate: core.dateOfJoining,
      endDate: null,
      description: 'Leading employee experience and platform reliability initiatives.',
      isCurrent: true,
    },
  ];

  const growthTimeline: GrowthTimelineNode[] = [
    {
      id: `${core.id}-g-1`,
      type: 'JOINING',
      date: core.dateOfJoining,
      title: 'Joined as ' + desig,
      notes: `Department: ${dept}`,
    },
    {
      id: `${core.id}-g-2`,
      type: 'APPRAISAL',
      date: salaryHistory[0]?.effectiveDate ?? core.dateOfJoining,
      title: 'Annual appraisal',
      salaryChangePercent: salaryHistory[0]?.changePercent,
      notes: salaryHistory[0]?.reason,
    },
    {
      id: `${core.id}-g-3`,
      type: 'PROMOTION',
      date: salaryHistory[1]?.effectiveDate ?? core.dateOfJoining,
      title: 'Promoted to ' + desig,
      salaryChangePercent: salaryHistory[1]?.changePercent,
      notes: 'Expanded scope to cross-team delivery.',
    },
    {
      id: `${core.id}-g-4`,
      type: 'SALARY_CHANGE',
      date: compensation.lastUpdatedAt,
      title: 'Compensation refresh',
      salaryChangePercent: 4.2,
      notes: 'Market correction + retention.',
    },
  ];

  const documents: DocumentRow[] = [
    {
      id: `${core.id}-doc-1`,
      name: `${core.fullName}_PAN.pdf`,
      category: 'PAN',
      uploadedBy: 'EMPLOYEE',
      uploadedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
      status: 'PENDING',
      mimeType: 'application/pdf',
    },
    {
      id: `${core.id}-doc-2`,
      name: 'Signed_Offer_2024.pdf',
      category: 'OFFER_LETTER',
      uploadedBy: 'HR',
      uploadedAt: new Date(Date.now() - 86400000 * 180).toISOString(),
      status: 'APPROVED',
      mimeType: 'application/pdf',
    },
    {
      id: `${core.id}-doc-3`,
      name: 'Appraisal_2025.pdf',
      category: 'APPRAISAL_LETTER',
      uploadedBy: 'HR',
      uploadedAt: new Date(Date.now() - 86400000 * 40).toISOString(),
      status: 'APPROVED',
      mimeType: 'application/pdf',
    },
  ];

  const recentActivity: RecentActivityItem[] = [
    { id: 'a1', label: 'Profile section — Personal saved', at: new Date().toISOString() },
    {
      id: 'a2',
      label: 'Document PAN uploaded',
      at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'a3',
      label: 'Salary revised (HR)',
      at: new Date(Date.now() - 86400000 * 60).toISOString(),
    },
  ];

  const roleAssignment: RoleAssignmentSnapshot = {
    designation: desig,
    department: dept,
    reportingManagerName: core.reportingManagerName ?? '—',
    effectiveFrom: core.dateOfJoining,
  };

  const companyAssignment: CompanyAssignment = {
    leavePolicyName: pick(seed, 7, ['Standard India FY', 'Flexible PTO', 'Consultant'] as const),
    shiftName: 'General — 10:00–19:00 IST',
    locationName: pick(seed, 8, ['Bengaluru HQ', 'Mumbai DC', 'Remote — India'] as const),
    gradeBand: `L${4 + (seed % 4)} — Band ${String.fromCharCode(65 + (seed % 5))}`,
  };

  const lifecycleEvents: {
    id: string;
    type: LifecycleEventType;
    date: string;
    label: string;
    detail?: string;
  }[] = [
    {
      id: 'lc1',
      type: 'JOINING',
      date: core.dateOfJoining,
      label: 'Joined',
      detail: desig,
    },
    {
      id: 'lc2',
      type: 'PROMOTION',
      date: growthTimeline[2]?.date ?? core.dateOfJoining,
      label: 'Promotion',
      detail: desig,
    },
    {
      id: 'lc3',
      type: 'SALARY_CHANGE',
      date: salaryHistory[1]?.effectiveDate ?? core.dateOfJoining,
      label: 'Salary revision',
    },
    {
      id: 'lc4',
      type: 'DEPARTMENT_CHANGE',
      date: new Date(new Date(core.dateOfJoining).getTime() + 86400000 * 400).toISOString(),
      label: 'Department move',
      detail: dept,
    },
  ];

  return {
    core,
    statusUi: normalizeStatus(core.status),
    personal,
    banking: {
      bankName: pick(seed, 9, ['HDFC Bank', 'ICICI Bank', 'Axis Bank'] as const),
      accountNumberMasked: `••••••${tail}`,
      accountNumberTail: tail,
      ifscCode: `HDFC0${(seed % 900000).toString().padStart(6, '0')}`,
      accountType: 'Savings',
      verificationStatus: 'VERIFIED',
    },
    identities,
    education,
    workExperience,
    growthTimeline,
    documents,
    recentActivity,
    leaveBalanceDays: 14 + (seed % 10),
    compensation,
    salaryHistory,
    roleAssignment,
    companyAssignment,
    lifecycleEvents,
  };
}
