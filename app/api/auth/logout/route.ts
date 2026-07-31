import { NextRequest, NextResponse } from "next/server";

import { accessCookieName, refreshCookieName } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json(
      { message: "Solicitud no permitida." },
      { status: 403 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(accessCookieName);
  response.cookies.delete(refreshCookieName);
  return response;
}
