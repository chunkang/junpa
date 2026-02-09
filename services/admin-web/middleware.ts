import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;

  // Public routes that don't require auth
  const isAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isLoginPage = nextUrl.pathname === "/login";

  // Skip auth check for NextAuth routes
  if (isAuthRoute) {
    return addSecurityHeaders(NextResponse.next());
  }

  // Redirect authenticated users away from login
  if (isLoginPage && isAuthenticated) {
    return addSecurityHeaders(
      NextResponse.redirect(new URL("/dashboard", nextUrl))
    );
  }

  // Allow login page for unauthenticated users
  if (isLoginPage) {
    return addSecurityHeaders(NextResponse.next());
  }

  // Protect all other matched routes
  if (!isAuthenticated) {
    // API routes return 401 JSON
    if (nextUrl.pathname.startsWith("/api/")) {
      return addSecurityHeaders(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      );
    }
    // Page routes redirect to login with callbackUrl
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return addSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  return addSecurityHeaders(NextResponse.next());
});

export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/videos/:path*",
    "/playlists/:path*",
    "/settings/:path*",
    "/api/((?!auth).*)",
    "/login",
  ],
};
