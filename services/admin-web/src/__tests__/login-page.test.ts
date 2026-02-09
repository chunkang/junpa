import { describe, it, expect } from 'vitest';
import { getAuthErrorMessage } from '@/lib/auth-errors';

describe('Login Page Error Display', () => {
  it('should resolve known error codes to specific messages', () => {
    // Verifies that known error codes map to specific user-friendly messages
    const knownCodes = [
      'OAuthSignin',
      'OAuthCallback',
      'OAuthAccountNotLinked',
      'SessionRequired',
      'RefreshTokenExpired',
      'AccessDenied',
    ];

    for (const code of knownCodes) {
      const message = getAuthErrorMessage(code);
      expect(message).toBeTruthy();
      expect(message).not.toBe('');
      // Known codes should NOT return the default message
      expect(message).not.toBe(getAuthErrorMessage('__definitely_unknown__'));
    }
  });

  it('should fall back to default message for unknown error codes', () => {
    const defaultMessage = getAuthErrorMessage(undefined);
    expect(getAuthErrorMessage('UnknownErrorCode')).toBe(defaultMessage);
    expect(getAuthErrorMessage('AnotherRandomCode')).toBe(defaultMessage);
  });

  it('should return default message when no error code is provided', () => {
    const message = getAuthErrorMessage(undefined);
    expect(message).toBe('An unexpected error occurred. Please try again.');
  });
});
