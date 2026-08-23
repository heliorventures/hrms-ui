import { useCallback, useEffect, useRef, useState } from 'react';

import {
  AllCompanyHolidaysDocument,
  type AllCompanyHolidaysQuery,
} from '../../../api/graphql/graphql';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';

export interface AllCompanyHolidaysClient {
  request<T>(
    document: typeof AllCompanyHolidaysDocument,
    variables: { fromDate: string; limit: number }
  ): Promise<T>;
}

export const useAllCompanyHolidays = (client: AllCompanyHolidaysClient, limit: number) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<AllCompanyHolidaysQuery['upcomingHolidays']>([]);
  const [rowsOwner, setRowsOwner] = useState<AllCompanyHolidaysClient | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [failureOwner, setFailureOwner] = useState<AllCompanyHolidaysClient | null>(null);
  const requestGeneration = useRef(0);
  const ownerRef = useRef(client);

  if (ownerRef.current !== client) {
    ownerRef.current = client;
    requestGeneration.current += 1;
  }

  useEffect(
    () => () => {
      requestGeneration.current += 1;
    },
    []
  );

  useEffect(() => {
    requestGeneration.current += 1;
    setIsOpen(false);
    setLoading(false);
    setFailure(null);
    setFailureOwner(null);
  }, [client]);

  const open = useCallback(async () => {
    const owner = client;
    const generation = requestGeneration.current + 1;
    requestGeneration.current = generation;
    setIsOpen(true);
    setLoading(true);
    setFailure(null);
    setFailureOwner(null);
    try {
      const year = new Date().getFullYear();
      const response = await client.request<AllCompanyHolidaysQuery>(AllCompanyHolidaysDocument, {
        fromDate: `${year}-01-01`,
        limit,
      });
      if (ownerRef.current === owner && requestGeneration.current === generation) {
        setRows(response.upcomingHolidays ?? []);
        setRowsOwner(owner);
      }
    } catch (error) {
      if (ownerRef.current === owner && requestGeneration.current === generation) {
        setFailure(graphQlUserMessage(error));
        setFailureOwner(owner);
      }
    } finally {
      if (ownerRef.current === owner && requestGeneration.current === generation) setLoading(false);
    }
  }, [client, limit]);

  const retry = useCallback(async () => {
    await open();
  }, [open]);

  const close = useCallback(() => {
    requestGeneration.current += 1;
    setIsOpen(false);
    setLoading(false);
  }, []);

  return {
    close,
    failure: failureOwner === client ? failure : null,
    isOpen,
    loading,
    open,
    retry,
    rows: rowsOwner === client ? rows : [],
  };
};
