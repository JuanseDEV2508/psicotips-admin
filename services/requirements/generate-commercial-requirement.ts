export interface GenerateCommercialRequirementParams {
  contactId: number | string;
  conversationId?: number | string;
}

export interface GenerateCommercialRequirementResponse {
  markdown: string;
  filename?: string;
  success?: boolean;
  message?: string;
  error?: string;
}

function isRequirementResponse(
  value: unknown,
): value is GenerateCommercialRequirementResponse {
  return typeof value === "object" && value !== null;
}

export async function generateCommercialRequirement({
  contactId,
  conversationId,
}: GenerateCommercialRequirementParams): Promise<GenerateCommercialRequirementResponse> {
  const response = await fetch("/api/commercial-requirements/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contact_id: contactId,
      ...(conversationId ? { conversation_id: conversationId } : {}),
    }),
  });
  let data: GenerateCommercialRequirementResponse;
  try {
    const parsed: unknown = await response.json();
    if (!isRequirementResponse(parsed)) throw new Error("Respuesta inválida.");
    data = parsed;
  } catch {
    throw new Error("El servicio respondió en un formato no válido.");
  }
  if (!response.ok)
    throw new Error(
      data.error ||
        data.message ||
        "No fue posible generar el requerimiento comercial.",
    );
  if (!data.markdown || typeof data.markdown !== "string")
    throw new Error("El servicio no devolvió el contenido Markdown.");
  return data;
}
