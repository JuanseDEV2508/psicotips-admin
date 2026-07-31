import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El correo electrónico es obligatorio.")
    .email("Ingresa un correo electrónico válido."),
  password: z.string().min(1, "La contraseña es obligatoria."),
});

export const backendLoginResponseSchema = z.object({
  access: z.string().min(1),
  refresh: z.string().optional().default(""),
  user: z.object({
    pk: z.number().int(),
    email: z.string().email(),
    first_name: z.string(),
    last_name: z.string(),
  }),
});
