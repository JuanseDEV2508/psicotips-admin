import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { hasValidAccessSession } from "@/lib/auth/session";

export default async function DashboardPage() {
  if (!(await hasValidAccessSession())) {
    redirect("/login");
  }

  return <AdminShell><section className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center"><Card className="w-full border-[#D8D8DC] text-center shadow-sm"><CardContent className="p-10"><h1 className="font-[family-name:var(--font-poppins)] text-2xl font-semibold text-[#1E1E21]">KPIs en construcción</h1><p className="mt-3 text-sm text-[#5E5E66]">El dashboard estará disponible próximamente. Por ahora puedes consultar los módulos habilitados desde el menú lateral.</p></CardContent></Card></section></AdminShell>;
}
