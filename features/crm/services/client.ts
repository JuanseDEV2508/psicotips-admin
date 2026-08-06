import type { ApiError, ContactConversationResponse, ConversationControlPayload, ConversationControlResponse, ConversationDetailResponse, LeadInformationPayload, LeadInformationResponse, LiveConversationResponse, PaginatedConversations, SendMessagePayload, SendMessageResponse } from "@/features/clients/types/crm";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/crm/${path}`, { ...init, headers: { ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers }, cache: "no-store" });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) { const message = body && typeof body === "object" && "detail" in body && typeof body.detail === "string" ? body.detail : body && typeof body === "object" && "error" in body && typeof body.error === "string" ? body.error : "No fue posible completar la solicitud."; throw { status: response.status, message, body } satisfies ApiError; }
  return body as T;
}

export const crmClient = {
  getConversation: (contactId: number, conversationId?: number) => request<ContactConversationResponse>(`contacts/${contactId}/conversation/${conversationId ? `?conversation_id=${conversationId}&include_internal=true&include_system=false` : "?include_internal=true&include_system=false"}`),
  getLiveConversation: (contactId: number, conversationId: number, after?: string | null) => request<LiveConversationResponse>(`contacts/${contactId}/conversation/live/?conversation_id=${conversationId}&include_internal=true&include_system=false${after ? `&after=${encodeURIComponent(after)}` : ""}`),
  sendMessage: (contactId: number, payload: SendMessagePayload) => request<SendMessageResponse>(`contacts/${contactId}/conversation/messages/`, { method: "POST", body: JSON.stringify(payload) }),
  updateControl: (contactId: number, payload: ConversationControlPayload) => request<ConversationControlResponse>(`contacts/${contactId}/conversation/control/`, { method: "POST", body: JSON.stringify(payload) }),
  getLeadInformation: (contactId: number, conversationId?: number) => request<LeadInformationResponse>(`contacts/${contactId}/lead-information/${conversationId ? `?conversation_id=${conversationId}` : ""}`),
  updateLeadInformation: (contactId: number, payload: LeadInformationPayload) => request<LeadInformationResponse>(`contacts/${contactId}/lead-information/`, { method: "PATCH", body: JSON.stringify(payload) }),
  getConversations: (query = "") => request<PaginatedConversations>(`conversations/${query ? `?${query}` : ""}`),
  getConversationById: (conversationId: number, includeSystem = false) => request<ConversationDetailResponse>(`conversations/${conversationId}/?include_internal=true&include_system=${includeSystem}`),
};
