import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { SettingsScreen } from "@/features/settings/components/settings-screen";
import { hasValidAccessSession } from "@/lib/auth/session";
export default async function ConfigurationPage() { if (!(await hasValidAccessSession())) redirect("/login"); return <AdminShell><SettingsScreen /></AdminShell>; }
