import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { refreshAccessToken } from "./auth-refresh";

export { refreshAccessToken } from "./auth-refresh";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/drive.file",
            "https://www.googleapis.com/auth/drive.appdata",
          ].join(" "),
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }

      // If the token has a previous error, return it as-is
      if (token.error) {
        return token;
      }

      // Check if token is within 5 minutes of expiry and refresh if needed
      if (
        token.expiresAt &&
        Date.now() >= (token.expiresAt as number) * 1000 - 5 * 60 * 1000
      ) {
        return refreshAccessToken(token);
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      if (token.error) {
        session.error = token.error as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
