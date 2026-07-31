import { AdminShell } from "@/components/admin-shell";
import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() { return <AdminShell><div className="space-y-6"><Skeleton className="h-16 w-full"/><Skeleton className="h-28 w-full"/><Skeleton className="h-72 w-full"/></div></AdminShell>; }
