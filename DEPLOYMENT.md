# Despliegue — El Observador Cubano

**Estado:** no se ha creado ningún repositorio remoto, cuenta de servicio ni despliegue.
**Fecha:** 6 de noviembre de 2026

Este documento describe el procedimiento previsto y lo separa de lo ya ejecutado. Nada de la sección 6
se ha realizado todavía.

---

## 1. Topología objetivo

```text
Repositorio privado en GitHub
   │
   ├── GitHub Actions: lint, tipos, pruebas, build y E2E
   │
   └── Vercel: preview por PR y producción desde la rama protegida
          │
          ├── Neon PostgreSQL: rama efímera por preview, base de producción
          ├── Cloudflare R2: imágenes, audio y PDF (fase 3)
          ├── Resend: correo transaccional y boletín (fase 4)
          └── Cloudflare DNS/WAF: dominio definitivo (fase 8)
```

Mientras no se compre dominio se usará un subdominio gratuito `*.vercel.app`, tal como se acordó. No
se comprará nada sin autorización expresa.

---

## 2. Requisitos previos

| Requisito | Estado |
|---|---|
| Git local | Instalado (2.56.0) |
| Node.js 24 y npm 11 | Instalados |
| Repositorio privado en GitHub | **Pendiente**: falta autenticación con token o `gh auth login` |
| Cuenta de Vercel | **Pendiente** de autorización |
| Base de datos Neon | **Pendiente** de autorización |
| Bucket R2 | Fase 3 |
| Cuenta Resend | Fase 4 |
| Dominio propio | Fase 8; no se compra ahora |

No se han abierto cuentas de servicio ni se han aceptado términos en nombre del propietario.

---

## 3. Variables de entorno

| Variable | Entorno | Obligatoria | Notas |
|---|---|:--:|---|
| `NEXT_PUBLIC_SITE_URL` | Todos | Recomendada | Sin ella, `robots` bloquea todo y las URLs canónicas apuntan a localhost |
| `DATABASE_URL` | Todos | Para datos y auth | PostgreSQL; en Vercel usar la cadena *pooled* de Neon |
| `BETTER_AUTH_SECRET` | Todos | Para auth | 32 bytes aleatorios; distinto por entorno |
| `BETTER_AUTH_URL` | Todos | Para auth | URL exacta del despliegue, sin barra final |
| `S3_ENDPOINT` | Fase 3 | No | R2 |
| `S3_REGION` | Fase 3 | No | `auto` en R2 |
| `S3_BUCKET` | Fase 3 | No | Separar preview y producción |
| `S3_ACCESS_KEY_ID` | Fase 3 | No | Secreto |
| `S3_SECRET_ACCESS_KEY` | Fase 3 | No | Secreto |
| `RESEND_API_KEY` | Fase 4 | No | Secreto |
| `EMAIL_FROM` | Fase 4 | No | Dominio verificado |
| `ANALYTICS_SALT` | Fase 6 | No | Sal para agregación |

Generar el secreto de autenticación:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Reglas:

- Un secreto distinto por entorno. Nunca se reutiliza el de local en producción.
- Los secretos se guardan en Vercel/GitHub, no en el repositorio.
- `.env` está ignorado; `.env.example` documenta las claves sin valores.
- La CLI de Prisma lee `.env`; Next.js lee `.env` y `.env.local`.

---

## 4. Puesta en marcha local

```bash
# 1. Dependencias (respeta el lockfile)
npm ci

# 2. Configuración
cp .env.example .env
# Edita .env: DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL y NEXT_PUBLIC_SITE_URL

# 3. Cliente Prisma
npm run db:generate

# 4. Base de datos (requiere PostgreSQL accesible)
npm run db:migrate

# 5. Desarrollo
npm run dev
```

Comprobaciones:

```bash
npm run check        # lint + tipos + pruebas unitarias
npm run build        # build de producción; no necesita base de datos
npm run start        # sirve el build en http://localhost:3000
npm run test:e2e     # Playwright; arranca next dev si no hay servidor
```

Sin PostgreSQL:

- `npm run build` funciona.
- `/api/health` responde **503** con `status: "degraded"` y `database: "down"`.
- Cualquier operación de auth falla al construir el cliente, con un mensaje que indica la variable
  faltante.

### Playwright en este equipo

El CDN de Playwright devuelve 403 por ubicación. Se usa el Edge instalado:

```powershell
$env:PLAYWRIGHT_CHANNEL = "msedge"
npm run test:e2e
```

En CI se instala Chromium y no se define `PLAYWRIGHT_CHANNEL`.

---

## 5. Migraciones de base de datos

| Entorno | Comando | Regla |
|---|---|---|
| Local | `npm run db:migrate` | Crea la migración y la aplica |
| CI / producción | `npm run db:deploy` | Solo aplica migraciones existentes |
| Exploración | `npm run db:studio` | Nunca contra producción sin autorización |

- **Nunca** `prisma db push` contra producción.
- Toda migración se revisa en un pull request antes de aplicarse.
- Se prueba primero en una rama de Neon o en local.
- Antes de una migración destructiva: copia verificada y plan de reversión.
- Las migraciones son *forward-only*. Para cambios incompatibles se usa el patrón expandir/contraer:
  1. añadir columnas o tablas compatibles;
  2. desplegar código que escriba en ambos formatos;
  3. migrar datos;
  4. retirar lo antiguo en una migración posterior.

Neon ofrece cadena *pooled* y *directa*. Para migraciones conviene la directa; para el runtime en
Vercel, la *pooled*. Si se usan ambas, ejecutar la migración con `DATABASE_URL` apuntando a la directa:

```powershell
$env:DATABASE_URL = "postgresql://...direct..."
npx prisma migrate deploy
```

Verificar el estado:

```bash
npm run db:status
```

---

## 6. Despliegue de prueba en Vercel (procedimiento, no ejecutado)

### 6.1 Crear el repositorio privado

Requisito: token de GitHub con permiso para crear repositorios, o `gh auth login`.

```bash
gh repo create el-observador-cubano --private --source=. --remote=origin --push
```

Alternativa manual: crear el repositorio vacío en GitHub y luego:

```bash
git remote add origin https://github.com/<cuenta>/el-observador-cubano.git
git push -u origin master
```

La rama local actual es `master`. Si se adopta `main`, renombrar antes de protegerla:

```bash
git branch -m master main
git push -u origin main
```

### 6.2 Importar en Vercel

1. Crear el proyecto desde el repositorio privado.
2. Framework: **Next.js** (detección automática).
3. Build command: `npm run build` (incluye `prisma generate`).
4. Install command: `npm ci`.
5. Node.js: 24 (coincide con `engines` y CI).
6. Definir las variables de entorno de la sección 3.
7. Desplegar.

No se configura un dominio propio en esta fase. Vercel asigna un `*.vercel.app`.

### 6.3 Base de datos

1. Crear el proyecto en Neon.
2. Copiar la cadena *pooled* a `DATABASE_URL` en Vercel.
3. Aplicar la migración desde local o CI con la cadena directa:

```bash
npm run db:deploy
```

4. Comprobar `/api/health`: debe devolver **200** y `database: "up"`.

No se ejecutan migraciones automáticamente en cada build: los *previews* comparten o ramifican la
base de datos y un build no debe modificar el esquema por sorpresa.

### 6.4 Indexación del despliegue de prueba

`robots` bloquea todo si `NEXT_PUBLIC_SITE_URL` no está definida. Para el primer despliegue de prueba
se recomienda **no definirla** hasta que exista `X-Robots-Tag: noindex` para *previews*. Si se define,
el sitio será indexable y las URLs canónicas apuntarán a la URL de Vercel.

Antes de producción:

- definir `NEXT_PUBLIC_SITE_URL` con la URL definitiva;
- añadir `noindex` a los *previews*;
- verificar `robots.txt` y `sitemap.xml`.

---

## 7. Integración continua

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) define dos trabajos:

| Trabajo | Qué hace |
|---|---|
| `quality` | `npm ci`, `prisma validate`, lint, tipos, pruebas unitarias y build |
| `e2e` | `npm ci`, instala Chromium, ejecuta Playwright y guarda el informe si falla |

- Se ejecuta en `push` y `pull_request` sobre `master`/`main`.
- Usa variables de entorno ficticias; no toca servicios reales.
- Cancela ejecuciones anteriores de la misma referencia.
- Node.js 24 y caché de npm.

Pendiente de añadir cuando haya base de datos:

- servicio PostgreSQL efímero para pruebas de integración;
- `prisma migrate deploy` contra esa base;
- pruebas de autenticación, MFA y permisos;
- análisis de accesibilidad con axe.

---

## 8. Verificación después de desplegar

Sustituir `<url>` por la URL del despliegue:

```powershell
curl.exe -s -o NUL -w "%{http_code}`n" https://<url>/
curl.exe -s -o NUL -w "%{http_code}`n" https://<url>/es
curl.exe -s -o NUL -w "%{http_code}`n" https://<url>/en/national
curl.exe -s -o NUL -w "%{http_code}`n" https://<url>/en/ultimas
curl.exe -s -o NUL -w "%{http_code}`n" https://<url>/api/health
curl.exe -s -o NUL -w "%{http_code}`n" https://<url>/robots.txt
curl.exe -s -o NUL -w "%{http_code}`n" https://<url>/sitemap.xml
```

Resultados esperados:

| Ruta | Esperado |
|---|---|
| `/` | 307 a `/es` |
| `/es` | 200, `lang="es"` |
| `/en/national` | 200, `lang="en"`, título «National» |
| `/en/ultimas` | 307 a `/en/latest` |
| `/api/health` | 200 si hay base de datos; 503 si no |
| `/robots.txt` | 200; `Disallow: /` si no hay URL pública |
| `/sitemap.xml` | 200 con las rutas localizadas |

Comprobar también:

- cabeceras de seguridad (sección 3.1 de [`SECURITY.md`](SECURITY.md));
- que el 404 localizado no muestre trazas ni rutas internas;
- que no aparezcan secretos en el HTML ni en los *source maps* públicos;
- que el despliegue de prueba no sea indexable.

---

## 9. Reversión

- **Aplicación:** Vercel permite volver a un despliegue anterior de inmediato. No se hace `git push
  --force`.
- **Base de datos:** las migraciones no se revierten automáticamente. Se restaura una copia verificada
  o se aplica una migración correctiva revisada.
- **Incidente de seguridad:** revocar sesiones, rotar secretos, desactivar el módulo afectado y seguir
  el procedimiento de `docs/08-plan-seguridad.md`.

---

## 10. Bloqueos actuales

1. Falta el token de GitHub o completar `gh auth login`; sin eso no se crea el repositorio privado.
2. No hay PostgreSQL local ni Neon; no se pueden probar migraciones, auth ni MFA.
3. No hay cuentas de Vercel, Neon, R2 ni Resend; no se ha desplegado nada.
4. El CDN de Playwright está bloqueado en este equipo; se usa Edge en local.
5. No hay dominio propio; se usará `*.vercel.app` cuando se autorice el despliegue.

Cada bloqueo se resuelve con una acción del propietario o con una cuenta de servicio autorizada. No se
simula ninguno.
