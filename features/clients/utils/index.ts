import type { Client, ClientStatus, ConversationStatus, ProposalStatus } from "../types";

export const normaliseText = (value: string) => value.trim().toLocaleLowerCase("es-CO").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
export const initials = (name: string) => name.split(" ").filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
export const dateFormat = new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", year: "numeric" });
export const dateTimeFormat = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" });
export const moneyFormat = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
export const formatDate = (date: string | null, withTime = false) => date ? (withTime ? dateTimeFormat : dateFormat).format(new Date(date)) : "Sin información";
export const formatMoney = (value: number | null) => value === null ? "Sin información" : moneyFormat.format(value);
export const display = (value: string | number | null | undefined) => value === null || value === undefined || value === "" ? "Sin información" : value;
export const statusLabel: Record<ClientStatus, string> = { ACTIVE: "Activo", INACTIVE: "Inactivo", LEAD: "Potencial" };
export const conversationLabel: Record<ConversationStatus, string> = { NEW: "Nuevo", IN_CONVERSATION: "En conversación", INFORMATION_PENDING: "Información pendiente", READY_FOR_REQUIREMENT: "Listo para requerimiento", REQUIREMENT_REVIEW: "Requerimiento en revisión", READY_FOR_PROPOSAL: "Listo para propuesta", PROPOSAL_DRAFT: "Propuesta en borrador", PROPOSAL_REVIEW: "Propuesta en revisión", PROPOSAL_SENT: "Propuesta enviada", WON: "Ganado", LOST: "Perdido", CLOSED: "Cerrado" };
export const proposalLabel: Record<ProposalStatus, string> = { DRAFT: "Borrador", IN_REVIEW: "En revisión", APPROVED: "Aprobada", SENT: "Enviada", VIEWED: "Vista", ACCEPTED: "Aceptada", REJECTED: "Rechazada", EXPIRED: "Vencida" };
export function hasOpenConversation(client: Client) { return client.conversations.some((item) => !["WON", "LOST", "CLOSED"].includes(item.status)); }
export function matchesClient(client: Client, search: string) { const term = normaliseText(search); if (!term) return true; return [client.contact.name, client.contact.email, client.contact.phone, client.company?.name, client.company?.city, client.company?.nit].some((value) => normaliseText(value ?? "").includes(term)); }
export function clientStats(clients: Client[]) { return { total: clients.length, active: clients.filter((c) => c.status === "ACTIVE").length, open: clients.filter(hasOpenConversation).length, proposals: clients.filter((c) => c.proposals.length > 0).length }; }
