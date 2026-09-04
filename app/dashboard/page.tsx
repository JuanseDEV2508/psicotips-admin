import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin-shell";
import { DashboardScreen } from "@/features/dashboard/components/dashboard-screen";
import { hasValidAccessSession } from "@/lib/auth/session";

export default async function DashboardPage() {
  if (!(await hasValidAccessSession())) {
    redirect("/login");
  }

  return <AdminShell><DashboardScreen /></AdminShell>;
}
