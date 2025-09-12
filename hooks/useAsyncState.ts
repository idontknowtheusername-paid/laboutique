import { useState, useCallback } from 'react';

interface AsyncState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

interface UseAsyncStateReturn<T> extends AsyncState<T> {
    setData: (data: T) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    reset: () => void;
    execute: (asyncFn: () => Promise<T>) => Promise<void>;
}

export const useAsyncState = <T = any>(
    initialData: T | null = null
): UseAsyncStateReturn<T> => {
    const [state, setState] = useState<AsyncState<T>>({
        data: initialData,
        loading: false,
        error: null,
    });

    const setData = useCallback((data: T) => {
        setState(prev => ({ ...prev, data, error: null }));
    }, []);

    const setLoading = useCallback((loading: boolean) => {
        setState(prev => ({ ...prev, loading }));
    }, []);

    const setError = useCallback((error: string | null) => {
        setState(prev => ({ ...prev, error, loading: false }));
    }, []);

    const reset = useCallback(() => {
        setState({
            data: initialData,
            loading: false,
            error: null,
        });
    }, [initialData]);

    const execute = useCallback(async (asyncFn: () => Promise<T>) => {
        try {
            setLoading(true);
            setError(null);
            const result = await asyncFn();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    }, [setData, setError, setLoading]);

    return {
        ...state,
        setData,
        setLoading,
        setError,
        reset,
        execute,
    };
};