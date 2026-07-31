"use client";
import { Button } from "@/components/ui/button";
export default function Error({ reset }: { reset: () => void }) { return <main className="flex min-h-screen items-center justify-center p-6 text-center"><div><h1 className="text-xl font-semibold">No pudimos cargar los canales.</h1><Button className="mt-4" onClick={reset}>Reintentar</Button></div></main>; }
