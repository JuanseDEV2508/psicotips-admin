import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { KnowledgeScreen } from "@/features/knowledge/components/knowledge-screen";
import { hasValidAccessSession } from "@/lib/auth/session";

export default async function KnowledgePage() { if (!(await hasValidAccessSession())) redirect("/login"); return <AdminShell><KnowledgeScreen /></AdminShell>; }
