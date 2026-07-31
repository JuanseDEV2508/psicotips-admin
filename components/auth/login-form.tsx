"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { loginSchema } from "@/lib/auth/schemas";

type LoginFormValues = z.input<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    if (isSubmitting) return;

    setSubmitError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email.trim().toLowerCase(),
          password: values.password,
        }),
      });
      const body: unknown = await response.json().catch(() => null);
      const message: string =
        body &&
        typeof body === "object" &&
        "message" in body &&
        typeof body.message === "string"
          ? body.message
          : "Ocurrió un error inesperado al iniciar sesión.";

      if (!response.ok) {
        setSubmitError(message);
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setSubmitError(
        "No fue posible conectar con el servidor. Revisa tu conexión e inténtalo nuevamente.",
      );
    }
  };

  const emailErrorId = "email-error";
  const passwordErrorId = "password-error";

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
      <div className="min-h-20 space-y-2">
        <label className="text-sm font-medium text-[#1E1E21]" htmlFor="email">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="nombre@empresa.com"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? emailErrorId : undefined}
          className="h-11 w-full rounded-[10px] border border-[#D8D8DC] bg-white px-3 text-sm text-[#1E1E21] outline-none placeholder:text-[#85858D] transition-colors focus:border-[#F8CB00] focus:ring-3 focus:ring-[#F8CB00]/30 disabled:cursor-not-allowed disabled:bg-[#F1F1F3]"
          {...register("email")}
        />
        <p
          id={emailErrorId}
          className="min-h-5 text-sm text-[#D64545]"
          aria-live="polite"
        >
          {errors.email?.message}
        </p>
      </div>

      <div className="min-h-20 space-y-2">
        <label
          className="text-sm font-medium text-[#1E1E21]"
          htmlFor="password"
        >
          Contraseña
        </label>
        <div className="relative">
          <input
            id="password"
            type={isPasswordVisible ? "text" : "password"}
            autoComplete="current-password"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? passwordErrorId : undefined}
            className="h-11 w-full rounded-[10px] border border-[#D8D8DC] bg-white py-2 pr-12 pl-3 text-sm text-[#1E1E21] outline-none transition-colors focus:border-[#F8CB00] focus:ring-3 focus:ring-[#F8CB00]/30 disabled:cursor-not-allowed disabled:bg-[#F1F1F3]"
            {...register("password")}
          />
          <button
            type="button"
            aria-label={
              isPasswordVisible ? "Ocultar contraseña" : "Mostrar contraseña"
            }
            aria-pressed={isPasswordVisible}
            disabled={isSubmitting}
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            className="absolute top-1/2 right-1 flex size-10 -translate-y-1/2 items-center justify-center rounded-md text-[#5E5E66] outline-none hover:text-[#1E1E21] focus-visible:ring-3 focus-visible:ring-[#F8CB00]/40 disabled:cursor-not-allowed"
          >
            {isPasswordVisible ? (
              <EyeOff size={19} aria-hidden="true" />
            ) : (
              <Eye size={19} aria-hidden="true" />
            )}
          </button>
        </div>
        <p
          id={passwordErrorId}
          className="min-h-5 text-sm text-[#D64545]"
          aria-live="polite"
        >
          {errors.password?.message}
        </p>
      </div>

      <div className="min-h-12" aria-live="polite">
        {submitError ? (
          <p
            role="alert"
            className="rounded-lg border border-[#D64545]/30 bg-[#FDECEC] px-3 py-2 text-sm text-[#8F2525]"
          >
            {submitError}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-[#F8CB00] px-4 text-sm font-semibold text-[#1E1E21] outline-none transition-colors hover:bg-[#E6BA00] focus-visible:ring-3 focus-visible:ring-[#F8CB00]/45 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? (
          <LoaderCircle
            className="size-4 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
        ) : null}
        {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
      </button>

      <p className="text-center text-sm text-[#5E5E66]">
        ¿Olvidaste tu contraseña?{" "}
        <Link
          className="font-medium text-[#5C27A1] underline underline-offset-2 hover:text-[#3E1E69] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#F8CB00]/45"
          href="/recuperar-contrasena"
        >
          Recupérala aquí
        </Link>
      </p>
    </form>
  );
}
