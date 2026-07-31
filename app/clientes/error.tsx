"use client";
import { Button } from "@/components/ui/button";
export default function Error({ reset }: { error: Error; reset: () => void }) { return <main className="flex min-h-screen items-center justify-center p-6 text-center"><div><h1 className="font-[family-name:var(--font-poppins)] text-xl font-semibold">No pudimos cargar la información de los clientes.</h1><Button className="mt-4" onClick={reset}>Intentar nuevamente</Button></div></main> }
