"use client";

import { useState } from "react";
import {
  ChevronDown,
  ClipboardList,
  LoaderCircle,
  Plus,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { crmClient } from "@/features/crm/services/client";
import type { ApiError, ClientCreatePayload } from "../types/crm";

type Values = Record<string, string>;
const defaults: Values = {
  name: "",
  first_name: "",
  last_name: "",
  job_title: "",
  email: "",
  phone: "",
  whatsapp_id: "",
  company_name: "",
  skills_to_work: "",
  participants_count: "",
  training_duration: "",
  event_date: "",
  location_type: "",
  logistics_details: "",
  approximate_budget: "",
  proposal_deadline: "",
  training_expectations: "",
  current_step: "",
};
const compact = (data: Record<string, string>) =>
  Object.fromEntries(Object.entries(data).filter(([, value]) => value.trim()));

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-sm font-medium text-[#1E1E21]">{label}</span>
      <Input
        className="h-10 bg-white"
        type={type}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-sm font-medium text-[#1E1E21]">{label}</span>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="w-full rounded-lg border border-[#D8D8DC] bg-white px-3 py-2 text-sm outline-none placeholder:text-[#85858D] focus:border-[#F8CB00] focus:ring-3 focus:ring-[#F8CB00]/30"
      />
    </label>
  );
}
function getError(error: unknown) {
  const apiError = error as ApiError;
  const body = apiError?.body;
  if (body && typeof body === "object") {
    const flatten = (value: unknown): string[] =>
      Array.isArray(value)
        ? value.flatMap(flatten)
        : value && typeof value === "object"
          ? Object.values(value).flatMap(flatten)
          : typeof value === "string"
            ? [value]
            : [];
    const messages = flatten(body);
    if (messages.length) return messages.join(" ");
  }
  return (
    apiError?.message ||
    "No fue posible crear el cliente. Inténtalo nuevamente."
  );
}

export function CreateClientDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [leadOpen, setLeadOpen] = useState(true);
  const [values, setValues] = useState<Values>(defaults);
  const [sendWelcomeMessage, setSendWelcomeMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const change = (field: string) => (value: string) =>
    setValues((current) => ({ ...current, [field]: value }));
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const contact = compact({
      name: values.name,
      first_name: values.first_name,
      last_name: values.last_name,
      job_title: values.job_title,
      email: values.email,
      phone: values.phone,
      whatsapp_id: values.whatsapp_id,
    });
    if (!Object.keys(contact).some((key) => key !== "job_title")) {
      setError(
        "Envía al menos un dato del contacto: nombre, teléfono, correo o WhatsApp.",
      );
      return;
    }
    const lead = compact({
      company_name: values.company_name,
      skills_to_work: values.skills_to_work,
      participants_count: values.participants_count,
      training_duration: values.training_duration,
      event_date: values.event_date,
      location_type: values.location_type,
      logistics_details: values.logistics_details,
      approximate_budget: values.approximate_budget,
      proposal_deadline: values.proposal_deadline,
      training_expectations: values.training_expectations,
      current_step: values.current_step,
    });
    setSaving(true);
    setError(null);
    const payload: ClientCreatePayload = {
      contact,
      ...(Object.keys(lead).length ? { lead_information: lead } : {}),
      send_welcome_message: sendWelcomeMessage,
    };
    try {
      await crmClient.createClient(payload);
      setOpen(false);
      setValues(defaults);
      setSendWelcomeMessage(false);
      router.refresh();
    } catch (reason) {
      setError(getError(reason));
    } finally {
      setSaving(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="h-10 bg-[#8941E8] px-4 text-white hover:bg-[#7330cb]" />
        }
      >
        <Plus />
        Crear cliente
      </DialogTrigger>
      <DialogContent
        className="max-h-[90vh] max-w-3xl overflow-y-auto p-0 sm:max-w-3xl"
        showCloseButton={!saving}
      >
        <DialogHeader className="border-b border-[#E6E6E9] px-6 pt-6 pb-5">
          <DialogTitle className="font-[family-name:var(--font-poppins)] text-xl text-[#1E1E21]">
            Crear cliente
          </DialogTitle>
          <DialogDescription>
            Registra lo que sabes ahora; podrás completar el resto después.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5 px-6 py-5">
          <section>
            <div className="mb-4 flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-[#8941E8]/10 text-[#8941E8]">
                <UserRound className="size-4" />
              </span>
              <div>
                <h2 className="font-medium text-[#1E1E21]">Contacto</h2>
                <p className="text-xs text-[#5E5E66]">
                  Incluye al menos un dato para identificarlo.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Nombre completo"
                value={values.name}
                onChange={change("name")}
              />
              <Field
                label="Nombre"
                value={values.first_name}
                onChange={change("first_name")}
              />
              <Field
                label="Apellidos"
                value={values.last_name}
                onChange={change("last_name")}
              />
              <Field
                label="Cargo"
                value={values.job_title}
                onChange={change("job_title")}
                placeholder="Ej. Gerente de talento"
              />
              <Field
                label="Correo electrónico"
                type="email"
                value={values.email}
                onChange={change("email")}
                placeholder="nombre@empresa.com"
              />
              <Field
                label="Teléfono"
                type="tel"
                value={values.phone}
                onChange={change("phone")}
                placeholder="300 123 4567"
              />
              <Field
                label="WhatsApp"
                type="tel"
                value={values.whatsapp_id}
                onChange={change("whatsapp_id")}
                placeholder="Se usa el teléfono si se omite"
              />
            </div>
            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-[#D8D8DC] bg-[#FAFAFB] p-3 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 size-4 accent-[#8941E8]"
                checked={sendWelcomeMessage}
                onChange={(event) =>
                  setSendWelcomeMessage(event.target.checked)
                }
              />
              <span>
                <span className="block font-medium text-[#1E1E21]">
                  Enviar WhatsApp de bienvenida
                </span>
                <span className="block text-xs text-[#5E5E66]">
                  Se enviará al crear el cliente. Si no, podrás hacerlo desde su
                  ficha.
                </span>
              </span>
            </label>
          </section>
          <section className="overflow-hidden rounded-xl border border-[#D8D8DC]">
            <button
              type="button"
              onClick={() => setLeadOpen((current) => !current)}
              className="flex w-full items-center justify-between bg-[#FAFAFB] px-4 py-3 text-left"
            >
              <span className="flex items-center gap-2 font-medium text-[#1E1E21]">
                <ClipboardList className="size-4 text-[#8941E8]" />
                Información comercial
              </span>
              <ChevronDown
                className={`size-4 text-[#5E5E66] transition-transform ${leadOpen ? "rotate-180" : ""}`}
              />
            </button>
            {leadOpen && (
              <div className="grid gap-4 border-t border-[#E6E6E9] p-4 sm:grid-cols-2">
                <Field
                  label="Empresa"
                  value={values.company_name}
                  onChange={change("company_name")}
                  placeholder="Como la llama el cliente"
                />
                <Field
                  label="Personas participantes"
                  value={values.participants_count}
                  onChange={change("participants_count")}
                  placeholder="Ej. unas 40 personas"
                />
                <TextField
                  label="Habilidades o temas a trabajar"
                  value={values.skills_to_work}
                  onChange={change("skills_to_work")}
                />
                <TextField
                  label="Duración esperada"
                  value={values.training_duration}
                  onChange={change("training_duration")}
                />
                <Field
                  label="Fecha o rango tentativo"
                  value={values.event_date}
                  onChange={change("event_date")}
                />
                <Field
                  label="Modalidad y sede"
                  value={values.location_type}
                  onChange={change("location_type")}
                  placeholder="Presencial, virtual o híbrido"
                />
                <TextField
                  label="Detalles logísticos"
                  value={values.logistics_details}
                  onChange={change("logistics_details")}
                />
                <Field
                  label="Presupuesto aproximado"
                  value={values.approximate_budget}
                  onChange={change("approximate_budget")}
                />
                <Field
                  label="Fecha límite de propuesta"
                  value={values.proposal_deadline}
                  onChange={change("proposal_deadline")}
                />
                <Field
                  label="Paso actual"
                  value={values.current_step}
                  onChange={change("current_step")}
                  maxLength={100}
                />
                <TextField
                  label="Objetivos y expectativas"
                  value={values.training_expectations}
                  onChange={change("training_expectations")}
                />
              </div>
            )}
          </section>
          {error && (
            <p
              role="alert"
              className="rounded-lg bg-[#D64545]/10 px-3 py-2 text-sm text-[#B42C2C]"
            >
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3 border-t border-[#E6E6E9] pt-5">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="h-9 bg-[#8941E8] text-white hover:bg-[#7330cb]"
            >
              {saving && <LoaderCircle className="animate-spin" />}
              {saving ? "Creando..." : "Crear cliente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
