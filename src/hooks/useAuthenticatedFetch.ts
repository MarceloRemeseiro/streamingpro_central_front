import { useAuth } from '@/components/AuthProvider';
import { useEffect, useState, useCallback } from 'react';

export function useAuthenticatedFetch<T>(url: string, options?: RequestInit) {
  const { isAuthenticated, isLoading } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated || isLoading) return;

    try {
      setIsLoadingData(true);
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error('Error en la petición');
      }

      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setData(null);
    } finally {
      setIsLoadingData(false);
    }
  }, [url, isAuthenticated, isLoading, options]);

  useEffect(() => {
    let isMounted = true;

    const doFetch = async () => {
      if (!isMounted) return;
      await fetchData();
    };

    doFetch();

    return () => {
      isMounted = false;
    };
  }, [fetchData]);

  return { 
    data, 
    error, 
    isLoading: isLoading || isLoadingData,
    refetch: fetchData
  };
} 