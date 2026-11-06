# 13 · Fase 1 — Fundación

**Fecha de cierre:** 6 de noviembre de 2026
**Estado:** implementación local completada y verificada. **Sin despliegue** y con el criterio de
salida pendiente de la base de datos.
**Alcance:** infraestructura, esqueleto público, sistema de diseño, modelo de datos, autenticación/RBAC,
pruebas y documentación.

---

## 1. Resumen

La Fase 1 deja un repositorio que compila, pasa lint y tipos, ejecuta 16 pruebas unitarias y 3 pruebas
E2E, y genera 41 páginas estáticas. El sitio responde en español e inglés con URLs localizadas reales.

No se ha creado el repositorio remoto, no hay PostgreSQL y no se ha desplegado nada. Por tanto, **no se
afirma que la Fase 1 esté cerrada**: falta ejecutar el criterio de salida con una base de datos real.

---

## 2. Entregables del plan

| Entregable de `docs/10-plan-desarrollo.md` | Estado | Evidencia |
|---|---|---|
| Repositorio privado, rama `main` protegida, plantilla de PR y CI | **Parcial** | Plantilla y CI creados; repositorio remoto pendiente del token; la rama local es `master` |
| Next.js + TypeScript estricto + Tailwind + Radix | **Hecho** | Next 16.4.5, TS 5.9.3, Tailwind 4.3.5, Radix |
| Design tokens y componentes base | **Hecho** | `Button`, `Input`, `Container`, `Badge`, `SectionHeader`, `EmptyState`, cabecera y pie |
| PostgreSQL + Prisma + primera migración | **Parcial** | Esquema de 43 modelos y migración SQL generada; no aplicada por falta de servidor |
| Better Auth: registro interno, sesiones, MFA | **Parcial** | Configuración y RBAC; sin pantallas ni pruebas contra base de datos |
| RBAC base y comprobación en servidor | **Hecho** | 7 roles, 17 permisos, MFA por rol, helper de sesión |
| Entorno local, preview y producción de prueba | **No** | Sin cuentas ni despliegue; procedimiento en `DEPLOYMENT.md` |
| Dominio de pruebas y HTTPS | **No** | Se usará `*.vercel.app`; no se compra dominio |
| `ARCHITECTURE.md`, `SECURITY.md`, `DEPLOYMENT.md` | **Hecho** | En la raíz del repositorio |

---

## 3. Qué se construyó

### 3.1 Aplicación y rutas

- Next.js 16 con App Router, React 19 y Turbopack.
- Layout raíz localizado con `lang`, metadatos, `hreflang`, Open Graph y `robots`.
- Portada, 11 secciones, últimas, búsqueda, acerca, radio, edición impresa y privacidad.
- 404 localizado en español e inglés.
- `robots.txt`, `sitemap.xml` e icono SVG.
- Cabecera con navegación de escritorio, menú móvil Radix, menú «Más», buscador, selector de idioma y
  selector de tema.
- Pie con navegación, aviso de borrador y año dinámico.

Todas las páginas muestran **estados vacíos explícitos**. No se inventaron noticias, autores ni textos
de ejemplo presentados como reales.

### 3.2 Internacionalización

- `next-intl` 4.14.9 con `pathnames` y `localePrefix: "always"`.
- Español por defecto; inglés con revisión humana.
- El slug interno es el español. El proxy reescribe la URL pública y redirige las variantes no
  canónicas con 307.
- El selector de idioma conserva la página actual y traduce el primer segmento.

Ejemplos verificados:

| URL | Resultado |
|---|---|
| `/en/national` | 200, `lang="en"`, título «National» |
| `/en/nacional` | 307 a `/en/national` |
| `/es/national` | 307 a `/es/nacional` |
| `/en/ultimas` | 307 a `/en/latest` |
| `/es/latest` | 307 a `/es/ultimas` |
| `/en/about` | 200 |
| `/en/acerca` | 307 a `/en/about` |
| `/es/about` | 307 a `/es/acerca` |

### 3.3 Sistema de diseño

- Tokens de color, tipografía, espaciado y radios en `src/styles/globals.css`.
- Tipografías Newsreader e Inter con `next/font`.
- Tema claro/oscuro sin parpadeo: script previo a la hidratación y dos botones intercambiados por CSS.
- Foco visible, enlace «Saltar al contenido», `prefers-reduced-motion`, tamaños mínimos de toque.
- Logotipo tipográfico provisional y original.

### 3.4 Modelo de datos

- Prisma 7.10.1 con generador `prisma-client` en `src/generated/prisma` y adaptador `@prisma/adapter-pg`.
- **43 modelos y 15 enumeraciones** basados en `docs/05-modelo-datos.md`: usuarios, sesiones, MFA,
  autores, artículos, traducciones, revisiones, taxonomía, medios, comentarios, boletín, radio, impreso,
  donaciones, publicidad, analítica, auditoría, redirecciones e importación.
- Migración inicial `prisma/migrations/20261106000000_init/migration.sql` con `citext`.
- `prisma validate` pasa; el cliente se genera correctamente.
- No se ha aplicado la migración: no hay PostgreSQL local ni remoto.

### 3.5 Autenticación y autorización

- Better Auth 1.7.18 con adaptador Prisma, sesiones en base de datos y plugin `twoFactor`.
- Instancia perezosa (`getAuth()`) para que el build no dependa de la base de datos ni del secreto.
- Alta pública **deshabilitada**; las cuentas serán internas.
- Contraseña mínima de 12 caracteres; sesiones de 30 días con actualización diaria.
- 7 roles y 17 permisos en `src/lib/rbac.ts`.
- `EDITOR` revisa pero **no publica**; `OWNER`, `ADMIN` y `EDITOR_IN_CHIEF` publican.
- MFA exigida a `OWNER`, `ADMIN`, `EDITOR_IN_CHIEF`, `EDITOR` y `MODERATOR`.
- `src/lib/auth/session.ts` comprueba sesión, estado, rol, MFA y permiso en servidor.

### 3.6 Seguridad

- Cabeceras `nosniff`, `DENY`, `Referrer-Policy`, `Permissions-Policy`, COOP y CORP.
- CSP en `Report-Only` con `'unsafe-inline'`; el endurecimiento con nonces/hashes queda pendiente.
- Sin HSTS hasta tener dominio y HTTPS.
- `allowedDevOrigins` solo para desarrollo.
- `.env` ignorado; `.env.example` versionado sin secretos.

### 3.7 Pruebas, CI y documentación

- Vitest 5.1.0: **16 pruebas** de RBAC y rutas localizadas.
- Playwright 1.65.0: **3 pruebas E2E** (portada, slug inglés, 404).
- GitHub Actions: lint, tipos, pruebas, build y E2E.
- Plantilla de pull request con comprobaciones y aviso de seguridad/privacidad.
- `ARCHITECTURE.md`, `SECURITY.md`, `DEPLOYMENT.md` y este informe.

---

## 4. Evidencia de ejecución

Comandos ejecutados en este equipo el 6 de noviembre de 2026:

| Comando | Resultado |
|---|---|
| `npm run lint` | Pasa, sin errores ni avisos |
| `npm run typecheck` | Pasa (`next typegen && tsc --noEmit`) |
| `npm run test` | 2 archivos, **16 pruebas pasan** |
| `npx prisma validate` | «The schema is valid» |
| `npm run build` | Pasa; **41 páginas estáticas** |
| `npm run test:e2e` | **3 pruebas pasan** con Edge local |
| `curl /api/health` sin base de datos | **503** controlado |

Rutas comprobadas con el servidor de producción (`next start`):

| Ruta | Código | Observación |
|---|---:|---|
| `/` | 307 | Redirige a `/es` |
| `/es` | 200 | `lang="es"` |
| `/en` | 200 | `lang="en"` |
| `/es/nacional` | 200 | Sección en español |
| `/en/national` | 200 | Sección en inglés |
| `/en/latest` | 200 | Últimas en inglés |
| `/en/ultimas` | 307 | Redirige a `/en/latest` |
| `/es/esta-ruta-no-existe` | 404 | 404 localizado |
| `/robots.txt` | 200 | Generado |
| `/sitemap.xml` | 200 | Generado |

Cabeceras verificadas en `/es`: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
`Permissions-Policy`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy` y
`Content-Security-Policy-Report-Only`.

### Pruebas E2E y bloqueo del CDN

El CDN de Playwright devuelve **403 por ubicación** en este equipo, por lo que Chromium no se puede
descargar. Las pruebas se ejecutaron con el Edge instalado:

```powershell
$env:PLAYWRIGHT_CHANNEL = "msedge"
npm run test:e2e
```

En GitHub Actions se instalará Chromium con `npx playwright install --with-deps chromium`. Esa ruta de
CI **no se ha ejecutado todavía** porque el repositorio remoto no existe.

---

## 5. Correcciones realizadas durante la verificación

La verificación encontró problemas reales que se corrigieron antes de documentar:

1. **Hidratación bloqueada por origen de desarrollo.** Playwright usaba `127.0.0.1` mientras Next
   anunciaba `localhost`; Next 16 bloquea los recursos de desarrollo y la página 404 quedaba sin
   hidratar. Se añadió `allowedDevOrigins: ["127.0.0.1", "localhost"]` y la URL por defecto de
   Playwright pasó a `localhost:3000`.
2. **Registro público abierto.** El comentario decía que estaba cerrado, pero la configuración no lo
   impedía. Se añadió `disableSignUp: true`.
3. **RBAC incoherente con el plan de seguridad.** `EDITOR` podía publicar y archivar, y `MODERATOR` no
   exigía MFA. Se alineó la matriz con `docs/08-plan-seguridad.md` y se añadieron pruebas.
4. **TypeScript menos estricto que la documentación.** Se activó `exactOptionalPropertyTypes` y se
   corrigieron los dos errores que aparecieron en `playwright.config.ts` y `prisma7.config.ts`.
5. **Convención de middleware de Next 16.** Se usa `src/proxy.ts`, no `middleware.ts`; el build lo
   reconoce como «Proxy (Middleware)».

---

## 6. Criterio de salida de la Fase 1

> «Un usuario `OWNER` crea otro usuario, ambos inician sesión con MFA y los permisos se verifican con
> pruebas automatizadas.»

| Elemento | Estado |
|---|---|
| Un `OWNER` crea otro usuario | **No implementado**: falta la pantalla o endpoint de administración y la base de datos |
| Ambos inician sesión con MFA | **No probado**: configuración lista, flujo real pendiente |
| Permisos verificados con pruebas automatizadas | **Parcial**: 16 pruebas unitarias cubren la matriz; faltan pruebas de integración con sesiones reales |

**Conclusión:** el criterio de salida **no se cumple todavía**. La fundación está lista para continuar,
pero no se puede declarar la Fase 1 cerrada sin PostgreSQL y sin los flujos de autenticación.

---

## 7. Bloqueos y pendientes

### Bloqueos externos

1. **GitHub:** falta el Personal Access Token o completar `gh auth login`. Sin eso no se crea el
   repositorio privado ni se ejecuta CI.
2. **PostgreSQL:** no hay instancia local ni Neon. Bloquea migraciones, auth, MFA y pruebas de
   integración.
3. **Cuentas de servicio:** Vercel, Neon, R2 y Resend no se han abierto; requieren autorización.
4. **CDN de Playwright:** bloqueado en este equipo; se usa Edge local.
5. **Dominio:** no se compra en esta fase; se usará `*.vercel.app`.
6. **Contenido:** faltan XML de Blogger, materiales de radio/PDF, autores y equipo editorial.

### Trabajo pendiente inmediato

- Pantallas de inicio de sesión, enrolamiento MFA y recuperación.
- Administración de usuarios con `user.manage` comprobado en servidor.
- Aplicar la migración en una base real y ejecutar pruebas de integración.
- Añadir `noindex` a los *previews*.
- Endurecer la CSP y retirar `'unsafe-inline'`.
- Rate limiting y auditoría de acciones.
- Desplegar el entorno de prueba en Vercel.

---

## 8. Siguiente fase

La Fase 2 (portal editorial) necesita contenido real y una base de datos. Antes de empezar conviene:

1. Crear el repositorio privado y ejecutar CI.
2. Crear la base de datos y aplicar la migración.
3. Completar el mínimo de autenticación para cumplir el criterio de salida.
4. Definir la taxonomía y los autores con el propietario.
5. Obtener el XML de Blogger y los materiales pendientes.

Mientras esas dependencias no estén resueltas, se puede avanzar en el CMS y en las plantillas de
artículo con datos de prueba **aislados**, nunca publicados como contenido real.

---

## 9. Archivos principales de esta fase

| Archivo | Función |
|---|---|
| `src/app/[locale]/layout.tsx` | Layout, fuentes, tema, cabecera y pie |
| `src/app/[locale]/[section]/page.tsx` | Secciones localizadas |
| `src/i18n/routing.ts` | Locales, `pathnames` y slugs |
| `src/proxy.ts` | Middleware de next-intl |
| `src/lib/rbac.ts` | Roles, permisos y MFA |
| `src/lib/auth/index.ts` | Better Auth y plugins |
| `src/lib/db.ts` | Prisma 7 + adaptador PostgreSQL |
| `prisma/schema.prisma` | Modelo de datos |
| `prisma/migrations/20261106000000_init/migration.sql` | Migración inicial |
| `next.config.ts` | Cabeceras, CSP y origen de desarrollo |
| `tests/unit/*` | RBAC y rutas |
| `tests/e2e/smoke.spec.ts` | Portada, slug inglés y 404 |
| `.github/workflows/ci.yml` | Integración continua |
| `ARCHITECTURE.md`, `SECURITY.md`, `DEPLOYMENT.md` | Documentación operativa |

---

## 10. Nota de honestidad

No se ha desplegado nada, no se ha aplicado ninguna migración y no se ha probado el inicio de sesión
real. Las cifras de pruebas y de build corresponden a este equipo y a este repositorio local. Todo lo
que falta está listado arriba y no se presenta como terminado.
