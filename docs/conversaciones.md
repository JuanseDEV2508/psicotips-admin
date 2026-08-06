# Vista de conversaciones

La navegación **Conversaciones** usa exclusivamente la superficie JWT de CRM. No
usa los endpoints de n8n ni expone secretos compartidos en el navegador.

## Bandeja

`GET /api/crm/conversations/` se consume a través del proxy local
`/api/crm/conversations/`. La vista inicia con 25 conversaciones y permite
filtrar por texto, uno o varios estados, modo de control y presencia del
formulario comercial. La paginación conserva los filtros activos y solicita
siempre el orden `-last_message_at`.

Cada fila muestra contacto, empresa, estado, modo de control, si tiene
formulario, fecha de actividad, número de mensajes y la vista previa devuelta
por el backend. Si no hay mensajes, se muestra “Sin mensajes todavía”.

## Hilo

Al abrir una fila se solicita `GET /api/crm/conversations/<id>/`. El hilo:

- pinta los mensajes en orden cronológico;
- incluye notas internas (valor por defecto del endpoint);
- no pide mensajes de sistema (`include_system=false`);
- mantiene el scroll dentro del panel del chat;
- se actualiza con el sondeo incremental existente
  `GET /api/crm/contacts/<contact_id>/conversation/live/`.

Desde el hilo también se puede enviar un mensaje o una nota interna, tomar la
conversación, pausarla o devolverla al bot. Esas acciones reutilizan los
endpoints por contacto ya existentes, siempre con el `conversation_id` del hilo:

- `POST /api/crm/contacts/<contact_id>/conversation/messages/`
- `POST /api/crm/contacts/<contact_id>/conversation/control/`

El servidor aplica los permisos de respuesta y control. Un `403` se muestra en
la pantalla sin perder el contenido del chat. La ficha del cliente sigue siendo
la ubicación para editar el formulario comercial.

## Proxy y autorización

El proxy de Next permite estas dos rutas y reenvía la cookie de sesión como
`Authorization: Bearer <access_token>` al backend:

- `GET /api/crm/conversations/`
- `GET /api/crm/conversations/<id>/`

El backend decide la autorización. Los errores de carga del detalle se muestran
como 404 de Next; la bandeja conserva la pantalla y muestra un mensaje de error.
