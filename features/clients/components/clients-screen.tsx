"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FileText, MessageCircle, Search, UserCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ClientStats, Contact } from "../types/crm";
import { formatDate } from "../utils";
import { ClientAvatar } from "./client-avatar";
import { CreateClientDialog } from "./create-client-dialog";

export function ClientsScreen({ contacts, stats }: { contacts: Contact[]; stats: ClientStats | null }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => { const term = search.trim().toLocaleLowerCase(); return contacts.filter((contact) => !term || [contact.name, contact.email, contact.phone].filter(Boolean).join(" ").toLocaleLowerCase().includes(term)); }, [contacts, search]);
  const indicators = [["Total de clientes", stats?.total_clients ?? "—", Users], ["Clientes activos", stats?.active_clients ?? "—", UserCheck], ["Conversaciones abiertas", stats?.open_conversations ?? "—", MessageCircle], ["Propuestas enviadas", stats?.proposals_sent ?? "—", FileText]];
  return <section className="space-y-6">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="font-[family-name:var(--font-poppins)] text-3xl font-semibold text-[#1E1E21]">Clientes</h1><p className="mt-1 text-sm text-[#5E5E66]">Consulta los contactos registrados y su información comercial.</p></div><CreateClientDialog /></header>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{indicators.map(([label, value, Icon]) => { const I = Icon as typeof Users; return <Card key={label as string} className="border-[#D8D8DC] shadow-sm"><CardContent className="flex items-start justify-between p-4"><div><p className="text-sm text-[#5E5E66]">{label as string}</p><p className="mt-1 font-[family-name:var(--font-poppins)] text-2xl font-semibold">{value as string | number}</p></div><I className="size-5 text-[#8941E8]" /></CardContent></Card>; })}</div>
    {!stats && <p className="text-sm text-[#5E5E66]">Los indicadores no están disponibles temporalmente.</p>}
    <label className="relative block"><span className="sr-only">Buscar clientes</span><Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#5E5E66]"/><Input value={search} onChange={(event) => setSearch(event.target.value)} className="h-10 pl-9" placeholder="Buscar por nombre, correo o teléfono..." /></label>
    {filtered.length ? <><div className="hidden overflow-hidden rounded-xl border border-[#D8D8DC] bg-white shadow-sm md:block"><Table><TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Correo</TableHead><TableHead>Teléfono</TableHead><TableHead>Registro</TableHead><TableHead><span className="sr-only">Acción</span></TableHead></TableRow></TableHeader><TableBody>{filtered.map((contact) => <TableRow key={contact.id}><TableCell><div className="flex items-center gap-3"><ClientAvatar name={contact.name}/><span className="font-medium">{contact.name || "No registrado"}</span></div></TableCell><TableCell>{contact.email || "No registrado"}</TableCell><TableCell>{contact.phone || "No registrado"}</TableCell><TableCell>{formatDate(contact.created_at)}</TableCell><TableCell><Button render={<Link href={`/clientes/${contact.id}`}/>} variant="outline" size="sm">Ver detalle</Button></TableCell></TableRow>)}</TableBody></Table></div><div className="grid gap-3 md:hidden">{filtered.map((contact) => <Card key={contact.id} className="border-[#D8D8DC]"><CardContent className="flex items-center gap-3 p-4"><ClientAvatar name={contact.name}/><div className="min-w-0 flex-1"><p className="font-medium">{contact.name || "No registrado"}</p><p className="truncate text-sm text-[#5E5E66]">{contact.email || contact.phone || "No registrado"}</p></div><Button render={<Link href={`/clientes/${contact.id}`}/>} size="sm">Ver</Button></CardContent></Card>)}</div></> : <Card className="border-[#D8D8DC]"><CardContent className="py-16 text-center"><Users className="mx-auto mb-3 size-8 text-[#8941E8]"/><p className="font-medium">{search ? "No encontramos clientes que coincidan con tu búsqueda." : "No hay clientes registrados."}</p></CardContent></Card>}
  </section>;
}
