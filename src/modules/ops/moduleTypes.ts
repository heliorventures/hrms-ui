export type ModuleRow = {
  id: string;
  code: string;
  name: string;
  category?: string | null;
  isActive: boolean;
  isCore: boolean;
};

export type TenantRow = { id: string; name: string };

export type SubRow = {
  id: string;
  tenantId: string;
  moduleId: string;
  status: string;
  activatedAt?: string | null;
  expiresAt?: string | null;
  contractedSeats: number;
  currentSeatUsage: number;
  overagePolicy: string;
};

export const SUBSCRIPTION_STATUS_OPTIONS = [
  'PENDING',
  'ACTIVE',
  'SUSPENDED',
  'CANCELLED',
  'EXPIRED',
] as const;

export const SUBSCRIPTION_OVERAGE_OPTIONS = ['BLOCK', 'ALLOW', 'NOTIFY'] as const;
