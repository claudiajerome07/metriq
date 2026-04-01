import { useState, useEffect, useCallback } from 'react';

export function useAsyncData(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const executeFetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || 'An error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    executeFetch();
  }, deps);

  return { data, loading, error, refetch: executeFetch };
}
