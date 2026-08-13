import type { EmployeePrivateProfileQuery } from '../../../../api/graphql/graphql';
import type {
  CompanyAssignment,
  CoreEmployeeRecord,
  DocumentRow,
  EducationEntry,
  EmployeeProfileModel,
  EmploymentStatusUi,
  GrowthTimelineNode,
  IdentityRecord,
  PersonalInfoFields,
  RecentActivityItem,
  RoleAssignmentSnapshot,
  SalaryHistoryEntry,
  VerificationStatus,
} from '../types';

function normalizeStatus(status: string): EmploymentStatusUi {
  const u = status.toUpperCase();
  if (u.includes('TERM')) return 'TERMINATED';
  if (u.includes('LEAVE') || u === 'ON_LEAVE') return 'ON_LEAVE';
  if (u.includes('SUSPEND')) return 'SUSPENDED';
  return 'ACTIVE';
}

function mapCategory(cat?: string | null, name?: string | null): DocumentRow['category'] {
  const blob = `${cat ?? ''} ${name ?? ''}`.toUpperCase();
  if (blob.includes('PAN')) return 'PAN';
  if (blob.includes('AADHAAR') || blob.includes('AADHAR')) return 'AADHAAR';
  if (blob.includes('PASSPORT')) return 'PASSPORT';
  if (blob.includes('OFFER')) return 'OFFER_LETTER';
  if (blob.includes('APPRAISAL')) return 'APPRAISAL_LETTER';
  return 'OTHER';
}

function docStatus(s: string): DocumentRow['status'] {
  const u = s.toUpperCase();
  if (u === 'APPROVED') return 'APPROVED';
  if (u === 'REJECTED') return 'REJECTED';
  return 'PENDING';
}

function verifyFromBool(v: boolean): VerificationStatus {
  return v ? 'VERIFIED' : 'UNVERIFIED';
}

/** Build full profile view model from `EmployeeProfileBundle`. */
export function mapBundleToEmployeeProfileModel(
  bundle: EmployeePrivateProfileQuery
): EmployeeProfileModel | null {
  const emp = bundle.employee;
  if (!emp) return null;

  const core: CoreEmployeeRecord = {
    id: emp.id,
    employeeCode: emp.employeeCode,
    firstName: emp.firstName,
    lastName: emp.lastName,
    fullName: emp.fullName,
    status: emp.status,
    employmentType: emp.employmentType ?? null,
    dateOfJoining:
      typeof emp.dateOfJoining === 'string' ? emp.dateOfJoining : String(emp.dateOfJoining),
    departmentId: emp.departmentId ?? null,
    designationId: emp.designationId ?? null,
    userId: emp.userId ?? null,
    reportingManagerId: emp.reportingManagerId ?? null,
    departmentName: emp.departmentName ?? null,
    designationTitle: emp.designationTitle ?? null,
    linkedUserEmail: emp.linkedUserEmail ?? null,
    linkedUserUsername: emp.linkedUserUsername ?? null,
    reportingManagerName: emp.reportingManagerName ?? null,
    bloodGroup: emp.bloodGroup ?? null,
    createdAt: typeof emp.createdAt === 'string' ? emp.createdAt : String(emp.createdAt),
    updatedAt: typeof emp.updatedAt === 'string' ? emp.updatedAt : String(emp.updatedAt),
  };

  const dobRaw = emp.dateOfBirth;
  const dobIso =
    dobRaw == null
      ? ''
      : typeof dobRaw === 'string'
        ? dobRaw.length >= 10
          ? new Date(dobRaw).toISOString()
          : String(dobRaw)
        : String(dobRaw);

  const personal: PersonalInfoFields = {
    firstName: emp.firstName,
    lastName: emp.lastName,
    bloodGroup: emp.bloodGroup ?? '',
    email: emp.linkedUserEmail ?? '',
    phone: emp.personalPhone ?? '',
    dateOfBirth: dobIso ? dobIso.slice(0, 10) : '',
    gender: emp.gender ?? '',
    nationality: emp.nationality ?? '',
    permanentAddress: emp.permanentAddress ?? '',
    currentAddress: emp.currentAddress ?? '',
    emergencyContactName: emp.emergencyContactName ?? '',
    emergencyContactPhone: emp.emergencyContactPhone ?? '',
    emergencyContactRelation: emp.emergencyContactRelation ?? '',
  };

  const bankRow = bundle.employeePrimaryBank;
  const banking = {
    bankName: bankRow?.bankName ?? '—',
    accountNumberMasked: bankRow?.accountNumberMasked ?? '••••',
    accountNumberTail: '',
    ifscCode: bankRow?.ifscCode ?? '—',
    accountType: bankRow?.accountType ?? '—',
    verificationStatus: (bankRow?.isVerified ? 'VERIFIED' : 'UNVERIFIED') as VerificationStatus,
  };

  const idp = bundle.employeeIdentityProfile;
  const identities: IdentityRecord[] = [
    idp.pan
      ? {
          kind: 'PAN',
          maskedValue: idp.pan.maskedPan,
          verificationStatus: verifyFromBool(idp.pan.isVerified),
        }
      : {
          kind: 'PAN',
          maskedValue: '—',
          verificationStatus: 'UNVERIFIED',
        },
    idp.aadhaar
      ? {
          kind: 'AADHAAR',
          maskedValue: idp.aadhaar.maskedAadhaar,
          verificationStatus: verifyFromBool(idp.aadhaar.isVerified),
        }
      : {
          kind: 'AADHAAR',
          maskedValue: '—',
          verificationStatus: 'UNVERIFIED',
        },
    {
      kind: 'PASSPORT',
      maskedValue: '—',
      verificationStatus: 'UNVERIFIED',
    },
  ];

  const hist = [...bundle.employmentHistoryRecords].sort((a, b) => {
    const da = new Date(a.effectiveFrom).getTime();
    const db = new Date(b.effectiveFrom).getTime();
    return da - db;
  });

  const salaryHistory: SalaryHistoryEntry[] = [];
  for (let i = 0; i < hist.length; i++) {
    const row = hist[i];
    const prev = i > 0 ? hist[i - 1] : null;
    const newAnnual = row.monthlySalary ? Number(row.monthlySalary) * 12 : 0;
    const prevAnnual = prev?.monthlySalary != null ? Number(prev.monthlySalary) * 12 : newAnnual;
    let changePercent = 0;
    if (prevAnnual > 0 && newAnnual !== prevAnnual) {
      changePercent = ((newAnnual - prevAnnual) / prevAnnual) * 100;
    }
    salaryHistory.push({
      id: row.id,
      effectiveDate:
        typeof row.effectiveFrom === 'string' ? row.effectiveFrom : String(row.effectiveFrom),
      previousAnnual: prevAnnual,
      newAnnual,
      changePercent: Math.round(changePercent * 10) / 10,
      reason: row.changeReason ?? 'Compensation change',
    });
  }

  const latestMonthly = bundle.employmentHistoryRecords[0]?.monthlySalary;
  const parsedMonthly = latestMonthly != null ? Number(latestMonthly) : 0;
  const baseAnnual = parsedMonthly > 0 ? Math.round(parsedMonthly * 12) : 0;

  const compensation = {
    baseSalaryAnnual: baseAnnual,
    components: [] as { code: string; label: string; amountAnnual: number }[],
    lastUpdatedAt:
      bundle.employmentHistoryRecords[0]?.updatedAt != null
        ? typeof bundle.employmentHistoryRecords[0].updatedAt === 'string'
          ? bundle.employmentHistoryRecords[0].updatedAt
          : String(bundle.employmentHistoryRecords[0].updatedAt)
        : core.updatedAt,
  };

  const growthTimeline: GrowthTimelineNode[] = [
    {
      id: `g-join-${core.id}`,
      type: 'JOINING',
      date: core.dateOfJoining,
      title: 'Joined',
      notes: core.designationTitle
        ? `As ${core.designationTitle}`
        : core.departmentName
          ? `Department: ${core.departmentName}`
          : undefined,
    },
  ];
  for (const row of hist) {
    if (!row.monthlySalary) continue;
    const eff =
      typeof row.effectiveFrom === 'string' ? row.effectiveFrom : String(row.effectiveFrom);
    growthTimeline.push({
      id: `g-sal-${row.id}`,
      type: 'SALARY_CHANGE',
      date: eff,
      title: row.changeReason ?? 'Salary revision',
      notes: row.changeReason ?? undefined,
    });
  }

  const documents: DocumentRow[] = (bundle.employeeDocuments ?? []).map(
    (d: NonNullable<EmployeePrivateProfileQuery['employeeDocuments']>[number]) => {
      const uploadedBy =
        d.uploadedByUserId && emp.userId && d.uploadedByUserId === emp.userId ? 'EMPLOYEE' : 'HR';
      return {
        id: d.id,
        name: d.originalFileName ?? d.documentTypeName ?? 'Document',
        category: mapCategory(d.documentTypeCategory, d.documentTypeName),
        uploadedBy,
        uploadedAt: typeof d.uploadedAt === 'string' ? d.uploadedAt : String(d.uploadedAt),
        status: docStatus(d.status),
        mimeType: d.mimeType ?? 'application/octet-stream',
      };
    }
  );

  const recentActivity: RecentActivityItem[] = [];
  if (bundle.employmentHistoryRecords[0]) {
    const r = bundle.employmentHistoryRecords[0];
    recentActivity.push({
      id: 'act-salary',
      label: 'Compensation History Updated',
      at: typeof r.updatedAt === 'string' ? r.updatedAt : String(r.updatedAt),
    });
  }
  if (bundle.employeeDocuments[0]) {
    const d = bundle.employeeDocuments[0];
    recentActivity.push({
      id: 'act-doc',
      label: `Document: ${d.documentTypeName ?? d.originalFileName ?? 'file'}`,
      at: typeof d.uploadedAt === 'string' ? d.uploadedAt : String(d.uploadedAt),
    });
  }

  const roleAssignment: RoleAssignmentSnapshot = {
    designation: emp.designationTitle ?? '—',
    department: emp.departmentName ?? '—',
    reportingManagerName: emp.reportingManagerName ?? '—',
    effectiveFrom: core.dateOfJoining,
  };

  const companyAssignment: CompanyAssignment = {
    leavePolicyName: '—',
    shiftName: '—',
    locationName: '—',
    gradeBand: '—',
  };

  const lifecycleEvents: EmployeeProfileModel['lifecycleEvents'] = salaryHistory
    .slice(-4)
    .map((s, i) => ({
      id: `lc-${s.id}`,
      type: 'SALARY_CHANGE' as const,
      date: s.effectiveDate,
      label: i === 0 ? 'Salary revision' : 'Salary change',
      detail: s.reason,
    }));
  if (lifecycleEvents.length === 0) {
    lifecycleEvents.push({
      id: 'lc-join',
      type: 'JOINING',
      date: core.dateOfJoining,
      label: 'Joined',
      detail: roleAssignment.designation,
    });
  }

  return {
    core,
    statusUi: normalizeStatus(emp.status),
    personal,
    banking,
    identities,
    education: bundle.employeeEducationRecords.map(
      (row): EducationEntry => ({
        id: row.id,
        educationLevel: row.educationLevel,
        qualification: row.qualification,
        fieldOfStudy: row.fieldOfStudy ?? '',
        institution: row.institution,
        boardUniversity: row.boardUniversity ?? '',
        startDate: row.startDate == null ? '' : String(row.startDate),
        completionYear: row.completionYear,
        gradeScore: row.gradeScore ?? '',
        description: row.description ?? '',
        verificationStatus: row.verificationStatus as VerificationStatus,
        evidenceDocumentIds: [...row.evidenceDocumentIds],
        rejectionReason: row.rejectionReason,
      })
    ),
    workExperience: bundle.employeeWorkExperienceRecords.map((row) => ({
      id: row.id,
      company: row.company,
      roleTitle: row.roleTitle,
      employmentType: row.employmentType ?? '',
      location: row.location ?? '',
      startDate: String(row.startDate),
      endDate: row.endDate == null ? null : String(row.endDate),
      description: row.description ?? '',
      isCurrent: row.isCurrent,
      verificationStatus: row.verificationStatus as VerificationStatus,
      evidenceDocumentIds: [...row.evidenceDocumentIds],
      rejectionReason: row.rejectionReason,
    })),
    profileChangeRequests: bundle.employeeProfileChangeRequests.map((row) => ({
      id: row.id,
      requestType: row.requestType,
      status: row.status,
      requestedSummary: row.requestedSummary,
      supportingDocumentId: row.supportingDocumentId,
      rejectionReason: row.rejectionReason,
      createdAt: String(row.createdAt),
      updatedAt: String(row.updatedAt),
    })),
    growthTimeline,
    documents,
    recentActivity,
    leaveBalanceDays: undefined,
    compensation,
    salaryHistory: salaryHistory.length > 0 ? salaryHistory : [],
    roleAssignment,
    companyAssignment,
    lifecycleEvents,
  };
}
