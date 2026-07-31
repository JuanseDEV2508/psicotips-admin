import "server-only";

import { cookies } from "next/headers";

import { getApiUrl } from "@/lib/api/config";
import { accessCookieName } from "@/lib/auth/session";
import type { Client, ClientStats, ClientsRepository, CompanyListItem, PaginatedResponse } from "../types";

/**
 * Placeholder deliberately kept empty until the CRM and commercial response
 * contracts are available. UI components only depend on ClientsRepository.
 */
type CompaniesResponse = { count: number; next: string | null; previous: string | null; results: Array<Record<string, unknown>> };

function asString(value: unknown): string | null { return typeof value === "string" ? value : null; }
function asNumber(value: unknown): number | null { return typeof value === "number" ? value : null; }
function asBoolean(value: unknown): boolean { return value === true; }
function companyFromApi(value: Record<string, unknown>): CompanyListItem {
  const id = asNumber(value.id);
  const name = asString(value.name);
  const createdAt = asString(value.created_at);
  if (id === null || !name || !createdAt) throw new Error("La API devolvió una empresa con un formato inválido.");
  return { id, name, email: asString(value.email), phone: asString(value.phone), nit: asString(value.nit), city: asString(value.city), numberOfParticipants: asNumber(value.number_of_participants), description: asString(value.description), address: asString(value.address), howTheyFoundUs: asString(value.how_they_found_us), isActive: asBoolean(value.is_active), proposalDate: asString(value.proposal_date), createdAt };
}

async function crmFetch(path: string): Promise<Response> {
  const apiUrl = getApiUrl();
  const accessToken = (await cookies()).get(accessCookieName)?.value;
  if (!apiUrl || !accessToken) throw new Error("No hay una sesión válida para consultar clientes.");
  return fetch(`${apiUrl}${path}`, { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" });
}

class CrmClientsRepository implements ClientsRepository {
  async getClients(params?: { page?: number; pageSize?: number }): Promise<PaginatedResponse<CompanyListItem>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.pageSize) searchParams.set("page_size", String(params.pageSize));
    const response = await crmFetch(`/api/crm/companies/${searchParams.size ? `?${searchParams}` : ""}`);
    if (!response.ok) throw new Error("No fue posible cargar el listado de clientes.");
    const body: unknown = await response.json();
    if (Array.isArray(body)) {
      return { count: body.length, next: null, previous: null, results: body.map((item) => companyFromApi(item as Record<string, unknown>)) };
    }
    if (!body || typeof body !== "object" || !Array.isArray((body as CompaniesResponse).results) || typeof (body as CompaniesResponse).count !== "number") throw new Error("La API devolvió un listado de clientes inválido.");
    const data = body as CompaniesResponse;
    return { count: data.count, next: typeof data.next === "string" ? data.next : null, previous: typeof data.previous === "string" ? data.previous : null, results: data.results.map(companyFromApi) };
  }

  async getClientStats(): Promise<ClientStats> {
    const response = await crmFetch("/api/crm/clients/stats/");
    if (!response.ok) {
      throw new Error(`No fue posible cargar los indicadores de clientes (HTTP ${response.status}).`);
    }
    const body: unknown = await response.json();
    if (!body || typeof body !== "object") throw new Error("La API devolvió indicadores de clientes inválidos.");
    const data = body as Record<string, unknown>;
    const totalClients = asNumber(data.total_clients); const activeClients = asNumber(data.active_clients); const openConversations = asNumber(data.open_conversations); const proposalsSent = asNumber(data.proposals_sent);
    if ([totalClients, activeClients, openConversations, proposalsSent].some((value) => value === null)) throw new Error("La API devolvió indicadores de clientes inválidos.");
    return { totalClients: totalClients!, activeClients: activeClients!, openConversations: openConversations!, proposalsSent: proposalsSent! };
  }

  async getClientById(): Promise<Client | null> {
    return null;
  }
}
export const clientsRepository: ClientsRepository = new CrmClientsRepository();
