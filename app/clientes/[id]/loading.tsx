import { AdminShell } from "@/components/admin-shell";
import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() { return <AdminShell><div className="space-y-5"><Skeleton className="h-10 w-36"/><Skeleton className="h-36 w-full"/><Skeleton className="h-96 w-full"/></div></AdminShell> }
