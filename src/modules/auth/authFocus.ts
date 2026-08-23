import type { RefObject } from 'react';

export function focusFirstInvalidField<T extends string>(
  errors: Partial<Record<T, string>>,
  order: readonly T[],
  refs: Readonly<Record<T, RefObject<HTMLInputElement>>>
): T | null {
  for (const field of order) {
    if (!errors[field]) continue;

    const input = refs[field].current;
    if (!input) continue;

    input.focus();
    return field;
  }

  return null;
}
