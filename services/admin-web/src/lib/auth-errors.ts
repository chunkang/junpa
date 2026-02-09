const AUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: "Unable to start sign-in. Please try again.",
  OAuthCallback: "Authentication failed. Please try signing in again.",
  OAuthAccountNotLinked:
    "This account is already linked to another sign-in method.",
  SessionRequired: "Please sign in to access this page.",
  RefreshTokenExpired: "Your session has expired. Please sign in again.",
  AccessDenied:
    "Access denied. You do not have permission to access this resource.",
  Default: "An unexpected error occurred. Please try again.",
};

export function getAuthErrorMessage(code?: string | null): string {
  if (!code) return AUTH_ERROR_MESSAGES.Default;
  return AUTH_ERROR_MESSAGES[code] ?? AUTH_ERROR_MESSAGES.Default;
}
