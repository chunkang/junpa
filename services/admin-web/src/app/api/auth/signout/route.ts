import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await auth();
    const accessToken = session?.accessToken;

    if (accessToken) {
      // Attempt to revoke the Google OAuth token
      try {
        await fetch(
          `https://oauth2.googleapis.com/revoke?token=${accessToken}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
      } catch (error) {
        // Log revocation failure but don't block logout
        console.error("Token revocation failed:", error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Signout error:", error);
    return NextResponse.json({ success: true }); // Always allow logout
  }
}
