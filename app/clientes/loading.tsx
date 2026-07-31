import { AdminShell } from "@/components/admin-shell";
import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() { return <AdminShell><div className="space-y-6"><Skeleton className="h-20 w-full"/><div className="grid grid-cols-4 gap-3">{Array.from({length:4},(_,i)=><Skeleton key={i} className="h-28"/>)}</div><Skeleton className="h-96 w-full"/></div></AdminShell> }
