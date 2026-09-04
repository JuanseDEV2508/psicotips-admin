"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Bot,
  Edit,
  Pause,
  Save,
  Send,
  UserRound,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { crmClient } from "@/features/crm/services/client";
import { GenerateCommercialRequirementButton } from "./generate-commercial-requirement-button";
import type {
  ApiError,
  ContactDetailResponse,
  ConversationControl,
  ConversationMessage,
  ConversationSummary,
  LeadInformation,
  LeadInformationField,
  LeadInformationPayload,
  LeadInformationResponse,
  WelcomeMessage,
} from "../types/crm";
import { display, formatDate } from "../utils";

const commercialFields = [
  ["Habilidades a trabajar", "skills_to_work"],
  ["Participantes", "participants_count"],
  ["Duración", "training_duration"],
  ["Fecha del evento", "event_date"],
  ["Ubicación", "location_type"],
  ["Logística", "logistics_details"],
  ["Presupuesto", "approximate_budget"],
  ["Fecha límite", "proposal_deadline"],
  ["Expectativas", "training_expectations"],
] as const;
const feedbackFields = [
  ["Calificación del chatbot", "chatbot_rating"],
  ["Comentario", "chatbot_feedback"],
] as const;
const controlFields = [
  ["Porcentaje de completitud", "completion_percentage"],
  ["Paso actual", "current_step"],
  ["Formulario completado", "is_completed"],
] as const;
const editableFields = [
  ...commercialFields,
  ...feedbackFields,
  ...controlFields,
] as const;
type FormField = LeadInformationField;
type FormValues = Record<FormField, string | boolean>;

function errorMessage(error: unknown) {
  return error &&
    typeof error === "object" &&
    "status" in error &&
    (error as ApiError).status === 403
    ? "No tienes permisos para editar la información comercial."
    : error && typeof error === "object" && "message" in error
      ? String((error as ApiError).message)
      : "No fue posible completar la acción.";
}
function fieldError(error: unknown) {
  const body =
    error && typeof error === "object" && "body" in error
      ? (error as ApiError).body
      : null;
  if (!body || typeof body !== "object") return null;
  return Object.entries(body as Record<string, unknown>)
    .map(
      ([field, messages]) =>
        `${field}: ${Array.isArray(messages) ? messages.join(" ") : String(messages)}`,
    )
    .join(" · ");
}
function toFormValues(lead: LeadInformation): FormValues {
  return {
    skills_to_work: lead.skills_to_work ?? "",
    participants_count: lead.participants_count ?? "",
    training_duration: lead.training_duration ?? "",
    event_date: lead.event_date ?? "",
    location_type: lead.location_type ?? "",
    logistics_details: lead.logistics_details ?? "",
    approximate_budget: lead.approximate_budget ?? "",
    proposal_deadline: lead.proposal_deadline ?? "",
    training_expectations: lead.training_expectations ?? "",
    chatbot_rating: lead.chatbot_rating?.toString() ?? "",
    chatbot_feedback: lead.chatbot_feedback ?? "",
    completion_percentage: lead.completion_percentage ?? "",
    current_step: lead.current_step ?? "",
    is_completed: lead.is_completed ?? false,
  };
}
function Info({
  title,
  values,
}: {
  title: string;
  values: Array<[string, string | number | boolean | null | undefined]>;
}) {
  return (
    <Card className="border-[#D8D8DC]">
      <CardHeader>
        <CardTitle className="font-[family-name:var(--font-poppins)] text-lg">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {values.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-medium text-[#5E5E66]">{label}</dt>
            <dd className="mt-1 text-sm">
              {typeof value === "boolean"
                ? value
                  ? "Sí"
                  : "No"
                : display(value)}
            </dd>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
function Messages({ messages }: { messages: ConversationMessage[] }) {
  const visibleMessages = messages.filter(
    (message) =>
      !(
        message.sender_role === "BOT" &&
        message.message_type === "TEXT" &&
        (!message.text?.trim() || message.text.trim() === "Mensaje TEXT")
      ),
  );
  return (
    <div
      className="h-[calc(100vh-23rem)] min-h-[22rem] max-h-[44rem] overflow-y-auto overscroll-contain pr-2"
      aria-live="polite"
    >
      <div className="space-y-3">
        {visibleMessages.length ? (
          visibleMessages.map((message) => (
            <div
              key={message.id}
              className={
                message.is_internal
                  ? "rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm"
                  : message.sender_role === "CUSTOMER"
                    ? "mr-8 rounded-lg bg-[#F0E5FF] p-3 text-sm"
                    : "ml-8 rounded-lg bg-[#F7F7F8] p-3 text-sm"
              }
            >
              <div className="mb-1 flex items-center justify-between gap-2 text-xs text-[#5E5E66]">
                <span>
                  {message.is_internal
                    ? "Nota interna"
                    : message.sender_role === "CUSTOMER"
                      ? "Cliente"
                      : message.sender_role === "BOT"
                        ? "Chatbot"
                        : message.sender_role === "SYSTEM"
                          ? "Sistema"
                          : "Asesor"}
                </span>
                <span>
                  {message.status === "PENDING"
                    ? "Enviando…"
                    : message.status === "FAILED"
                      ? "Error al enviar"
                      : formatDate(message.created_at, true)}
                </span>
              </div>
              <p className="whitespace-pre-wrap">
                {message.text || `Mensaje ${message.message_type}`}
              </p>
              {message.media_url && (
                <a
                  className="mt-2 block text-xs text-[#8941E8] underline"
                  href={message.media_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir archivo adjunto
                </a>
              )}
            </div>
          ))
        ) : (
          <p className="py-10 text-center text-sm text-[#5E5E66]">
            No hay mensajes en esta conversación.
          </p>
        )}
      </div>
    </div>
  );
}

function LeadInformationCard({
  contactId,
  selected,
  initialLead,
  onCaseChange,
}: {
  contactId: number;
  selected: ConversationSummary | null;
  initialLead: LeadInformation | null;
  onCaseChange: (lead: LeadInformationResponse) => void;
}) {
  const [lead, setLead] = useState<LeadInformation | null>(initialLead);
  const [form, setForm] = useState<FormValues | null>(
    initialLead ? toFormValues(initialLead) : null,
  );
  const [editing, setEditing] = useState(false);
  const [loadedConversationId, setLoadedConversationId] = useState<
    number | null
  >(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const loading = selected !== null && loadedConversationId !== selected.id;
  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    crmClient
      .getLeadInformation(contactId, selected.id)
      .then((data) => {
        if (!cancelled) {
          setLead(data.lead_information);
          setForm(toFormValues(data.lead_information));
          setLoadedConversationId(selected.id);
          onCaseChange(data);
        }
      })
      .catch((reason) => {
        if (!cancelled) {
          setError(errorMessage(reason));
          setLoadedConversationId(selected.id);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [contactId, onCaseChange, selected]);
  const update = (field: FormField, value: string | boolean) =>
    setForm((current) => (current ? { ...current, [field]: value } : current));
  const cancel = () => {
    if (lead) setForm(toFormValues(lead));
    setEditing(false);
    setError("");
  };
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected || !lead || !form || saving) return;
    const changes: LeadInformationPayload = { conversation_id: selected.id };
    editableFields.forEach(([, field]) => {
      const oldValue = toFormValues(lead)[field];
      const newValue = form[field];
      if (oldValue !== newValue) {
        if (field === "is_completed")
          changes.is_completed = newValue as boolean;
        else if (field === "chatbot_rating")
          changes.chatbot_rating = newValue === "" ? null : Number(newValue);
        else if (field === "completion_percentage")
          changes.completion_percentage =
            newValue === "" ? null : Number(newValue);
        else changes[field] = newValue === "" ? null : (newValue as string);
      }
    });
    if (Object.keys(changes).length === 1) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const data = await crmClient.updateLeadInformation(contactId, changes);
      setLead(data.lead_information);
      setForm(toFormValues(data.lead_information));
      onCaseChange(data);
      setEditing(false);
    } catch (reason) {
      setError(fieldError(reason) || errorMessage(reason));
    } finally {
      setSaving(false);
    }
  };
  const completion = Math.max(
    0,
    Math.min(100, Number.parseFloat(lead?.completion_percentage ?? "0") || 0),
  );
  return (
    <Card className="border-[#D8D8DC]">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Información comercial</CardTitle>
            <p className="mt-1 text-xs text-[#5E5E66]">
              {selected
                ? `Conversación #${selected.id}`
                : "Selecciona una conversación"}
            </p>
          </div>
          {!editing && selected && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditing(true)}
            >
              <Edit />
              Editar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <p
            role="alert"
            className="mb-3 rounded bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}
        {loading ? (
          <p className="text-sm text-[#5E5E66]">Cargando formulario…</p>
        ) : !selected ? (
          <p className="text-sm text-[#5E5E66]">
            Este cliente no tiene conversaciones.
          </p>
        ) : editing && form ? (
          <form className="space-y-4" onSubmit={save}>
            {lead?.company_name && (
              <p className="text-sm">
                <span className="text-[#5E5E66]">Empresa de origen: </span>
                {lead.company_name}
              </p>
            )}
            <LeadFields
              title="Datos comerciales"
              fields={commercialFields}
              form={form}
              onChange={update}
            />
            <LeadFields
              title="Feedback del chatbot"
              fields={feedbackFields}
              form={form}
              onChange={update}
            />
            <LeadFields
              title="Control"
              fields={controlFields}
              form={form}
              onChange={update}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={cancel}>
                <X />
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  "Guardando…"
                ) : (
                  <>
                    <Save />
                    Guardar cambios
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="mb-4">
              <div className="mb-1 flex justify-between text-sm">
                <span>Completitud</span>
                <span>{completion.toFixed(0)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded bg-[#E8E8EC]">
                <div
                  className="h-full bg-[#8941E8]"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
            <dl className="space-y-2 text-sm">
              {lead?.company_name && (
                <div className="flex justify-between gap-3">
                  <dt className="text-[#5E5E66]">Empresa de origen</dt>
                  <dd className="text-right">{lead.company_name}</dd>
                </div>
              )}
              {editableFields.map(([label, key]) => (
                <div key={key} className="flex justify-between gap-3">
                  <dt className="text-[#5E5E66]">{label}</dt>
                  <dd className="text-right">
                    {typeof lead?.[key] === "boolean"
                      ? lead[key]
                        ? "Sí"
                        : "No"
                      : display(lead?.[key])}
                  </dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </CardContent>
    </Card>
  );
}
function LeadFields({
  title,
  fields,
  form,
  onChange,
}: {
  title: string;
  fields: ReadonlyArray<readonly [string, FormField]>;
  form: FormValues;
  onChange: (field: FormField, value: string | boolean) => void;
}) {
  return (
    <fieldset className="grid gap-3">
      <legend className="font-medium">{title}</legend>
      {fields.map(([label, field]) =>
        field === "is_completed" ? (
          <label key={field} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(form[field])}
              onChange={(event) => onChange(field, event.target.checked)}
            />
            {label}
          </label>
        ) : (
          <label key={field} className="grid gap-1 text-sm">
            <span>{label}</span>
            {field === "chatbot_feedback" ||
            field === "logistics_details" ||
            field === "training_expectations" ? (
              <textarea
                className="min-h-20 rounded-md border border-[#D8D8DC] bg-white px-3 py-2"
                value={String(form[field])}
                onChange={(event) => onChange(field, event.target.value)}
              />
            ) : (
              <Input
                type={
                  field === "chatbot_rating" ||
                  field === "completion_percentage"
                    ? "number"
                    : "text"
                }
                min={
                  field === "chatbot_rating"
                    ? 1
                    : field === "completion_percentage"
                      ? 0
                      : undefined
                }
                max={
                  field === "chatbot_rating"
                    ? 5
                    : field === "completion_percentage"
                      ? 100
                      : undefined
                }
                value={String(form[field])}
                onChange={(event) => onChange(field, event.target.value)}
              />
            )}
          </label>
        ),
      )}
    </fieldset>
  );
}

function welcomeDescription(message: WelcomeMessage) {
  if (message.sent) {
    return message.sent_at
      ? `Mensaje enviado el ${formatDate(message.sent_at, true)}.`
      : "Este cliente ya recibió el mensaje de bienvenida.";
  }
  if (message.status === "IN_PROGRESS")
    return "Hay un envío en curso. Espera unos segundos.";
  if (message.status === "FAILED")
    return message.error || "Meta no aceptó el envío. Puedes reintentarlo.";
  if (message.status === "SKIPPED")
    return `No se pudo enviar: ${message.reason || "configuración incompleta"}.`;
  return "Aún no se ha enviado un mensaje de bienvenida.";
}

function WelcomeMessageCard({ contactId }: { contactId: number }) {
  const [message, setMessage] = useState<WelcomeMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingWelcome, setSendingWelcome] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    crmClient
      .getWelcomeMessage(contactId)
      .then((data) => {
        if (!cancelled) setMessage(data);
      })
      .catch((reason) => {
        if (!cancelled) setError(errorMessage(reason));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [contactId]);

  const sendWelcome = async () => {
    if (!message?.can_retry || sendingWelcome) return;
    setSendingWelcome(true);
    setError("");
    try {
      setMessage(await crmClient.sendWelcomeMessage(contactId));
    } catch (reason) {
      const apiError = reason as ApiError;
      if (
        apiError.body &&
        typeof apiError.body === "object" &&
        "status" in apiError.body
      ) {
        setMessage(apiError.body as WelcomeMessage);
      } else {
        setError(errorMessage(reason));
      }
    } finally {
      setSendingWelcome(false);
    }
  };

  return (
    <Card className="border-[#D8D8DC]">
      <CardHeader>
        <CardTitle>WhatsApp de bienvenida</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <p className="text-sm text-[#5E5E66]">Consultando estado…</p>
        ) : error ? (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        ) : message ? (
          <>
            <p className="text-sm text-[#5E5E66]">
              {welcomeDescription(message)}
            </p>
            <Button
              type="button"
              size="sm"
              disabled={!message.can_retry || sendingWelcome}
              onClick={sendWelcome}
            >
              <Send />
              {sendingWelcome
                ? "Enviando…"
                : message.sent
                  ? "Mensaje enviado"
                  : "Enviar WhatsApp de bienvenida"}
            </Button>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function ContactDetailScreen({
  detail,
}: {
  detail: ContactDetailResponse;
}) {
  const [selected, setSelected] = useState<ConversationSummary | null>(
    detail.conversations[0] ?? null,
  );
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [control, setControl] = useState<ConversationControl | null>(null);
  const [text, setText] = useState("");
  const [internal, setInternal] = useState(false);
  const [loadedConversationId, setLoadedConversationId] = useState<
    number | null
  >(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [leadCompletion, setLeadCompletion] = useState(
    detail.lead_information?.completion_percentage ?? null,
  );
  const caseId =
    selected?.commercial_case_id ??
    detail.conversations.find((conversation) => conversation.commercial_case_id)
      ?.commercial_case_id ??
    null;
  const cursor = useRef<string | null>(null);
  const loading = selected !== null && loadedConversationId !== selected.id;
  const merge = useCallback(
    (incoming: ConversationMessage[]) =>
      setMessages((current) => {
        const all = new Map(current.map((message) => [message.id, message]));
        incoming.forEach((message) => all.set(message.id, message));
        return [...all.values()].sort((a, b) =>
          a.created_at.localeCompare(b.created_at),
        );
      }),
    [],
  );
  const leadUpdated = useCallback((data: LeadInformationResponse) => {
    setLeadCompletion(data.lead_information.completion_percentage);
  }, []);
  const selectConversation = (conversation: ConversationSummary) => {
    setSelected(conversation);
    setLeadCompletion(null);
  };
  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    cursor.current = null;
    crmClient
      .getConversation(detail.contact.id, selected.id)
      .then((data) => {
        if (cancelled) return;
        setMessages(data.messages);
        setControl(data.control);
        cursor.current =
          data.messages.at(-1)?.created_at ?? data.conversation.last_message_at;
        setLoadedConversationId(selected.id);
      })
      .catch((reason) => {
        if (!cancelled) {
          setError(errorMessage(reason));
          setLoadedConversationId(selected.id);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [detail.contact.id, selected]);
  useEffect(() => {
    if (!selected || loading) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const poll = async () => {
      try {
        const data = await crmClient.getLiveConversation(
          detail.contact.id,
          selected.id,
          cursor.current,
        );
        if (cancelled) return;
        merge(data.messages);
        cursor.current = data.cursor ?? cursor.current;
        setControl(data.control);
        timer = setTimeout(
          poll,
          data.has_more ? 0 : (data.poll_interval_ms ?? 3000),
        );
      } catch {
        if (!cancelled) timer = setTimeout(poll, 5000);
      }
    };
    timer = setTimeout(poll, 3000);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [detail.contact.id, loading, merge, selected]);
  const send = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected || !text.trim() || sending) return;
    setSending(true);
    setError("");
    try {
      const response = await crmClient.sendMessage(detail.contact.id, {
        text: text.trim(),
        internal,
        take_control: !internal,
        conversation_id: selected.id,
      });
      merge([response.message]);
      setControl(response.control);
      setText("");
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setSending(false);
    }
  };
  const changeControl = async (
    mode: ConversationControl["mode"],
    force = false,
  ) => {
    if (!selected) return;
    setError("");
    try {
      const response = await crmClient.updateControl(detail.contact.id, {
        mode,
        force,
        conversation_id: selected.id,
      });
      setControl(response.control);
    } catch (reason) {
      const apiError = reason as ApiError;
      if (
        apiError.status === 409 &&
        !force &&
        window.confirm(
          "Otro asesor tiene esta conversación. ¿Deseas tomarla de todas formas?",
        )
      )
        return changeControl("HUMAN", true);
      setError(errorMessage(reason));
    }
  };
  const mode = control?.mode ?? selected?.control_mode;
  return (
    <section className="space-y-5">
      <Button
        render={<Link href="/clientes" />}
        variant="ghost"
        className="-ml-2"
      >
        <ArrowLeft />
        Volver a clientes
      </Button>
      <header className="rounded-xl border border-[#D8D8DC] bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-poppins)] text-2xl font-semibold">
              {detail.contact.name || "No registrado"}
            </h1>
            <p className="mt-1 text-sm text-[#5E5E66]">
              {detail.contact.job_title || "Sin cargo"}
            </p>
            <p className="mt-2 text-sm">
              {detail.contact.email || "No registrado"} ·{" "}
              {detail.contact.phone || "No registrado"}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">
              {selected?.status || "Sin conversaciones"}
            </Badge>
            {caseId && (
              <Badge variant="outline">Caso comercial #{caseId}</Badge>
            )}
          </div>
        </div>
      </header>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="space-y-5">
          <Info
            title="Información de contacto"
            values={[
              ["Nombre completo", detail.contact.name],
              ["Nombres", detail.contact.first_name],
              ["Apellidos", detail.contact.last_name],
              ["Cargo", detail.contact.job_title],
              ["Correo", detail.contact.email],
              ["Teléfono", detail.contact.phone],
              ["WhatsApp ID", detail.contact.whatsapp_id],
              ["Creado", formatDate(detail.contact.created_at)],
              ["Actualizado", formatDate(detail.contact.updated_at ?? null)],
            ]}
          />
          <WelcomeMessageCard contactId={detail.contact.id} />
          <LeadInformationCard
            contactId={detail.contact.id}
            selected={selected}
            initialLead={detail.lead_information}
            onCaseChange={leadUpdated}
          />
          <Card className="border-[#D8D8DC]">
            <CardHeader>
              <CardTitle>Requerimiento comercial</CardTitle>
            </CardHeader>
            <CardContent>
              <GenerateCommercialRequirementButton
                contactId={detail.contact.id}
                contactName={detail.contact.name}
                conversation={selected}
                completionPercentage={leadCompletion}
              />
            </CardContent>
          </Card>
          <Card className="border-[#D8D8DC]">
            <CardHeader>
              <CardTitle>
                Conversaciones ({detail.conversations_count})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {detail.conversations.length ? (
                detail.conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => selectConversation(conversation)}
                    className={`w-full rounded-lg border p-3 text-left text-sm ${selected?.id === conversation.id ? "border-[#8941E8] bg-[#F7F0FF]" : "border-[#D8D8DC]"}`}
                  >
                    <div className="flex justify-between">
                      <b>Conversación #{conversation.id}</b>
                      <span>{conversation.status}</span>
                    </div>
                    <p className="mt-1 text-xs text-[#5E5E66]">
                      {conversation.messages_count} mensajes ·{" "}
                      {conversation.control_mode} ·{" "}
                      {formatDate(conversation.last_message_at)}
                    </p>
                  </button>
                ))
              ) : (
                <p className="text-sm text-[#5E5E66]">
                  Este cliente no tiene conversaciones.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <Card className="border-[#D8D8DC]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Conversación {selected ? `#${selected.id}` : ""}
                </CardTitle>
                {mode && <Badge variant="outline">{mode}</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <p
                  role="alert"
                  className="mb-3 rounded bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}
              {loading ? (
                <p className="py-12 text-center text-sm text-[#5E5E66]">
                  Cargando conversación…
                </p>
              ) : (
                <Messages messages={messages} />
              )}
            </CardContent>
          </Card>
          {selected && (
            <Card className="border-[#D8D8DC]">
              <CardContent className="p-4">
                <div className="mb-3 flex flex-wrap gap-2">
                  {mode !== "HUMAN" && (
                    <Button
                      variant="outline"
                      onClick={() => changeControl("HUMAN")}
                    >
                      <UserRound />
                      Tomar conversación
                    </Button>
                  )}
                  {mode !== "BOT" && (
                    <Button
                      variant="outline"
                      onClick={() => changeControl("BOT")}
                    >
                      <Bot />
                      Devolver al bot
                    </Button>
                  )}
                  {mode !== "PAUSED" && (
                    <Button
                      variant="outline"
                      onClick={() => changeControl("PAUSED")}
                    >
                      <Pause />
                      Pausar conversación
                    </Button>
                  )}
                </div>
                <form onSubmit={send}>
                  <label className="mb-2 flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={internal}
                      onChange={(event) => setInternal(event.target.checked)}
                    />
                    Guardar como nota interna
                  </label>
                  <Input
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    maxLength={4096}
                    placeholder={
                      internal
                        ? "Escribe una nota interna…"
                        : "Escribe un mensaje…"
                    }
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-[#5E5E66]">
                      {text.length}/4096
                    </span>
                    <Button type="submit" disabled={!text.trim() || sending}>
                      {sending ? (
                        "Enviando…"
                      ) : internal ? (
                        "Guardar nota"
                      ) : (
                        <>
                          <Send />
                          Enviar
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
