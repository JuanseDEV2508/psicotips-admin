import { Badge } from "@/components/ui/badge";
import type { ClientStatus } from "../types";
import { statusLabel } from "../utils";
const styles: Record<ClientStatus, string> = { ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-800", INACTIVE: "border-slate-200 bg-slate-100 text-slate-700", LEAD: "border-violet-200 bg-violet-50 text-violet-800" };
export function ClientStatusBadge({ status }: { status: ClientStatus }) { return <Badge variant="outline" className={styles[status]}>{statusLabel[status]}</Badge> }
