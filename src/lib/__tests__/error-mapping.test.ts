import { describe, it, expect } from 'vitest';
import { 
  mapErrorToUserFriendly, 
  getErrorSeverityColor, 
  getErrorIcon,
  ErrorSeverity 
} from '../error-mapping';
import { ApiException } from '../api';
import { UnauthorizedError, ValidationError, NetworkError } from '../auth-service';

describe('Error Mapping', () => {
  describe('mapErrorToUserFriendly', () => {
    it('should map ApiException with 401 status to UnauthorizedError', () => {
      const apiError = new ApiException(
        401,
        'Invalid credentials',
        '/v1/auth/login',
        'POST',
        '2023-01-01T00:00:00.000Z',
        'test-request-id'
      );

      const result = mapErrorToUserFriendly(apiError);

      expect(result.title).toBe('Authentication Failed');
      expect(result.message).toBe('Invalid credentials');
      expect(result.severity).toBe(ErrorSeverity.HIGH);
      expect(result.retryable).toBe(true);
      expect(result.suggestions).toContain('Verify your email address is correct');
    });

    it('should map ApiException with 400 status to ValidationError', () => {
      const apiError = new ApiException(
        400,
        'Invalid email format',
        '/v1/auth/register',
        'POST',
        '2023-01-01T00:00:00.000Z',
        'test-request-id'
      );

      const result = mapErrorToUserFriendly(apiError);

      expect(result.title).toBe('Required Information Missing');
      expect(result.severity).toBe(ErrorSeverity.LOW);
      expect(result.field).toBe('request');
    });

    it('should map ApiException with 409 status to ConflictError', () => {
      const apiError = new ApiException(
        409,
        'Email already registered',
        '/v1/auth/register',
        'POST',
        '2023-01-01T00:00:00.000Z',
        'test-request-id'
      );

      const result = mapErrorToUserFriendly(apiError);

      expect(result.title).toBe('Account Already Exists');
      expect(result.message).toBe('Email already registered');
      expect(result.severity).toBe(ErrorSeverity.MEDIUM);
      expect(result.suggestions).toContain('Try logging in with this email');
    });

    it('should map ApiException with 500 status to ServerError', () => {
      const apiError = new ApiException(
        500,
        'Internal server error',
        '/v1/auth/login',
        'POST',
        '2023-01-01T00:00:00.000Z',
        'test-request-id'
      );

      const result = mapErrorToUserFriendly(apiError);

      expect(result.title).toBe('Server Error');
      expect(result.severity).toBe(ErrorSeverity.HIGH);
      expect(result.retryable).toBe(true);
    });

    it('should map AuthError to user-friendly error', () => {
      const authError = new UnauthorizedError('Invalid credentials');

      const result = mapErrorToUserFriendly(authError);

      expect(result.title).toBe('Authentication Failed');
      expect(result.message).toBe('Invalid credentials');
      expect(result.severity).toBe(ErrorSeverity.HIGH);
      expect(result.code).toBe('UNAUTHORIZED');
    });

    it('should map ValidationError with field to user-friendly error', () => {
      const validationError = new ValidationError('Email is required', 'email');

      const result = mapErrorToUserFriendly(validationError);

      expect(result.title).toBe('Required Information Missing');
      expect(result.message).toBe('Email is required');
      expect(result.field).toBe('email');
      expect(result.severity).toBe(ErrorSeverity.LOW);
    });

    it('should map NetworkError to user-friendly error', () => {
      const networkError = new NetworkError('Failed to fetch');

      const result = mapErrorToUserFriendly(networkError);

      expect(result.title).toBe('Connection Problem');
      expect(result.message).toBe('Failed to fetch');
      expect(result.severity).toBe(ErrorSeverity.MEDIUM);
      expect(result.suggestions).toContain('Check your internet connection');
    });

    it('should map generic Error with network-related message', () => {
      const genericError = new Error('Network request failed');

      const result = mapErrorToUserFriendly(genericError);

      expect(result.title).toBe('Connection Problem');
      expect(result.severity).toBe(ErrorSeverity.MEDIUM);
    });

    it('should map generic Error with timeout message', () => {
      const timeoutError = new Error('Request timeout');

      const result = mapErrorToUserFriendly(timeoutError);

      expect(result.title).toBe('Request Timeout');
      expect(result.severity).toBe(ErrorSeverity.MEDIUM);
      expect(result.retryable).toBe(true);
    });

    it('should map unknown error to fallback', () => {
      const unknownError = new Error('Some unknown error');

      const result = mapErrorToUserFriendly(unknownError);

      expect(result.title).toBe('Unexpected Error');
      expect(result.severity).toBe(ErrorSeverity.MEDIUM);
      expect(result.code).toBe('UNKNOWN_ERROR');
    });

    it('should handle non-Error objects', () => {
      const result = mapErrorToUserFriendly('Some string error');

      expect(result.title).toBe('Unexpected Error');
      expect(result.code).toBe('UNKNOWN_ERROR');
    });

    it('should extract field name from validation message', () => {
      const apiError = new ApiException(
        400,
        'email is required',
        '/v1/auth/register',
        'POST',
        '2023-01-01T00:00:00.000Z',
        'test-request-id'
      );

      const result = mapErrorToUserFriendly(apiError);

      expect(result.field).toBe('email');
    });

    it('should use user-friendly message when available', () => {
      const apiError = new ApiException(
        400,
        'Please enter a valid email address',
        '/v1/auth/register',
        'POST',
        '2023-01-01T00:00:00.000Z',
        'test-request-id'
      );

      const result = mapErrorToUserFriendly(apiError);

      expect(result.message).toBe('Please enter a valid email address');
    });
  });

  describe('getErrorSeverityColor', () => {
    it('should return correct colors for each severity level', () => {
      expect(getErrorSeverityColor(ErrorSeverity.LOW))
        .toBe('text-yellow-700 bg-yellow-50 border-yellow-200');
      
      expect(getErrorSeverityColor(ErrorSeverity.MEDIUM))
        .toBe('text-orange-700 bg-orange-50 border-orange-200');
      
      expect(getErrorSeverityColor(ErrorSeverity.HIGH))
        .toBe('text-red-700 bg-red-50 border-red-200');
      
      expect(getErrorSeverityColor(ErrorSeverity.CRITICAL))
        .toBe('text-red-800 bg-red-100 border-red-300');
    });
  });

  describe('getErrorIcon', () => {
    it('should return correct icons for each severity level', () => {
      expect(getErrorIcon(ErrorSeverity.LOW)).toBe('⚠️');
      expect(getErrorIcon(ErrorSeverity.MEDIUM)).toBe('⚠️');
      expect(getErrorIcon(ErrorSeverity.HIGH)).toBe('❌');
      expect(getErrorIcon(ErrorSeverity.CRITICAL)).toBe('🚨');
    });
  });
});
