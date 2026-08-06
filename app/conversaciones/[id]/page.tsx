import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { ConversationThreadScreen } from "@/features/conversations/components/conversation-thread-screen";
import { crmServer } from "@/features/crm/services/server";
import { hasValidAccessSession } from "@/lib/auth/session";

async function loadConversation(id: number) { try { return await crmServer.getConversationById(id); } catch { return null; } }
export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) { if (!(await hasValidAccessSession())) redirect("/login"); const { id } = await params; if (!/^\d+$/.test(id)) notFound(); const detail = await loadConversation(Number(id)); if (!detail) notFound(); return <AdminShell><ConversationThreadScreen detail={detail}/></AdminShell>; }
