"use client";

import { useState, useCallback } from 'react';
import { mapErrorToUserFriendly, UserFriendlyError } from './error-mapping';

// Hook for handling errors with user-friendly mapping
export function useErrorHandler() {
  const [error, setError] = useState<UserFriendlyError | null>(null);

  const handleError = useCallback((err: unknown, context?: string) => {
    const userFriendlyError = mapErrorToUserFriendly(err, context);
    setError(userFriendlyError);
    return userFriendlyError;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
    hasError: error !== null
  };
}

// Hook for async operations with error handling
export function useAsyncErrorHandler<T>() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<UserFriendlyError | null>(null);

  const execute = useCallback(async (
    asyncFunction: () => Promise<T>,
    options: {
      onSuccess?: (data: T) => void;
      onError?: (error: UserFriendlyError) => void;
      context?: string;
    } = {}
  ) => {
    const { onSuccess, onError, context } = options;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunction();
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const userFriendlyError = mapErrorToUserFriendly(err, context);
      setError(userFriendlyError);
      onError?.(userFriendlyError);
      throw userFriendlyError;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    execute,
    loading,
    data,
    error,
    reset,
    clearError: () => setError(null)
  };
}

// Hook for form error handling
export function useFormErrorHandler() {
  const [errors, setErrors] = useState<Record<string, UserFriendlyError>>({});
  const [globalError, setGlobalError] = useState<UserFriendlyError | null>(null);

  const setFieldError = useCallback((field: string, error: UserFriendlyError) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const setFieldErrorFromException = useCallback((field: string, err: unknown) => {
    const userFriendlyError = mapErrorToUserFriendly(err, `field:${field}`);
    setFieldError(field, userFriendlyError);
  }, [setFieldError]);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
    setGlobalError(null);
  }, []);

  const setGlobalErrorFromException = useCallback((err: unknown, context?: string) => {
    const userFriendlyError = mapErrorToUserFriendly(err, context);
    setGlobalError(userFriendlyError);
  }, []);

  const getFieldError = useCallback((field: string) => {
    return errors[field] || null;
  }, [errors]);

  const hasFieldError = useCallback((field: string) => {
    return field in errors;
  }, [errors]);

  const hasAnyErrors = Object.keys(errors).length > 0 || globalError !== null;

  return {
    errors,
    globalError,
    setFieldError,
    setFieldErrorFromException,
    clearFieldError,
    clearAllErrors,
    setGlobalErrorFromException,
    getFieldError,
    hasFieldError,
    hasAnyErrors
  };
}

// Hook for API error handling with retry logic
export function useApiErrorHandler() {
  const [error, setError] = useState<UserFriendlyError | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const handleError = useCallback((err: unknown, context?: string) => {
    const userFriendlyError = mapErrorToUserFriendly(err, context);
    setError(userFriendlyError);
    return userFriendlyError;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  const retry = useCallback((retryFunction: () => Promise<any>) => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      return retryFunction();
    }
    throw new Error('Maximum retry attempts reached');
  }, [retryCount, maxRetries]);

  const canRetry = retryCount < maxRetries && error?.retryable === true;

  return {
    error,
    handleError,
    clearError,
    retry,
    canRetry,
    retryCount,
    maxRetries
  };
}
