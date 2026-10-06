import type { GraphQLClient } from 'graphql-request';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { UpsertPayrollComplianceSettingDocument } from '../../../api/graphql/graphql';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { payrollComplianceInput } from '../payrollComplianceInput';
import type { PayrollComplianceFormState } from '../payrollTypes';
import { PAYSLIP_SETTINGS_CHANGED } from '../payslipTemplates';

export interface PayrollComplianceSaveParams {
  client: GraphQLClient;
  enabled: boolean;
  ownerKey: string;
  complianceReady: boolean;
  complianceForm: PayrollComplianceFormState;
  reload: () => Promise<void>;
}

export const usePayrollComplianceSave = ({
  client,
  enabled,
  ownerKey,
  complianceReady,
  complianceForm,
  reload,
}: PayrollComplianceSaveParams) => {
  const owner = useMemo(() => ({ client, enabled, ownerKey }), [client, enabled, ownerKey]);
  const activeOwner = useRef<object | null>(owner);
  const pendingOwner = useRef<object | null>(null);
  const [state, setState] = useState<{
    owner: object;
    busy: boolean;
    error: string | null;
    ok: string | null;
  }>({ owner, busy: false, error: null, ok: null });
  useEffect(() => {
    activeOwner.current = owner;
    return () => {
      activeOwner.current = null;
    };
  }, [owner]);
  const savePayrollCompliance = useCallback(async () => {
    if (!enabled || !complianceReady || pendingOwner.current === owner) return;
    pendingOwner.current = owner;
    setState({ owner, busy: true, error: null, ok: null });
    try {
      const input = payrollComplianceInput(complianceForm);
      await client.request(UpsertPayrollComplianceSettingDocument, { input });
      if (activeOwner.current !== owner) return;
      window.dispatchEvent(new Event(PAYSLIP_SETTINGS_CHANGED));
      setState({
        owner,
        busy: true,
        error: null,
        ok: 'Company payroll settings and payslip template saved.',
      });
      await reload();
    } catch (error) {
      if (activeOwner.current === owner)
        setState({ owner, busy: false, error: graphQlUserMessage(error), ok: null });
    } finally {
      if (pendingOwner.current === owner) pendingOwner.current = null;
      if (activeOwner.current === owner) setState((current) => ({ ...current, busy: false }));
    }
  }, [client, complianceForm, complianceReady, enabled, owner, reload]);
  const visible = state.owner === owner ? state : { busy: false, error: null, ok: null };
  return {
    savePayrollCompliance,
    complianceSaveBusy: visible.busy,
    complianceSaveError: visible.error,
    complianceSaveOk: visible.ok,
  };
};
