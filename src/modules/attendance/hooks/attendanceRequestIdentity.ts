import type { useGraphClient } from '../../../hooks/useGraphClient';

export type CursorOwnerIdentity = {
  client: ReturnType<typeof useGraphClient>;
  employeeId: string | undefined;
  fromDate: string;
  toDate: string;
};
export type BoardRequestIdentity = {
  client: ReturnType<typeof useGraphClient>;
  employeeId: string | undefined;
  queryKey: string;
};
export type RefreshIntent = { identity: BoardRequestIdentity; revision: number };

export function cursorOwnerIdentityMatches(
  left: CursorOwnerIdentity | null,
  right: CursorOwnerIdentity
): boolean {
  return (
    left !== null &&
    left.client === right.client &&
    left.employeeId === right.employeeId &&
    left.fromDate === right.fromDate &&
    left.toDate === right.toDate
  );
}

export function boardRequestIdentityMatches(
  left: BoardRequestIdentity | null,
  right: BoardRequestIdentity
): boolean {
  return (
    left !== null &&
    left.client === right.client &&
    left.employeeId === right.employeeId &&
    left.queryKey === right.queryKey
  );
}
