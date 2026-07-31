import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
export default function NotFound() { return <AdminShell><div className="mx-auto max-w-md py-24 text-center"><h1 className="font-[family-name:var(--font-poppins)] text-2xl font-semibold">Cliente no disponible</h1><p className="mt-3 text-[#5E5E66]">El cliente que buscas no existe o ya no está disponible.</p><Button render={<Link href="/clientes"/>} className="mt-6">Volver a Clientes</Button></div></AdminShell> }
