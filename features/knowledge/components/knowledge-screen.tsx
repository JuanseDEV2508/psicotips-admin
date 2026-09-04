"use client";

import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { AlertCircle, BookOpen, CheckCircle2, FileUp, Loader2, RefreshCw, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, formatRagMarkdown, type Document, type KnowledgeConfig } from "@/features/settings/services/api";

type Stats = { documents: number; indexed: number; pending: number; with_errors: number; chunks: number };
type Page = { results: Document[]; count: number };
type FormattedMarkdown = { filename?: string; title?: string; doc_type?: string; markdown: string };

export function KnowledgeScreen() {
  const [config, setConfig] = useState<KnowledgeConfig | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<string>("");
  const [query, setQuery] = useState("");
  const [docType, setDocType] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [knowledgeConfig, knowledgeStats, page, user] = await Promise.all([
        api<KnowledgeConfig>("ai/knowledge/config/"), api<Stats>("ai/knowledge/stats/"),
        api<Page>(`ai/knowledge/documents/?page_size=100${docType ? `&doc_type=${encodeURIComponent(docType)}` : ""}${query ? `&search=${encodeURIComponent(query)}` : ""}`),
        api<{ capabilities: string[] }>("users/me/"),
      ]);
      setConfig(knowledgeConfig); setStats(knowledgeStats); setDocuments(page.results); setCanManage(user.capabilities.includes("manage_knowledge"));
    } catch (error) { setNotice(error instanceof Error ? error.message : "No se pudo cargar el conocimiento."); }
    finally { setLoading(false); }
  }, [docType, query]);

  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true); setNotice("Preparando el documento con IA…");
    try {
      const raw_content = await file.text();
      const title = file.name.replace(/\.(md|markdown|txt)$/i, "").replaceAll("-", " ");
      const formatted = await formatRagMarkdown<FormattedMarkdown>({ raw_content, title });
      setNotice("Guardando e indexando el Markdown generado…");
      const document = await api<Document>("ai/knowledge/documents/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ filename: formatted.filename?.split("/").pop() ?? file.name, title: formatted.title ?? title, doc_type: formatted.doc_type ?? "workshop", content: formatted.markdown }) });
      setNotice(document.is_indexed ? "Documento subido e indexado correctamente." : `Documento subido, pendiente de indexar: ${document.indexing_error || "sin detalle"}`);
      await load();
    } catch (error) { setNotice(error instanceof Error ? error.message : "No se pudo subir el documento."); }
    finally { setUploading(false); event.target.value = ""; }
  }
  async function reindex(id: number) { setNotice("Reindexando documento…"); try { await api(`ai/knowledge/documents/${id}/reindex/`, { method: "POST" }); setNotice("Documento reindexado."); await load(); } catch (e) { setNotice(e instanceof Error ? e.message : "No se pudo reindexar."); } }
  async function remove(id: number) { if (!confirm("¿Retirar este documento del RAG? El archivo se conservará en Storage.")) return; try { await api(`ai/knowledge/documents/${id}/`, { method: "DELETE" }); setNotice("Documento retirado del RAG."); await load(); } catch (e) { setNotice(e instanceof Error ? e.message : "No se pudo retirar el documento."); } }

  return <section className="space-y-6">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="font-[family-name:var(--font-poppins)] text-3xl font-semibold">Conocimiento</h1><p className="mt-1 text-sm text-[#5E5E66]">Documentos que usa la IA para preparar propuestas y respuestas.</p></div>{canManage && <label><input className="sr-only" type="file" accept={config?.upload.allowed_extensions.join(",") ?? ".md,.markdown,.txt"} onChange={upload} disabled={uploading}/><Button render={<span />} disabled={uploading}>{uploading ? <Loader2 className="animate-spin"/> : <FileUp/>} {uploading ? "Indexando…" : "Subir documento"}</Button></label>}</header>
    {notice && <div className="flex items-start gap-2 rounded-lg border border-[#D8D8DC] bg-white p-3 text-sm"><AlertCircle className="mt-0.5 size-4 shrink-0 text-[#8941E8]"/>{notice}</div>}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[["Documentos", stats?.documents], ["Indexados", stats?.indexed], ["Pendientes", stats?.pending], ["Chunks", stats?.chunks]].map(([label, value]) => <Card className="border-[#D8D8DC]" key={label as string}><CardContent className="flex items-center justify-between p-4"><div><p className="text-sm text-[#5E5E66]">{label as string}</p><p className="mt-1 text-2xl font-semibold">{loading ? "—" : value as number}</p></div><BookOpen className="size-5 text-[#8941E8]"/></CardContent></Card>)}</div>
    <div className="flex flex-col gap-3 sm:flex-row"><label className="relative block flex-1"><span className="sr-only">Buscar documentos</span><Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#5E5E66]"/><Input className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && void load()} placeholder="Buscar por título o ruta..."/></label><select className="h-10 rounded-md border border-[#D8D8DC] bg-white px-3 text-sm" value={docType} onChange={(e) => setDocType(e.target.value)}><option value="">Todos los tipos</option>{config?.doc_types.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select><Button variant="outline" onClick={() => void load()}><RefreshCw className="size-4"/>Actualizar</Button></div>
    <div className="overflow-hidden rounded-xl border border-[#D8D8DC] bg-white shadow-sm"><Table><TableHeader><TableRow><TableHead>Documento</TableHead><TableHead>Tipo</TableHead><TableHead>Etiquetas</TableHead><TableHead>Estado</TableHead><TableHead>Chunks</TableHead>{canManage && <TableHead>Acciones</TableHead>}</TableRow></TableHeader><TableBody>{loading ? <TableRow><TableCell colSpan={canManage ? 6 : 5} className="py-10 text-center text-[#5E5E66]">Cargando conocimiento…</TableCell></TableRow> : documents.length ? documents.map((document) => <TableRow key={document.id}><TableCell><p className="font-medium">{document.title}</p><p className="max-w-64 truncate text-xs text-[#5E5E66]">{document.category?.name ?? document.storage_path}</p></TableCell><TableCell>{document.doc_type_display ?? document.doc_type}</TableCell><TableCell className="space-x-1">{document.tags?.slice(0, 2).map((tag) => <Badge key={tag.slug} variant="outline">{tag.name}</Badge>)}</TableCell><TableCell>{document.is_indexed ? <span className="flex items-center gap-1 text-sm text-green-700"><CheckCircle2 className="size-4"/>Indexado</span> : <span title={document.indexing_error} className="text-sm text-amber-700">Pendiente</span>}</TableCell><TableCell>{document.chunks_count}</TableCell>{canManage && <TableCell className="space-x-1">{!document.is_indexed && <Button size="icon-sm" variant="ghost" title="Reintentar indexación" onClick={() => void reindex(document.id)}><RefreshCw/></Button>}<Button size="icon-sm" variant="ghost" title="Retirar del RAG" onClick={() => void remove(document.id)}><Trash2 className="text-[#D64545]"/></Button></TableCell>}</TableRow>) : <TableRow><TableCell colSpan={canManage ? 6 : 5} className="py-12 text-center text-[#5E5E66]">No hay documentos que coincidan.</TableCell></TableRow>}</TableBody></Table></div>
    {config && <p className="text-xs text-[#5E5E66]">Formatos permitidos: {config.upload.allowed_extensions.join(", ")} · Máximo {config.upload.max_mb} MB.</p>}
  </section>;
}
