import { useState } from 'react';

import type { ExitExposure } from './exitFinanceModel';
import type { ExitPayrollContext } from './exitPayrollContext';
import type { FnfSource } from './fnfSourceForm';
import type { LoanValues } from './loanForm';

export function useFnfInputs() {
  const [context, setContext] = useState<{
    exposure: ExitExposure;
    currency: string;
    payrollContext: ExitPayrollContext;
  } | null>(null);
  const [sources, setSources] = useState<FnfSource[]>([]);
  const [values, setValues] = useState<LoanValues>({});
  const [reviewing, setReviewing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const edit = () => {
    setDirty(true);
    setReviewing(false);
  };
  return {
    context,
    setContext,
    sources,
    setSources,
    values,
    setValues,
    reviewing,
    setReviewing,
    dirty,
    setDirty,
    edit,
  };
}
