// Error mapping and normalization utilities
// Transforms backend errors into user-friendly messages

import { ApiException } from './api';
import { 
  AuthError, 
  ValidationError
} from './auth-service';

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// User-friendly error interface
export interface UserFriendlyError {
  title: string;
  message: string;
  severity: ErrorSeverity;
  code: string;
  field?: string; // For validation errors
  suggestions?: string[]; // Helpful suggestions for the user
  retryable: boolean; // Whether the user can retry the action
}

// Error code mappings to user-friendly messages
const ERROR_MAPPINGS: Record<string, Omit<UserFriendlyError, 'code'>> = {
  // Network errors
  'NETWORK_ERROR': {
    title: 'Connection Problem',
    message: 'Unable to connect to the server. Please check your internet connection and try again.',
    severity: ErrorSeverity.MEDIUM,
    suggestions: [
      'Check your internet connection',
      'Try refreshing the page',
      'Contact support if the problem persists'
    ],
    retryable: true
  },

  // Authentication errors
  'UNAUTHORIZED': {
    title: 'Authentication Failed',
    message: 'Your login credentials are incorrect. Please check your email and password.',
    severity: ErrorSeverity.HIGH,
    suggestions: [
      'Verify your email address is correct',
      'Check your password for typos',
      'Try resetting your password'
    ],
    retryable: true
  },

  'INVALID_CREDENTIALS': {
    title: 'Invalid Login',
    message: 'The email or password you entered is incorrect.',
    severity: ErrorSeverity.HIGH,
    suggestions: [
      'Double-check your email address',
      'Verify your password is correct',
      'Use the "Forgot Password" option if needed'
    ],
    retryable: true
  },

  'EMAIL_NOT_CONFIRMED': {
    title: 'Email Not Confirmed',
    message: 'Please check your email and click the confirmation link before logging in.',
    severity: ErrorSeverity.MEDIUM,
    suggestions: [
      'Check your email inbox',
      'Look in your spam folder',
      'Request a new confirmation email'
    ],
    retryable: true
  },

  // Registration errors
  'EMAIL_ALREADY_EXISTS': {
    title: 'Account Already Exists',
    message: 'An account with this email address already exists. Please try logging in instead.',
    severity: ErrorSeverity.MEDIUM,
    suggestions: [
      'Try logging in with this email',
      'Use a different email address',
      'Reset your password if you forgot it'
    ],
    retryable: true
  },

  'WEAK_PASSWORD': {
    title: 'Password Too Weak',
    message: 'Your password does not meet the security requirements.',
    severity: ErrorSeverity.MEDIUM,
    suggestions: [
      'Use at least 8 characters',
      'Include uppercase and lowercase letters',
      'Add numbers and special characters'
    ],
    retryable: true
  },

  // Validation errors
  'INVALID_EMAIL': {
    title: 'Invalid Email Address',
    message: 'Please enter a valid email address.',
    severity: ErrorSeverity.LOW,
    suggestions: [
      'Check for typos in your email',
      'Make sure you include @ and domain',
      'Try a different email format'
    ],
    retryable: true
  },

  'REQUIRED_FIELD': {
    title: 'Required Information Missing',
    message: 'Please fill in all required fields.',
    severity: ErrorSeverity.LOW,
    suggestions: [
      'Complete all marked fields',
      'Check for any empty inputs',
      'Review the form requirements'
    ],
    retryable: true
  },

  // Server errors
  'SERVER_ERROR': {
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again in a few moments.',
    severity: ErrorSeverity.HIGH,
    suggestions: [
      'Wait a few minutes and try again',
      'Refresh the page',
      'Contact support if the problem continues'
    ],
    retryable: true
  },

  'SERVICE_UNAVAILABLE': {
    title: 'Service Temporarily Unavailable',
    message: 'Our service is temporarily down for maintenance. Please try again later.',
    severity: ErrorSeverity.HIGH,
    suggestions: [
      'Check our status page',
      'Try again in a few hours',
      'Follow us for updates'
    ],
    retryable: true
  },

  // Generic fallbacks
  'UNKNOWN_ERROR': {
    title: 'Unexpected Error',
    message: 'Something unexpected happened. Please try again or contact support.',
    severity: ErrorSeverity.MEDIUM,
    suggestions: [
      'Try the action again',
      'Refresh the page',
      'Contact support if the problem persists'
    ],
    retryable: true
  }
};

// HTTP status code to error code mapping
const HTTP_STATUS_MAPPINGS: Record<number, string> = {
  400: 'VALIDATION_ERROR',
  401: 'UNAUTHORIZED',
  403: 'UNAUTHORIZED',
  404: 'NOT_FOUND',
  409: 'EMAIL_ALREADY_EXISTS',
  422: 'VALIDATION_ERROR',
  429: 'RATE_LIMITED',
  500: 'SERVER_ERROR',
  502: 'SERVICE_UNAVAILABLE',
  503: 'SERVICE_UNAVAILABLE',
  504: 'SERVICE_UNAVAILABLE'
};

// Field-specific error messages
const FIELD_ERROR_MAPPINGS: Record<string, string> = {
  'email': 'Please enter a valid email address',
  'password': 'Please enter a secure password',
  'confirmPassword': 'Passwords do not match',
  'name': 'Please enter your name',
  'username': 'Please enter a valid username'
};

// Main error mapping function
export function mapErrorToUserFriendly(error: unknown, context?: string): UserFriendlyError {
  // Handle ApiException (from backend)
  if (error instanceof ApiException) {
    return mapApiException(error, context);
  }

  // Handle AuthError types
  if (error instanceof AuthError) {
    return mapAuthError(error, context);
  }

  // Handle generic Error
  if (error instanceof Error) {
    return mapGenericError(error, context);
  }

  // Fallback for unknown error types
  return {
    code: 'UNKNOWN_ERROR',
    ...ERROR_MAPPINGS['UNKNOWN_ERROR']
  };
}

// Map ApiException to user-friendly error
function mapApiException(error: ApiException, _context?: string): UserFriendlyError {
  const errorCode = HTTP_STATUS_MAPPINGS[error.statusCode] || 'UNKNOWN_ERROR';
  const baseError = ERROR_MAPPINGS[errorCode] || ERROR_MAPPINGS['UNKNOWN_ERROR'];

  // Extract field name from message if it's a validation error
  let field: string | undefined;
  if (error.statusCode === 400 || error.statusCode === 422) {
    field = extractFieldFromMessage(error.message);
  }

  return {
    code: errorCode,
    title: baseError.title,
    message: enhanceMessage(baseError.message, error.message, field),
    severity: baseError.severity,
    suggestions: baseError.suggestions,
    retryable: baseError.retryable,
    field
  };
}

// Map AuthError to user-friendly error
function mapAuthError(error: AuthError, _context?: string): UserFriendlyError {
  const baseError = ERROR_MAPPINGS[error.code] || ERROR_MAPPINGS['UNKNOWN_ERROR'];

  return {
    code: error.code,
    title: baseError.title,
    message: enhanceMessage(baseError.message, error.message),
    severity: baseError.severity,
    suggestions: baseError.suggestions,
    retryable: baseError.retryable,
    field: error instanceof ValidationError ? error.field : undefined
  };
}

// Map generic Error to user-friendly error
function mapGenericError(error: Error, _context?: string): UserFriendlyError {
  // Check for network-related errors
  if (error.message.includes('fetch') || error.message.includes('network')) {
    return {
      code: 'NETWORK_ERROR',
      ...ERROR_MAPPINGS['NETWORK_ERROR']
    };
  }

  // Check for timeout errors
  if (error.message.includes('timeout')) {
    return {
      code: 'TIMEOUT_ERROR',
      title: 'Request Timeout',
      message: 'The request took too long to complete. Please try again.',
      severity: ErrorSeverity.MEDIUM,
      suggestions: [
        'Check your internet connection',
        'Try again in a moment',
        'Contact support if the problem persists'
      ],
      retryable: true
    };
  }

  // Default to unknown error
  return {
    code: 'UNKNOWN_ERROR',
    ...ERROR_MAPPINGS['UNKNOWN_ERROR']
  };
}

// Extract field name from error message
function extractFieldFromMessage(message: string): string | undefined {
  const fieldMatch = message.match(/(\w+)\s+(is|must be|should be)/i);
  return fieldMatch ? fieldMatch[1] : undefined;
}

// Enhance message with additional context
function enhanceMessage(baseMessage: string, originalMessage: string, field?: string): string {
  if (field && FIELD_ERROR_MAPPINGS[field]) {
    return FIELD_ERROR_MAPPINGS[field];
  }

  // If the original message is user-friendly, use it
  if (originalMessage && originalMessage.length > 10 && !originalMessage.includes('Error:')) {
    return originalMessage;
  }

  return baseMessage;
}

// Get error severity color for UI
export function getErrorSeverityColor(severity: ErrorSeverity): string {
  switch (severity) {
    case ErrorSeverity.LOW:
      return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    case ErrorSeverity.MEDIUM:
      return 'text-orange-700 bg-orange-50 border-orange-200';
    case ErrorSeverity.HIGH:
      return 'text-red-700 bg-red-50 border-red-200';
    case ErrorSeverity.CRITICAL:
      return 'text-red-800 bg-red-100 border-red-300';
    default:
      return 'text-gray-700 bg-gray-50 border-gray-200';
  }
}

// Get error icon based on severity
export function getErrorIcon(severity: ErrorSeverity): string {
  switch (severity) {
    case ErrorSeverity.LOW:
      return '⚠️';
    case ErrorSeverity.MEDIUM:
      return '⚠️';
    case ErrorSeverity.HIGH:
      return '❌';
    case ErrorSeverity.CRITICAL:
      return '🚨';
    default:
      return 'ℹ️';
  }
}
