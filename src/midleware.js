import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // console.log("Middleware Role Check:", token?.role); // Uncomment to debug
        return token?.role === "admin";
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  // Matches /admin AND /admin/any-sub-path
  matcher: ["/admin", "/admin/:path*"],
};