import { NextRequest, NextResponse } from "next/server";

import { getApiUrl } from "@/lib/api/config";
import { accessCookieName } from "@/lib/auth/session";

const allowed = [
  /^config\/$/,
  /^users\/(?:$|me\/(?:password\/|preferences\/)?$|\d+\/$)/,
  /^ai\/knowledge\/(?:documents\/(?:$|\d+\/(?:content\/|chunks\/|reindex\/)?$)|reindex-pending\/|config\/|stats\/)$/,
  /^ai\/(?:categories\/|tags\/|search\/)$/,
  /^dashboard\/(?:summary\/|conversations\/|contacts\/|funnel\/|timeseries\/|pending\/|activity\/|agents\/)$/,
];

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const pathname = `${path.join("/")}/`;
  if (!allowed.some((pattern) => pattern.test(pathname)))
    return NextResponse.json({ message: "Ruta no permitida." }, { status: 404 });

  if (request.method !== "GET") {
    const origin = request.headers.get("origin");
    if (origin && origin !== request.nextUrl.origin)
      return NextResponse.json({ message: "Solicitud no permitida." }, { status: 403 });
  }

  const apiUrl = getApiUrl();
  const token = request.cookies.get(accessCookieName)?.value;
  if (!apiUrl || !token)
    return NextResponse.json({ message: "Sesión no disponible." }, { status: 401 });

  try {
    const contentType = request.headers.get("content-type");
    const body = request.method === "GET" ? undefined : await request.arrayBuffer();
    const backend = await fetch(`${apiUrl}/api/${pathname}${request.nextUrl.search}`, {
      method: request.method,
      headers: { Authorization: `Bearer ${token}`, ...(contentType ? { "Content-Type": contentType } : {}) },
      body: body && body.byteLength ? body : undefined,
      cache: "no-store",
    });
    return new NextResponse(await backend.arrayBuffer(), {
      status: backend.status,
      headers: { "Content-Type": backend.headers.get("content-type") ?? "application/json", "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ message: "No fue posible conectar con el servidor." }, { status: 503 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
export const DELETE = proxy;
