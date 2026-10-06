import type { PayslipTemplateId } from '../payslipTemplates';

import PayslipSheet from './PayslipSheet';
import PayslipTableSheet from './PayslipTableSheet';

export const PAYSLIP_SHEETS: Record<PayslipTemplateId, typeof PayslipSheet> = {
  EXISTING: PayslipSheet,
  TABLE: PayslipTableSheet,
};
