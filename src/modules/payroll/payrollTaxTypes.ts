export interface TaxConfigurationRow {
  id: string;
  fiscalYear: number;
  regime?: string | null;
  countryCode: string;
  isActive: boolean;
}

export interface TaxSlabRow {
  id: string;
  taxConfigVersionId: string;
  incomeFrom: string;
  incomeTo?: string | null;
  taxRate?: string | null;
  surchargeRate?: string | null;
  cessRate?: string | null;
}

export interface TaxBoardData {
  taxConfigurations: TaxConfigurationRow[];
  taxSlabs: TaxSlabRow[];
}

export interface TaxSectionDefRow {
  id: string;
  sectionCode: string;
  sectionLabel: string;
  regimeScope?: string | null;
  countryCode: string;
  displayOrder: number;
  isActive: boolean;
  maxDeductionAmount?: string | null;
}

export interface TaxComputationRow {
  id: string;
  fiscalYear: number;
  taxConfigVersionId: string;
  taxRegimeChosen?: string | null;
  grossIncome?: string | null;
  totalDeductions?: string | null;
  taxableIncome?: string | null;
  finalTax?: string | null;
  tdsPerMonth?: string | null;
  computedAt: string;
}

export const formatTaxCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

export const formatOptionalTaxAmount = (value?: string | null) =>
  value == null ? 'No upper limit' : formatTaxCurrency(Number(value));
