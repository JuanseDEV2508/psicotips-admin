# PsicoTips Admin

Panel administrativo construido con Next.js.

## Configuración local

Requiere Node.js 20.9 o superior.

```bash
cp .env.example .env.local
npm install
npm run dev
```

En `.env.local`, configura la URL del backend:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Despliegue

1. Configura la variable de entorno `NEXT_PUBLIC_API_URL` en el proveedor de hosting con la URL HTTPS pública del backend, sin secretos.
2. Comprueba que el backend permita el origen del frontend mediante CORS.
3. Usa Node.js 20.9 o superior durante la compilación.
4. Ejecuta:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

La aplicación mantiene los tokens de sesión en cookies HttpOnly. No agregues secretos de n8n, Meta o WhatsApp a las variables públicas.
