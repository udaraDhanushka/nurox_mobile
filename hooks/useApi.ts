import { useState, useEffect, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiOptions = {}
): [UseApiState<T>, (...args: any[]) => Promise<void>] {
  const { immediate = false, onSuccess, onError } = options;
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (...args: any[]) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiFunction(...args);
      setState({ data: result, loading: false, error: null });
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [apiFunction, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return [state, execute];
}

// Specialized hook for paginated data
export function usePaginatedApi<T>(
  apiFunction: (query: any) => Promise<{ data: T[]; pagination: any }>,
  initialQuery: any = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState(initialQuery);

  const loadData = useCallback(async (newQuery: any = {}, append: boolean = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction({ ...query, ...newQuery });
      
      if (append) {
        setData(prev => [...prev, ...result.data]);
      } else {
        setData(result.data);
      }
      
      setPagination(result.pagination);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiFunction, query]);

  const loadMore = useCallback(() => {
    if (pagination && pagination.page < pagination.pages) {
      loadData({ page: pagination.page + 1 }, true);
    }
  }, [loadData, pagination]);

  const refresh = useCallback(() => {
    loadData({ ...query, page: 1 }, false);
  }, [loadData, query]);

  const updateQuery = useCallback((newQuery: any) => {
    setQuery(prev => ({ ...prev, ...newQuery }));
    loadData({ ...query, ...newQuery, page: 1 }, false);
  }, [loadData, query]);

  useEffect(() => {
    loadData();
  }, []);

  return {
    data,
    pagination,
    loading,
    error,
    loadMore,
    refresh,
    updateQuery,
    hasMore: pagination ? pagination.page < pagination.pages : false,
  };
}

// Hook for handling form submissions with API calls
export function useApiForm<T>(
  apiFunction: (data: any) => Promise<T>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
    resetOnSuccess?: boolean;
  } = {}
) {
  const { onSuccess, onError, resetOnSuccess = false } = options;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = useCallback(async (formData: any) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const result = await apiFunction(formData);
      setSuccess(true);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      if (resetOnSuccess) {
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError, resetOnSuccess]);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
    setLoading(false);
  }, []);

  return {
    submit,
    loading,
    error,
    success,
    reset,
  };
}