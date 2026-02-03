interface TokenRefreshResult {
  accessToken?: string
  expiresAt?: number
  error?: string
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<TokenRefreshResult> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })

    if (!response.ok) {
      return { error: 'RefreshAccessTokenError' }
    }

    const data = await response.json()
    return {
      accessToken: data.access_token,
      expiresAt: Math.floor(Date.now() / 1000) + data.expires_in,
    }
  } catch {
    return { error: 'RefreshAccessTokenError' }
  }
}

export function isTokenExpiringSoon(expiresAt: number): boolean {
  const fiveMinutes = 5 * 60
  return Math.floor(Date.now() / 1000) + fiveMinutes >= expiresAt
}
