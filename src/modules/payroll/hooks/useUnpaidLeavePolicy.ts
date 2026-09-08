import type { GraphQLClient } from 'graphql-request';
import { useEffect, useMemo, useRef, useState } from 'react';

import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import {
  SaveUnpaidLeavePolicyDocument,
  UnpaidLeavePolicyDocument,
  type UnpaidLeavePolicy,
} from '../unpaidLeaveDocuments';

const emptyPolicy: UnpaidLeavePolicy = {
  enabled: false,
  basicComponentCode: null,
  dayDivisor: null,
  treatment: null,
};
const initialState = (owner: object) => ({
  owner,
  form: emptyPolicy,
  loading: true,
  busy: false,
  error: '',
  saved: false,
  loaded: false,
});

export function useUnpaidLeavePolicy(client: GraphQLClient, ownerKey: string) {
  const owner = useMemo(() => ({ client, ownerKey }), [client, ownerKey]);
  const currentOwner = useRef(owner);
  currentOwner.current = owner;
  const [state, setState] = useState(() => initialState(owner));
  const [reload, setReload] = useState(0);
  const visible = state.owner === owner ? state : initialState(owner);
  const blocked = visible.loading || visible.busy || !visible.loaded;
  useEffect(() => {
    let active = true;
    setState(initialState(owner));
    client
      .request<{ payrollUnpaidLeavePolicy: UnpaidLeavePolicy | null }>(UnpaidLeavePolicyDocument)
      .then((data) => {
        if (active && currentOwner.current === owner)
          setState({
            ...initialState(owner),
            form: data.payrollUnpaidLeavePolicy ?? emptyPolicy,
            loading: false,
            loaded: true,
          });
      })
      .catch((error: unknown) => {
        if (active && currentOwner.current === owner)
          setState({ ...initialState(owner), loading: false, error: graphQlUserMessage(error) });
      });
    return () => {
      active = false;
    };
  }, [client, owner, reload]);
  const change = (values: Partial<UnpaidLeavePolicy>) =>
    setState((previous) => ({ ...previous, form: { ...previous.form, ...values }, saved: false }));
  const save = async () => {
    if (blocked) return;
    setState((previous) => ({ ...previous, busy: true, error: '', saved: false }));
    try {
      const data = await client.request<{ savePayrollUnpaidLeavePolicy: UnpaidLeavePolicy }>(
        SaveUnpaidLeavePolicyDocument,
        { input: visible.form }
      );
      if (currentOwner.current === owner)
        setState({
          ...initialState(owner),
          form: data.savePayrollUnpaidLeavePolicy,
          loading: false,
          saved: true,
          loaded: true,
        });
    } catch (error) {
      if (currentOwner.current === owner)
        setState((previous) => ({ ...previous, busy: false, error: graphQlUserMessage(error) }));
    }
  };
  return { ...visible, blocked, change, save, retry: () => setReload((value) => value + 1) };
}
