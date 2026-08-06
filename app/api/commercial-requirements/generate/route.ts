import { NextRequest, NextResponse } from "next/server";

const webhookUrl = process.env.N8N_GENERATE_REQUIREMENT_WEBHOOK;
function hasValue(value: unknown): value is number | string {
  return (
    (typeof value === "number" && Number.isFinite(value)) ||
    (typeof value === "string" && value.trim().length > 0)
  );
}
function getErrorMessage(data: unknown, fallback: string): string {
  if (typeof data !== "object" || data === null) return fallback;
  const { error, message } = data as Record<string, unknown>;
  return typeof error === "string" && error
    ? error
    : typeof message === "string" && message
      ? message
      : fallback;
}

export async function POST(request: NextRequest) {
  if (!webhookUrl)
    return NextResponse.json(
      { error: "No se configuró el webhook de generación." },
      { status: 500 },
    );
  try {
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null)
      return NextResponse.json(
        { error: "El cuerpo de la solicitud no es válido." },
        { status: 400 },
      );
    const { contact_id: contactId, conversation_id: conversationId } =
      body as Record<string, unknown>;
    if (!hasValue(contactId))
      return NextResponse.json(
        { error: "contact_id es obligatorio." },
        { status: 400 },
      );
    if (!hasValue(conversationId))
      return NextResponse.json(
        { error: "conversation_id es obligatorio." },
        { status: 400 },
      );
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contact_id: contactId,
        conversation_id: conversationId,
      }),
      cache: "no-store",
    });
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      return NextResponse.json(
        {
          error: "El servicio de generación respondió en un formato no válido.",
        },
        { status: 502 },
      );
    }
    if (!response.ok)
      return NextResponse.json(
        {
          error: getErrorMessage(data, "n8n no pudo generar el requerimiento."),
        },
        { status: response.status },
      );
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error interno al generar el requerimiento.",
      },
      { status: 500 },
    );
  }
}
