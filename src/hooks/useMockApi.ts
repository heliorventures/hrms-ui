import { useState, useEffect } from 'react';
import { QueryResult } from '../types';

interface UseMockApiOptions {
  delay?: number;
  shouldFail?: boolean;
  errorMessage?: string;
}

export const useMockApi = <T,>(
  dataFetcher: () => T,
  options: UseMockApiOptions = {}
): QueryResult<T> => {
  const { delay = 500, shouldFail = false, errorMessage = 'An error occurred' } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, delay));

      if (shouldFail) {
        setError(new Error(errorMessage));
        setLoading(false);
        return;
      }

      try {
        const result = dataFetcher();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

export const mockMutation = async <T,>(
  mutationFn: () => T,
  options: UseMockApiOptions = {}
): Promise<T> => {
  const { delay = 300, shouldFail = false, errorMessage = 'Mutation failed' } = options;

  await new Promise((resolve) => setTimeout(resolve, delay));

  if (shouldFail) {
    throw new Error(errorMessage);
  }

  return mutationFn();
};
