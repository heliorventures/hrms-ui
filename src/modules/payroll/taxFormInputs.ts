import { TaxFormError } from './taxFormError';
import { parseComponentAmounts, percentageFraction, sumMoney } from './taxFormValues';
import type { TaxHistory, TaxSettingsInput } from './taxProjectionTypes';

interface SettingsFields {
  regime: string;
  method: TaxSettingsInput['method'];
  rate: string;
  basis: string;
  from: string;
  until: string;
  resident: string;
  reason: string;
}

const overrideFields = ({ method, basis, reason, rate }: SettingsFields) => {
  if (method !== 'PERCENTAGE_OVERRIDE') return { percentage: null, basis_components: [] };
  if (!basis.trim() || !reason.trim())
    throw new TaxFormError('A component basis and reason are required.');
  return {
    percentage: percentageFraction(rate),
    basis_components: basis.split(',').map((value) => value.trim().toUpperCase()),
  };
};

export const taxSettingsInput = (fields: SettingsFields): TaxSettingsInput => {
  const { regime, method, from, until, resident, reason } = fields;
  if (regime !== 'NEW' && regime !== 'OLD') throw new TaxFormError('Select the annual tax regime.');
  if (!from || (until && until < from)) throw new TaxFormError('Review the effective dates.');
  return {
    regime,
    method,
    ...overrideFields(fields),
    effective_from: from,
    effective_until: until || null,
    reason: reason.trim() || null,
    resident: resident === '' ? null : resident === 'true',
  };
};

interface HistoryFields {
  year: number;
  from: string;
  until: string;
  source: string;
  employer: string;
  components: string;
  tds: string;
  complete: boolean;
  reason: string;
}

const validateHistoryDates = ({ year, from, until }: HistoryFields) => {
  if (!from || !until || !Number.isInteger(year) || year < 2000 || year > 2199)
    throw new TaxFormError('Enter a valid tax year and covered dates.');
  if (from < `${year}-04-01` || until > `${year + 1}-03-31` || until < from)
    throw new TaxFormError('History must fit inside the April–March tax year.');
};

export const taxHistoryInput = (fields: HistoryFields): TaxHistory => {
  validateHistoryDates(fields);
  const { year, from, until, source, employer, components, tds, complete, reason } = fields;
  if (complete && !tds.trim())
    throw new TaxFormError(
      'Complete coverage requires recorded TDS; enter zero only when confirmed.'
    );
  if (tds.trim() && !/^\d+(\.\d{1,2})?$/.test(tds.trim()))
    throw new TaxFormError(
      'Recorded TDS must be a non-negative amount with at most two decimal places.'
    );
  const amounts = parseComponentAmounts(components);
  return {
    fiscal_year: year,
    period_start: from,
    period_end: until,
    employer,
    source_key: source,
    earnings: sumMoney(Object.values(amounts)),
    components: amounts,
    tds: tds.trim() || null,
    coverage: complete ? 'COMPLETE' : 'INCOMPLETE',
    reason,
    evidence: 'IMPORTED_ACTUAL',
  };
};
