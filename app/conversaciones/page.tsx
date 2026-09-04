import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { ConversationsScreen } from "@/features/conversations/components/conversations-screen";
import { crmServer } from "@/features/crm/services/server";
import { hasValidAccessSession } from "@/lib/auth/session";

export default async function ConversationsPage({ searchParams }: { searchParams: Promise<{ state?: string; unanswered?: string }> }) { if (!(await hasValidAccessSession())) redirect("/login"); const filters = await searchParams; const query = new URLSearchParams(); if (["open", "closed", "to_start"].includes(filters.state ?? "")) query.set("state", filters.state!); if (["true", "false"].includes(filters.unanswered ?? "")) query.set("unanswered", filters.unanswered!); const initialData = await crmServer.getConversations(query.toString()); return <AdminShell><ConversationsScreen initialData={initialData}/></AdminShell>; }
