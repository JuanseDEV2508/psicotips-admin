"use client";

import { Download, FileText, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { downloadMarkdown, sanitizeFilename } from "@/lib/download-markdown";
import { generateCommercialRequirement } from "@/services/requirements/generate-commercial-requirement";

interface GenerateCommercialRequirementButtonProps {
  contactId: number | string;
  contactName?: string;
  conversation?: { id: number | string; status: string } | null;
  completionPercentage?: string | number | null;
}

interface GeneratedRequirement {
  filename: string;
  markdown: string;
}

function isValidWebhookFilename(filename: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.md$/.test(filename);
}

export function GenerateCommercialRequirementButton({
  contactId,
  contactName,
  conversation,
  completionPercentage,
}: GenerateCommercialRequirementButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedRequirement, setGeneratedRequirement] =
    useState<GeneratedRequirement | null>(null);
  const [downloaded, setDownloaded] = useState(false);
  const completion =
    Number.parseFloat(String(completionPercentage ?? "0")) || 0;
  const meetsCompletionThreshold = completion > 50;
  const isDisabled =
    isLoading || !contactId || !conversation?.id || !meetsCompletionThreshold;

  const handleGenerateRequirement = async (): Promise<void> => {
    if (isLoading) return;
    if (!contactId) {
      setError("No se encontró el contacto.");
      return;
    }
    if (!conversation?.id) {
      setError("El contacto no tiene una conversación disponible.");
      return;
    }
    if (!meetsCompletionThreshold) {
      setError(
        "El lead debe tener más de 50 % de completitud para generar el requerimiento.",
      );
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      setDownloaded(false);
      const result = await generateCommercialRequirement({
        contactId,
        conversationId: conversation.id,
      });
      const safeContactName =
        sanitizeFilename(contactName || "contacto") || "contacto";
      const fallbackFilename = `requerimiento-comercial-${safeContactName}-${new Date().toISOString().slice(0, 10)}.md`;
      const filename =
        result.filename && isValidWebhookFilename(result.filename)
          ? result.filename
          : fallbackFilename;
      setGeneratedRequirement({ filename, markdown: result.markdown });
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Ocurrió un error al generar el requerimiento.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const statusMessage = !conversation
    ? "Este contacto todavía no tiene una conversación disponible."
    : !meetsCompletionThreshold
      ? `Completitud actual: ${completion.toFixed(0)} %. Necesita más de 50 % para generar el requerimiento.`
      : `Completitud: ${completion.toFixed(0)} %. Ya puedes generar el requerimiento, sin importar el estado de la conversación.`;
  const handleDownload = (): void => {
    if (!generatedRequirement) return;
    downloadMarkdown(
      generatedRequirement.markdown,
      generatedRequirement.filename,
    );
    setDownloaded(true);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-[#5E5E66]">{statusMessage}</p>
      <Button onClick={handleGenerateRequirement} disabled={isDisabled}>
        {isLoading ? <LoaderCircle className="animate-spin" /> : <Download />}
        {isLoading ? "Generando requerimiento..." : "Generar requerimiento"}
      </Button>
      {error && (
        <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {generatedRequirement && (
        <div className="overflow-hidden rounded-lg border border-[#D8D8DC] bg-[#F7F7F8]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D8D8DC] bg-white p-3">
            <div className="flex min-w-0 items-center gap-2">
              <FileText className="shrink-0 text-[#8941E8]" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {generatedRequirement.filename}
                </p>
                <p className="text-xs text-[#5E5E66]">
                  Requerimiento generado correctamente.
                </p>
              </div>
            </div>
            <Button size="sm" onClick={handleDownload}>
              <Download /> Descargar
            </Button>
          </div>
          <div className="p-3">
            <p className="mb-2 text-xs font-medium text-[#5E5E66]">
              Vista previa del archivo
            </p>
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-md border border-[#D8D8DC] bg-white p-3 font-mono text-xs leading-5 text-[#303038]">
              {generatedRequirement.markdown}
            </pre>
          </div>
        </div>
      )}
      {downloaded && (
        <p role="status" className="text-sm text-emerald-700">
          Archivo descargado correctamente.
        </p>
      )}
    </div>
  );
}
