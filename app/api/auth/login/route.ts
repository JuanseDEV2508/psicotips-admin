import { NextRequest, NextResponse } from "next/server";

import { getApiUrl } from "@/lib/api/config";
import { backendLoginResponseSchema, loginSchema } from "@/lib/auth/schemas";
import { accessCookieName, refreshCookieName } from "@/lib/auth/session";

const accessMaxAge = 15 * 60;
const refreshMaxAge = 7 * 24 * 60 * 60;

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  return !origin || origin === request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { message: "Solicitud no permitida." },
      { status: 403 },
    );
  }

  const body: unknown = await request.json().catch(() => null);
  const parsedRequest = loginSchema.safeParse(body);

  if (!parsedRequest.success) {
    return NextResponse.json(
      { message: "Los datos de acceso no son válidos." },
      { status: 400 },
    );
  }

  const apiUrl = getApiUrl();
  if (!apiUrl) {
    if (process.env.NODE_ENV === "development") {
      console.error("La URL pública de la API no tiene un formato válido.");
    }
    return NextResponse.json(
      { message: "Ocurrió un error inesperado al iniciar sesión." },
      { status: 500 },
    );
  }

  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${apiUrl}/api/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: parsedRequest.data.email.toLowerCase(),
        password: parsedRequest.data.password,
      }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      {
        message:
          "No fue posible conectar con el servidor. Revisa tu conexión e inténtalo nuevamente.",
      },
      { status: 503 },
    );
  }

  if (backendResponse.status === 400) {
    return NextResponse.json(
      { message: "El correo o la contraseña son incorrectos." },
      { status: 400 },
    );
  }

  if (backendResponse.status === 401) {
    return NextResponse.json(
      { message: "Tu sesión no pudo ser iniciada. Verifica tus credenciales." },
      { status: 401 },
    );
  }

  if (backendResponse.status === 429) {
    return NextResponse.json(
      {
        message:
          "Has realizado demasiados intentos. Espera un momento antes de volver a intentarlo.",
      },
      { status: 429 },
    );
  }

  if (!backendResponse.ok) {
    return NextResponse.json(
      { message: "Ocurrió un error inesperado al iniciar sesión." },
      { status: 502 },
    );
  }

  const backendBody: unknown = await backendResponse.json().catch(() => null);
  const parsedResponse = backendLoginResponseSchema.safeParse(backendBody);
  if (!parsedResponse.success) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "La respuesta de autenticación no tiene la estructura esperada.",
      );
    }
    return NextResponse.json(
      { message: "Ocurrió un error inesperado al iniciar sesión." },
      { status: 502 },
    );
  }

  const response = NextResponse.json({ user: parsedResponse.data.user });
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };

  response.cookies.set(accessCookieName, parsedResponse.data.access, {
    ...cookieOptions,
    maxAge: accessMaxAge,
  });
  if (parsedResponse.data.refresh) {
    response.cookies.set(refreshCookieName, parsedResponse.data.refresh, {
      ...cookieOptions,
      maxAge: refreshMaxAge,
    });
  }

  return response;
}
