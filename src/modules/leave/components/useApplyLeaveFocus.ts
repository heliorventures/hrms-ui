import { useLayoutEffect, useRef, type RefObject } from 'react';

import type { ApplyLeaveField } from './ApplyLeaveFormFields';
import type { ApplyLeaveOwnership } from './useApplyLeaveForm';

export function useApplyLeaveFocus(
  formRef: RefObject<HTMLFormElement>,
  ownership: ApplyLeaveOwnership
) {
  const frame = useRef<number>();
  const { dialogContext, dialogContextRef } = ownership;
  useLayoutEffect(
    () => () => {
      if (frame.current !== undefined) window.cancelAnimationFrame(frame.current);
    },
    [dialogContext]
  );
  return (field: ApplyLeaveField) => {
    if (frame.current !== undefined) window.cancelAnimationFrame(frame.current);
    const control = formRef.current?.elements.namedItem(field);
    frame.current = window.requestAnimationFrame(() => {
      if (dialogContextRef.current !== dialogContext) return;
      if (control instanceof HTMLElement && control.isConnected) control.focus();
    });
  };
}
