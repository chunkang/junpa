import { describe, it, expect } from 'vitest';
import { getAuthErrorMessage } from '@/lib/auth-errors';

describe('getAuthErrorMessage', () => {
  it('should return correct message for OAuthSignin error', () => {
    expect(getAuthErrorMessage('OAuthSignin')).toBe(
      'Unable to start sign-in. Please try again.'
    );
  });

  it('should return correct message for OAuthCallback error', () => {
    expect(getAuthErrorMessage('OAuthCallback')).toBe(
      'Authentication failed. Please try signing in again.'
    );
  });

  it('should return correct message for OAuthAccountNotLinked error', () => {
    expect(getAuthErrorMessage('OAuthAccountNotLinked')).toBe(
      'This account is already linked to another sign-in method.'
    );
  });

  it('should return correct message for SessionRequired error', () => {
    expect(getAuthErrorMessage('SessionRequired')).toBe(
      'Please sign in to access this page.'
    );
  });

  it('should return correct message for RefreshTokenExpired error', () => {
    expect(getAuthErrorMessage('RefreshTokenExpired')).toBe(
      'Your session has expired. Please sign in again.'
    );
  });

  it('should return correct message for AccessDenied error', () => {
    expect(getAuthErrorMessage('AccessDenied')).toBe(
      'Access denied. You do not have permission to access this resource.'
    );
  });

  it('should return Default message for unknown error code', () => {
    expect(getAuthErrorMessage('SomeUnknownError')).toBe(
      'An unexpected error occurred. Please try again.'
    );
  });

  it('should return Default message for null', () => {
    expect(getAuthErrorMessage(null)).toBe(
      'An unexpected error occurred. Please try again.'
    );
  });

  it('should return Default message for undefined', () => {
    expect(getAuthErrorMessage(undefined)).toBe(
      'An unexpected error occurred. Please try again.'
    );
  });

  it('should return Default message for empty string', () => {
    expect(getAuthErrorMessage('')).toBe(
      'An unexpected error occurred. Please try again.'
    );
  });
});
