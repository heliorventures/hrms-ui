import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { LeaveBoardQuery } from '../../../api/graphql/graphql';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';

import {
  requestLeaveApplicationHolidays,
  HOLIDAY_TIMEOUT_MESSAGE,
  type HolidayClient,
} from './requestLeaveApplicationHolidays';

type Client = HolidayClient;
type HolidayRows = LeaveBoardQuery['upcomingHolidays'];
interface HolidayOwner {
  client: Client;
  identity: string;
}
interface HolidayState {
  owner: HolidayOwner;
  rows: HolidayRows;
  loading: boolean;
  ready: boolean;
  failure: string | null;
  loadedAt: number | null;
}

const HOLIDAY_FRESHNESS_MS = 5 * 60 * 1000;
interface HolidayOptions {
  client: Client;
  identity: string;
}

export const useHrLeaveApplicationHolidays = ({ client, identity }: HolidayOptions) => {
  const owner = useMemo(() => ({ client, identity }), [client, identity]);
  const currentOwner = useRef<HolidayOwner | null>(owner);
  const generation = useRef(0);
  const activeRequest = useRef<{
    owner: HolidayOwner;
    promise: Promise<void>;
    cancel: () => void;
  } | null>(null);
  const [snapshot, setSnapshot] = useState<HolidayState | null>(null);

  useLayoutEffect(() => {
    currentOwner.current = owner;
    generation.current += 1;
    activeRequest.current = null;
    return () => {
      currentOwner.current = null;
      generation.current += 1;
      activeRequest.current?.cancel();
      activeRequest.current = null;
    };
  }, [owner]);

  const request = useCallback(
    (force: boolean) => {
      if (currentOwner.current !== owner) return Promise.resolve();
      if (
        !force &&
        snapshot?.owner === owner &&
        snapshot.ready &&
        snapshot.loadedAt !== null &&
        Date.now() - snapshot.loadedAt < HOLIDAY_FRESHNESS_MS
      ) {
        return Promise.resolve();
      }
      if (activeRequest.current?.owner === owner) return activeRequest.current.promise;

      const revision = ++generation.current;
      const ownsResult = () => currentOwner.current === owner && generation.current === revision;
      setSnapshot((previous) => ({
        owner,
        rows: previous?.owner === owner ? previous.rows : [],
        loading: true,
        ready: previous?.owner === owner ? previous.ready : false,
        failure: null,
        loadedAt: previous?.owner === owner ? previous.loadedAt : null,
      }));
      const holidayRequest = requestLeaveApplicationHolidays(client);
      const promise = holidayRequest.promise
        .then((response) => {
          if (!ownsResult()) return;
          setSnapshot({
            owner,
            rows: response.upcomingHolidays,
            loading: false,
            ready: true,
            failure: null,
            loadedAt: Date.now(),
          });
        })
        .catch((error: unknown) => {
          if (!ownsResult()) return;
          setSnapshot((previous) => ({
            owner,
            rows: previous?.owner === owner ? previous.rows : [],
            loading: false,
            ready: false,
            failure:
              error instanceof Error && error.message === HOLIDAY_TIMEOUT_MESSAGE
                ? HOLIDAY_TIMEOUT_MESSAGE
                : graphQlUserMessage(error),
            loadedAt: previous?.owner === owner ? previous.loadedAt : null,
          }));
        })
        .finally(() => {
          if (activeRequest.current?.promise === promise) activeRequest.current = null;
        });
      activeRequest.current = { owner, promise, cancel: holidayRequest.cancel };
      return promise;
    },
    [client, owner, snapshot]
  );

  const load = useCallback(() => request(false), [request]);
  const retry = useCallback(() => request(true), [request]);
  const visible = snapshot?.owner === owner ? snapshot : null;

  return {
    failure: visible?.failure ?? null,
    load,
    loading: visible?.loading ?? false,
    ready: visible?.ready ?? false,
    retry,
    rows: visible?.rows ?? [],
  };
};
