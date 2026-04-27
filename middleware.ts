import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminToken } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("cosless_admin_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/account", request.url));
  }

  try {
    await verifyAdminToken(token);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/account", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};