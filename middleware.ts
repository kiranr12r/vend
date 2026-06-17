import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { isAllowed, UserRole } from "@/lib/rbac";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role as UserRole | undefined;

    if (!isAllowed(pathname, role)) {
      // Redirect to a "not authorised" page (or back to dashboard)
      const url = req.nextUrl.clone();
      url.pathname = "/unauthorised";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Let the middleware function above handle role checks;
      // here we only gate on "is the user logged in at all?"
      authorized({ token }) {
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/vendors/:path*",
    "/reports/:path*",
    "/admin/:path*",
  ],
};
