import { useLayoutEffect, useMemo, useRef } from 'react';

export interface ApplyLeaveDialogContext<Client> {
  client: Client;
  isOpen: boolean;
}

export function useApplyLeaveDialogOwnership<Client>(client: Client, isOpen: boolean) {
  const dialogContext = useMemo<ApplyLeaveDialogContext<Client>>(
    () => ({ client, isOpen }),
    [client, isOpen]
  );
  const dialogContextRef = useRef(dialogContext);
  const activeSubmissionRef = useRef<ApplyLeaveDialogContext<Client> | null>(null);

  useLayoutEffect(() => {
    dialogContextRef.current = dialogContext;
  }, [dialogContext]);

  return { activeSubmissionRef, dialogContext, dialogContextRef };
}
