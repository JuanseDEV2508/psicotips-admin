import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { hasValidAccessSession } from "@/lib/auth/session";

export default async function LoginPage() {
  if (await hasValidAccessSession()) {
    redirect("/dashboard");
  }

  return (
    <main className="grid min-h-screen bg-[#F7F7F8] lg:grid-cols-[minmax(0,3fr)_minmax(360px,2fr)]">
      <section className="hidden min-h-screen flex-col bg-[#1E1E21] px-10 py-9 text-white md:flex lg:px-14">
        <div className="font-[family-name:var(--font-poppins)] text-xl font-semibold tracking-tight">
          Psicotips<span className="text-[#F8CB00]">.</span>
        </div>

        <div className="my-auto max-w-xl">
          <h1 className="font-[family-name:var(--font-poppins)] text-5xl leading-[1.08] font-semibold tracking-tight lg:text-6xl">
            Hola,
            <br />
            <span className="text-[#F8CB00]">Psicotips</span>
          </h1>
          <p className="mt-7 max-w-md text-lg leading-8 text-white/85">
            Gestiona conversaciones, requerimientos y propuestas desde un solo
            lugar.
          </p>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/60">
            Una plataforma creada para acompañar y optimizar el proceso
            comercial.
          </p>
        </div>

        <p className="text-sm text-white/55">
          © 2026 Psicotips. Todos los derechos reservados.
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
        <div className="w-full max-w-[410px] rounded-2xl border border-[#D8D8DC] bg-white p-6 shadow-[0_10px_30px_rgba(30,30,33,0.08)] sm:p-8">
          <div className="mb-8">
            <p className="font-[family-name:var(--font-poppins)] text-xl font-semibold tracking-tight text-[#1E1E21]">
              Psicotips<span className="text-[#8941E8]">.</span>
            </p>
            <h2 className="mt-7 font-[family-name:var(--font-poppins)] text-2xl font-semibold tracking-tight text-[#1E1E21]">
              ¡Bienvenido de nuevo!
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#5E5E66]">
              Ingresa tus datos para acceder a la plataforma.
            </p>
          </div>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
