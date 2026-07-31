import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { ContactDetailScreen } from "@/features/clients/components/contact-detail-screen";
import { crmServer } from "@/features/crm/services/server";
import { hasValidAccessSession } from "@/lib/auth/session";

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) { if (!(await hasValidAccessSession())) redirect("/login"); const { id } = await params; if (!/^\d+$/.test(id)) notFound(); let detail; try { detail = await crmServer.getContactDetail(Number(id)); } catch { notFound(); } return <AdminShell><ContactDetailScreen detail={detail}/></AdminShell>; }
