import "server-only";

import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api/config";
import { accessCookieName } from "@/lib/auth/session";
import type { ChannelsResponse, ClientStats, Contact, ContactDetailResponse, ConversationDetailResponse, PaginatedConversations } from "@/features/clients/types/crm";

async function get<T>(path: string): Promise<T> {
  const apiUrl = getApiUrl(); const token = (await cookies()).get(accessCookieName)?.value;
  if (!apiUrl || !token) throw new Error("No hay una sesión válida.");
  const response = await fetch(`${apiUrl}${path}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!response.ok) throw new Error(`La API no pudo completar la solicitud (HTTP ${response.status}).`);
  return response.json() as Promise<T>;
}

export const crmServer = { getContacts: () => get<Contact[]>("/api/crm/contacts/"), getClientStats: () => get<ClientStats>("/api/crm/clients/stats/"), getContactDetail: (id: number) => get<ContactDetailResponse>(`/api/crm/contacts/${id}/detail/`), getConversations: () => get<PaginatedConversations>("/api/crm/conversations/"), getConversationById: (id: number) => get<ConversationDetailResponse>(`/api/crm/conversations/${id}/`), getChannels: () => get<ChannelsResponse>("/api/crm/channels/") };
