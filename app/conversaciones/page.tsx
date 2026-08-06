import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { ConversationsScreen } from "@/features/conversations/components/conversations-screen";
import { crmServer } from "@/features/crm/services/server";
import { hasValidAccessSession } from "@/lib/auth/session";

export default async function ConversationsPage() { if (!(await hasValidAccessSession())) redirect("/login"); const initialData = await crmServer.getConversations(); return <AdminShell><ConversationsScreen initialData={initialData}/></AdminShell>; }
