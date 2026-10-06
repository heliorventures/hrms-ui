import { useEffect, useState } from 'react';

import { PAYSLIP_SETTINGS_CHANGED } from '../payslipTemplates';

export const usePayslipSettingsRevision = () => {
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const refresh = () => setRevision((current) => current + 1);
    window.addEventListener(PAYSLIP_SETTINGS_CHANGED, refresh);
    return () => window.removeEventListener(PAYSLIP_SETTINGS_CHANGED, refresh);
  }, []);
  return revision;
};
