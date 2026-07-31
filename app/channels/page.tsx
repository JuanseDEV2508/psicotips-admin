import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { ChannelsScreen } from "@/features/channels/components/channels-screen";
import { crmServer } from "@/features/crm/services/server";
import { hasValidAccessSession } from "@/lib/auth/session";

export default async function ChannelsPage() { if (!(await hasValidAccessSession())) redirect("/login"); const channels = await crmServer.getChannels(); return <AdminShell><ChannelsScreen response={channels}/></AdminShell>; }
