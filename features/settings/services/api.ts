export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  return request<T>(`/api/backend/${path.replace(/^\//, "")}`, init);
}

export async function formatRagMarkdown<T>(payload: unknown): Promise<T> {
  return request<T>("/api/knowledge/format/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const messages = Object.values(data as Record<string, unknown>).flatMap((value) => Array.isArray(value) ? value : typeof value === "string" ? [value] : []).join(" ");
    throw new Error(messages || (data as { detail?: string; message?: string }).detail || (data as { message?: string }).message || "No se pudo completar la operación.");
  }
  return data as T;
}

export type User = { id: number; email: string; username: string; first_name: string; last_name: string; full_name: string; phone: string; role: string | null; role_display: string; is_active: boolean; is_staff: boolean; is_superuser: boolean; preferences: Record<string, unknown>; capabilities: string[]; created_at?: string; last_login?: string | null };
export type Document = { id: number; title: string; doc_type: string; doc_type_display?: string; category?: { name: string; slug: string } | null; tags?: { name: string; slug: string }[]; is_indexed: boolean; indexing_error: string; chunks_count: number; updated_at?: string; storage_path: string; is_deleted?: boolean; frontmatter?: Record<string, unknown> };
export type KnowledgeConfig = { doc_types: { value: string; label: string; folder?: string }[]; categories: { id: number; name: string; slug: string }[]; tags: { id: number; name: string; slug: string }[]; upload: { max_mb: number; allowed_extensions: string[] } };
