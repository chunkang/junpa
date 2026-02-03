import Google from 'next-auth/providers/google'
import type { NextAuthConfig } from 'next-auth'
import {
  refreshAccessToken,
  isTokenExpiringSoon,
} from './google/token-refresh'

export const authOptions: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            'openid email profile https://www.googleapis.com/auth/drive.file',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, account }) {
      // Initial sign-in: store tokens from account
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
        return token
      }

      // Token is still valid
      if (token.expiresAt && !isTokenExpiringSoon(token.expiresAt as number)) {
        return token
      }

      // Token expired or expiring soon: attempt refresh
      if (token.refreshToken) {
        const refreshed = await refreshAccessToken(
          token.refreshToken as string
        )
        if (refreshed.error) {
          return { ...token, error: 'RefreshAccessTokenError' }
        }
        return {
          ...token,
          accessToken: refreshed.accessToken,
          expiresAt: refreshed.expiresAt,
        }
      }

      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.error = token.error as string | undefined
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
}
