import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { ClientsScreen } from "@/features/clients/components/clients-screen";
import { crmServer } from "@/features/crm/services/server";
import { hasValidAccessSession } from "@/lib/auth/session";
export default async function ClientsPage() { if (!(await hasValidAccessSession())) redirect("/login"); const [contacts, statsResult] = await Promise.all([crmServer.getContacts(), crmServer.getClientStats().catch(() => null)]); return <AdminShell><ClientsScreen contacts={contacts} stats={statsResult}/></AdminShell> }
