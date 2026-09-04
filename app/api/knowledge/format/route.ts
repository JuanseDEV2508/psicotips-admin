import { NextRequest, NextResponse } from "next/server";

import { accessCookieName } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin)
    return NextResponse.json({ message: "Solicitud no permitida." }, { status: 403 });
  if (!request.cookies.get(accessCookieName)?.value)
    return NextResponse.json({ message: "Sesión no disponible." }, { status: 401 });

  const webhook = process.env.N8N_RAG_MD_FORMATTER_WEBHOOK;
  if (!webhook)
    return NextResponse.json({ message: "No está configurado el webhook de formato RAG." }, { status: 503 });
  try {
    const body = await request.json();
    if (typeof body.raw_content !== "string" || body.raw_content.trim().length < 20)
      return NextResponse.json({ error: "raw_content es obligatorio y debe tener al menos 20 caracteres." }, { status: 400 });
    const response = await fetch(webhook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store" });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return NextResponse.json(result, { status: response.status });
    if (typeof result.markdown !== "string" || !result.markdown.startsWith("---"))
      return NextResponse.json({ message: "El formateador no devolvió Markdown válido con frontmatter." }, { status: 502 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ message: "No fue posible conectar con el formateador RAG." }, { status: 503 });
  }
}
