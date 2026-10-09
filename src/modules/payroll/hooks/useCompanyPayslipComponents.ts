import type { GraphQLClient } from 'graphql-request';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  CompanyPayslipComponentsDocument,
  SetSalaryComponentPayslipVisibilityDocument,
  type CompanyPayslipComponentsQuery,
} from '../../../api/graphql/graphql';
import { useActionFeedback } from '../../../hooks/useActionFeedback';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { PAYSLIP_SETTINGS_CHANGED } from '../payslipTemplates';

type DisplayComponent = CompanyPayslipComponentsQuery['salaryComponents'][number];
export const useCompanyPayslipComponents = (client: GraphQLClient) => {
  const notifyAction = useActionFeedback();
  const owner = useMemo(() => ({ client }), [client]);
  const activeOwner = useRef<object | null>(null);
  const pending = useRef<object | null>(null);
  const [state, setState] = useState({
    owner,
    rows: [] as DisplayComponent[],
    error: null as string | null,
    busy: null as string | null,
    loading: true,
  });
  useEffect(() => {
    let active = true;
    activeOwner.current = owner;
    pending.current = null;
    setState({ owner, rows: [], error: null, busy: null, loading: true });
    client.request(CompanyPayslipComponentsDocument).then(
      ({ salaryComponents }) => {
        if (active && activeOwner.current === owner)
          setState({ owner, rows: salaryComponents, error: null, busy: null, loading: false });
      },
      (reason: unknown) => {
        if (active && activeOwner.current === owner)
          setState({
            owner,
            rows: [],
            error: graphQlUserMessage(reason),
            busy: null,
            loading: false,
          });
      }
    );
    return () => {
      active = false;
      activeOwner.current = null;
    };
  }, [client, owner]);
  const change = async (row: DisplayComponent, visible: boolean) => {
    if (activeOwner.current !== owner || state.loading || pending.current === owner) return;
    pending.current = owner;
    setState((current) => ({ ...current, busy: row.id, error: null }));
    try {
      const result = await client.request(SetSalaryComponentPayslipVisibilityDocument, {
        componentId: row.id,
        visible,
      });
      if (activeOwner.current !== owner) return;
      if (!result.setSalaryComponentPayslipVisibility)
        throw new Error('Component visibility was not saved.');
      setState((current) => ({
        ...current,
        rows: current.rows.map((item) =>
          item.id === row.id ? { ...item, showOnPayslip: visible } : item
        ),
      }));
      window.dispatchEvent(new Event(PAYSLIP_SETTINGS_CHANGED));
      notifyAction();
    } catch (reason) {
      if (activeOwner.current === owner)
        setState((current) => ({ ...current, error: graphQlUserMessage(reason) }));
    } finally {
      if (activeOwner.current === owner) {
        pending.current = null;
        setState((current) => ({ ...current, busy: null }));
      }
    }
  };
  return {
    ...(state.owner === owner ? state : { rows: [], error: null, busy: null, loading: true }),
    change,
  };
};
