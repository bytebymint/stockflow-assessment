import { NextResponse } from "next/server";

import { auth } from "@/auth";

export const proxy = auth((request) => {
  const { pathname, search } = request.nextUrl;
  const user = request.auth?.user;
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isSupplierRoute =
    pathname === "/supplier" || pathname.startsWith("/supplier/");
  const isCustomerRoute =
    pathname === "/account" || pathname.startsWith("/account/");
  const isProtectedRoute =
    isAdminRoute ||
    isSupplierRoute ||
    isCustomerRoute ||
    pathname === "/ui-preview";

  if (!user && (isProtectedRoute || pathname === "/auth/continue")) {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = "/sign-in";
    signInUrl.search = "";

    if (isProtectedRoute) {
      signInUrl.searchParams.set("returnTo", `${pathname}${search}`);
    }

    return NextResponse.redirect(signInUrl);
  }

  if (!user) {
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/supplier/:path*",
    "/account/:path*",
    "/sign-in",
    "/register",
    "/auth/continue",
    "/ui-preview",
  ],
};
