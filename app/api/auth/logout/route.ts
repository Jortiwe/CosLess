import { NextResponse } from "next/server";

function clearAuthCookies(response: NextResponse) {
  response.cookies.set("cosless_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set("cosless_admin_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/?logout=1", request.url));
  clearAuthCookies(response);
  return response;
}

export async function POST() {
  const response = NextResponse.json(
    {
      success: true,
      message: "Sesión cerrada.",
      redirectTo: "/?logout=1",
    },
    { status: 200 }
  );

  clearAuthCookies(response);
  return response;
}