import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { t } from '@renderer/lib/i18n-simple';

export interface ProgressiveActionOptions {
  onStart?: () => void;
  onProgress?: (progress: number) => void;
  onSuccess?: (result?: any) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  showToast?: boolean;
  simulateProgress?: boolean;
}

export function useProgressiveAction<T = any>(
  action: () => Promise<T>,
  options: ProgressiveActionOptions = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async () => {
    const {
      onStart,
      onProgress,
      onSuccess,
      onError,
      successMessage,
      errorMessage,
      showToast = true,
      simulateProgress = false,
    } = options;

    setIsLoading(true);
    setProgress(0);
    setError(null);

    // Call onStart callback
    onStart?.();

    // Simulate progress if needed
    let progressInterval: NodeJS.Timeout | null = null;
    if (simulateProgress) {
      let currentProgress = 0;
      progressInterval = setInterval(() => {
        currentProgress += Math.random() * 15;
        if (currentProgress > 90) currentProgress = 90;
        setProgress(currentProgress);
        onProgress?.(currentProgress);
      }, 200);
    }

    try {
      const result = await action();
      
      // Clear progress simulation
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      
      setProgress(100);
      setData(result);
      onProgress?.(100);
      onSuccess?.(result);

      if (showToast && successMessage) {
        toast.success(successMessage);
      }

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      
      // Clear progress simulation
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      
      setError(error);
      onError?.(error);

      if (showToast) {
        toast.error(errorMessage || error.message);
      }

      throw error;
    } finally {
      setIsLoading(false);
      
      // Reset progress after a delay
      setTimeout(() => {
        setProgress(0);
      }, 300);
    }
  }, [action, options]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setProgress(0);
    setError(null);
    setData(null);
  }, []);

  return {
    execute,
    reset,
    isLoading,
    progress,
    error,
    data,
  };
}