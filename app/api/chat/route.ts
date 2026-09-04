import { NextRequest, NextResponse } from "next/server";

import { accessCookieName } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin)
    return NextResponse.json({ message: "Solicitud no permitida." }, { status: 403 });
  if (!request.cookies.get(accessCookieName)?.value)
    return NextResponse.json({ message: "Sesión no disponible." }, { status: 401 });

  const webhook = process.env.N8N_PSICOTIPS_CHAT_WEBHOOK;
  if (!webhook) return NextResponse.json({ message: "El chatbot no está configurado." }, { status: 503 });
  try {
    const { chatInput, sessionId } = await request.json();
    if (typeof chatInput !== "string" || !chatInput.trim() || typeof sessionId !== "string" || !sessionId.trim())
      return NextResponse.json({ message: "El mensaje y la sesión son obligatorios." }, { status: 400 });
    const response = await fetch(webhook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chatInput: chatInput.trim(), sessionId }), cache: "no-store" });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return NextResponse.json({ message: result.message ?? result.error ?? "El asistente no pudo responder." }, { status: response.status });
    if (typeof result.output !== "string") return NextResponse.json({ message: "El asistente devolvió una respuesta inválida." }, { status: 502 });
    return NextResponse.json({ output: result.output });
  } catch {
    return NextResponse.json({ message: "No fue posible conectar con el asistente." }, { status: 503 });
  }
}
