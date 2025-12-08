import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const path = req.nextUrl.pathname;

  // 1. Check if the route is protected (Admin Routes)
  if (path.startsWith("/admin")) {
    // Get the token (decodes the NextAuth JWT securely)
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    // Case A: User is NOT logged in
    if (!token) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", path); // Preserve the intended destination
      return NextResponse.redirect(url);
    }

    // Case B: User IS logged in, but NOT an Admin
    if (token.role !== "admin") {
      // Redirect to Home
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Allow access if checks pass
  return NextResponse.next();
}

export const config = {
  // Apply this middleware only to admin routes
  matcher: ["/admin", "/admin/:path*"],
};