# Frontend: clientes y canales de WhatsApp

## Contexto técnico inicial

- App Router de Next.js (`app/`), TypeScript y Tailwind.
- La sesión guarda `access` y `refresh` en cookies HttpOnly (`lib/auth/session.ts`).
- `lib/api/config.ts` centraliza `NEXT_PUBLIC_API_URL`.
- `AdminShell` contiene la navegación administrativa y los componentes UI reutilizables están en `components/ui`.

## Endpoints JWT previstos

- `GET /api/crm/contacts/`
- `GET /api/crm/clients/stats/`
- `GET /api/crm/contacts/<id>/detail/`
- `GET /api/crm/contacts/<id>/conversation/`
- `GET /api/crm/contacts/<id>/conversation/live/`
- `POST /api/crm/contacts/<id>/conversation/messages/`
- `POST /api/crm/contacts/<id>/conversation/control/`
- `GET /api/crm/channels/`

No se consume ninguna ruta `/api/whatsapp/`: requiere el secreto de n8n y no es una superficie apta para el navegador.

## Flujo y seguridad

Las páginas iniciales se cargan en el servidor. Las acciones interactivas y el polling usan un proxy interno `/api/crm/*`; este lee la cookie HttpOnly y agrega `Authorization: Bearer` únicamente en el servidor. El token nunca se entrega a React.

El chat hace carga completa y después sondeo con el cursor devuelto por `conversation/live/`; los mensajes se deduplican por `id` y el efecto se cancela al cambiar de conversación o desmontar el componente. Los errores `403` se muestran como falta de permisos, sin cerrar sesión.

## Riesgos detectados

La instancia actualmente configurada puede estar en una versión anterior del backend: ya devolvió empresas como arreglo plano y `clients/stats/` con una respuesta no exitosa. Los endpoints nuevos de contactos, detalle, conversación y canales deben estar desplegados para que sus vistas tengan datos.

## Implementación

- Rutas: `/clientes`, `/clientes/[id]` y `/channels`.
- Componentes: `ClientsScreen`, `ContactDetailScreen` y `ChannelsScreen`.
- Servicios: `features/crm/services/server.ts` para la carga inicial y `features/crm/services/client.ts` para el chat. `app/api/crm/[...path]/route.ts` es el proxy interno restringido a los endpoints CRM necesarios.
- El listado usa `GET /contacts/`. Las tarjetas usan `GET /clients/stats/` cuando la instancia lo ofrece; si falla, el listado sigue disponible y las tarjetas muestran que no están disponibles.
- La ficha carga `GET /contacts/<id>/detail/`; la conversación se carga con `GET /conversation/` y se mantiene actualizada con `GET /conversation/live/` cada intervalo del backend (3 s como respaldo). El cursor se actualiza y los mensajes se deduplican por UUID.
- Enviar mensajes, notas internas y control de bot usan los respectivos POST documentados. Un `403` se presenta como falta de permisos. Un `409` solicita confirmación antes de repetir la toma con `force: true`.

## Limitaciones conocidas

- La ruta de detalle de caso comercial aún no existe en este frontend. Se muestra el identificador del caso asociado, sin crear una ruta ficticia.
- El proyecto no trae infraestructura de pruebas automatizadas; se ejecutaron lint y TypeScript. El build requiere Node 20.9 o superior; el entorno actual usa Node 18.20.8.

## Variables de entorno

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

En producción se debe sustituir por la URL real del backend.
