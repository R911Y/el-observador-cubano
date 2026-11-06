# Arquitectura — El Observador Cubano

Documento operativo de la implementación. Desarrolla las decisiones de
[`docs/04-arquitectura-tecnica.md`](docs/04-arquitectura-tecnica.md) y registra lo que ya existe en el
repositorio, no lo que se planea a futuro.

**Última actualización:** 6 de noviembre de 2026
**Estado:** Fase 1 (fundación) implementada; despliegue y flujos con base de datos pendientes.

---

## 1. Principios

- **Monolito modular**: un solo despliegue, límites por dominio y adaptadores para servicios externos.
  No hay microservicios.
- **Servidor primero**: la autorización, la validación y el renderizado de contenido ocurren en el
  servidor. El cliente solo mejora la interacción.
- **Contenido real o estado vacío**: nunca se inventan noticias, autores ni resultados de pruebas.
- **Privacidad por defecto**: sin cookies no esenciales, sin analítica de terceros y sin datos
  personales mientras no exista una finalidad y una base jurídica documentadas.
- **Portabilidad**: PostgreSQL estándar, almacenamiento S3-compatible y exportación prevista de
  contenido y suscriptores.

---

## 2. Stack implementado

Versiones fijadas en `package.json` y `package-lock.json`:

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router, Turbopack) | 16.4.5 |
| UI | React / React DOM | 19.3.0 |
| Lenguaje | TypeScript | 5.9.3 |
| Estilos | Tailwind CSS + `@tailwindcss/turbopack` | 4.3.5 |
| Primitivas accesibles | Radix UI (`dialog`, `dropdown-menu`) | 1.3.1 / 2.2.1 |
| Base de datos | PostgreSQL + Prisma | 7.10.1 |
| Adaptador | `@prisma/adapter-pg` + `pg` | 7.10.1 / 8.23.1 |
| Autenticación | Better Auth (Prisma adapter, `twoFactor`) | 1.7.18 |
| i18n | `next-intl` | 4.14.9 |
| Validación | Zod | 4.6.7 |
| Iconos | Lucide React | 1.70.0 |
| Pruebas unitarias | Vitest + Testing Library + jsdom | 5.1.0 |
| Pruebas E2E | Playwright | 1.65.0 |
| Lint | ESLint + `eslint-config-next` | 9.39.5 / 16.4.5 |

TypeScript usa `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` y
`noFallthroughCasesInSwitch`.

---

## 3. Estructura actual del repositorio

```text
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx              # html/body, fuentes, tema, cabecera y pie
│   │   ├── page.tsx                # portada
│   │   ├── [section]/page.tsx      # 11 secciones, slug interno en español
│   │   ├── ultimas/page.tsx
│   │   ├── buscar/page.tsx
│   │   ├── acerca/page.tsx
│   │   ├── radio/page.tsx
│   │   ├── edicion-impresa/page.tsx
│   │   ├── privacidad/page.tsx
│   │   └── not-found.tsx
│   ├── api/
│   │   ├── auth/[...all]/route.ts  # handler de Better Auth
│   │   └── health/route.ts         # comprobación de base de datos
│   ├── icon.svg
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── editorial/                  # SectionHeader, EmptyState
│   ├── layout/                     # cabecera, pie, menús, tema, idioma, wordmark
│   └── ui/                         # Button, Input, Container, Badge
├── generated/prisma/               # cliente generado (ignorado por Git)
├── i18n/
│   ├── messages/{es,en}.json
│   ├── request.ts
│   └── routing.ts
├── lib/
│   ├── auth/{index,client,session}.ts
│   ├── db.ts
│   ├── env.ts
│   ├── rbac.ts
│   ├── routes.ts
│   ├── sections.ts
│   └── utils.ts
├── styles/globals.css
└── proxy.ts                        # middleware de next-intl (convención de Next 16)

prisma/
├── schema.prisma                   # 43 modelos, 15 enumeraciones
└── migrations/
    ├── 20261106000000_init/migration.sql
    └── migration_lock.toml

tests/
├── unit/{rbac,routes}.test.ts
└── e2e/smoke.spec.ts
```

Reglas de dependencia vigentes:

- `app/` compone páginas y rutas; no contiene reglas de negocio.
- `lib/` agrupa infraestructura y reglas transversales (auth, datos, RBAC, rutas).
- `components/` no accede a la base de datos.
- Los módulos de dominio (`modules/articles`, `modules/users`, etc.) se incorporarán en las fases 2–3
  siguiendo la separación de `docs/04-arquitectura-tecnica.md`.

---

## 4. Rutas, renderizado y caché

| Ruta | Estrategia | Evidencia |
|---|---|---|
| `/` | Redirección a `/es` | 307 verificado |
| `/[locale]` | Estática/ISR (`revalidate = 300`) | 2 páginas prerenderizadas |
| `/[locale]/[section]` | Estática/ISR (`revalidate = 300`) | 22 rutas (11 secciones × 2 idiomas) |
| `/[locale]/ultimas` | Estática/ISR (`revalidate = 300`) | 2 páginas |
| `/[locale]/acerca`, `radio`, `edicion-impresa`, `privacidad` | Estáticas | 8 páginas |
| `/[locale]/buscar` | Dinámica por `searchParams` | Marcada `ƒ` en el build |
| `/api/auth/[...all]` | Dinámica, `force-dynamic` | Marcada `ƒ` |
| `/api/health` | Dinámica, `no-store` | 503 sin base de datos |
| `/robots.txt`, `/sitemap.xml`, `/icon.svg` | Estáticas | Generadas en build |

El build de producción genera **41 páginas estáticas**. La portada, las secciones y las páginas
institucionales no leen cookies ni cabeceras, por lo que pueden servirse desde caché.

---

## 5. Internacionalización

- Idiomas: **español (por defecto)** e **inglés**, siempre con prefijo (`/es`, `/en`).
- `next-intl` declara los `pathnames` en [`src/i18n/routing.ts`](src/i18n/routing.ts). El segmento
  interno de la ruta es el slug español; el proxy reescribe la URL pública al slug interno antes de
  renderizar.
- Ejemplos verificados:
  - `/en/national` → renderiza la sección `nacional` con `lang="en"`.
  - `/en/nacional` → 307 a `/en/national`.
  - `/es/national` → 307 a `/es/nacional`.
  - `/en/ultimas` → 307 a `/en/latest`.
  - `/es/latest` → 307 a `/es/ultimas`.
- `src/lib/routes.ts` conserva la página actual al cambiar de idioma y traduce el primer segmento.
- Los mensajes viven en `src/i18n/messages/{es,en}.json`. No hay traducción automática publicada.
- El contenido traducido de artículos se almacenará en `ArticleTranslation` (fase 2), con estado y
  revisor humano.

---

## 6. Capa de datos

- Prisma 7 con el generador `prisma-client` en `src/generated/prisma` (no el antiguo
  `@prisma/client` generado en `node_modules`).
- El runtime usa `@prisma/adapter-pg`; no hay motor binario de Prisma.
- [`src/lib/db.ts`](src/lib/db.ts) crea el cliente de forma perezosa, lo reutiliza en desarrollo y
  exige `DATABASE_URL` con un mensaje claro.
- La URL de la CLI vive en `prisma7.config.ts` (Prisma 7 no la lee del `schema.prisma`).
- Esquema: **43 modelos y 15 enumeraciones**, basado en `docs/05-modelo-datos.md`.
- Migración inicial: `prisma/migrations/20261106000000_init/migration.sql`, con
  `CREATE EXTENSION IF NOT EXISTS "citext"` para correos sin distinción de mayúsculas.
- Estrategia: `prisma migrate dev` en local, `prisma migrate deploy` en entornos compartidos. Nunca
  `db push` contra producción.

Comandos:

```bash
npm run db:validate   # valida el esquema
npm run db:generate   # regenera el cliente
npm run db:migrate    # crea/aplica migraciones en local
npm run db:deploy     # aplica migraciones pendientes
npm run db:status     # estado de migraciones
npm run db:studio     # explorador de datos
```

Limitación actual: no hay PostgreSQL local ni remoto, por lo que **la migración no se ha aplicado**
todavía. El build no necesita base de datos.

---

## 7. Autenticación y autorización

### Better Auth

- [`src/lib/auth/index.ts`](src/lib/auth/index.ts) construye la instancia de forma **perezosa**
  (`getAuth()`), para que `next build` no requiera base de datos ni secreto.
- Adaptador Prisma con proveedor `postgresql`.
- Correo y contraseña habilitados, pero **alta pública deshabilitada** (`disableSignUp: true`): las
  cuentas son internas y se crearán desde administración.
- Contraseña mínima de 12 caracteres y máxima de 128.
- Sesiones de 30 días con actualización cada 24 horas. Better Auth aplica cookies `HttpOnly`,
  `SameSite` y `Secure` en producción.
- Plugin `twoFactor` (TOTP y códigos de recuperación) y `nextCookies()` al final.
- Campos adicionales `role` y `status` no editables por el cliente (`input: false`).

### RBAC

[`src/lib/rbac.ts`](src/lib/rbac.ts) define 7 roles y 17 permisos. La matriz sigue
`docs/08-plan-seguridad.md`:

- `OWNER` y `ADMIN`: todos los permisos.
- `EDITOR_IN_CHIEF`: ciclo editorial completo, páginas, boletín, traducciones y moderación; **no**
  administra usuarios, configuración ni auditoría.
- `EDITOR`: crea, edita, envía a revisión y revisa; **no publica, no archiva y no administra**.
- `JOURNALIST`: crea y edita sus borradores, los envía a revisión y sube medios.
- `TRANSLATOR`: solo traducción.
- `MODERATOR`: solo moderación de comentarios.

MFA obligatoria para `OWNER`, `ADMIN`, `EDITOR_IN_CHIEF`, `EDITOR` y `MODERATOR`.

`src/lib/auth/session.ts` comprueba en servidor: sesión existente, cuenta activa, rol válido, MFA
cuando corresponde y permiso concreto. Ninguna comprobación se delega al cliente.

### Pendiente

No existen todavía pantallas de inicio de sesión, alta de segundo factor ni administración de
usuarios. El criterio de salida de la Fase 1 («un `OWNER` crea otro usuario, ambos inician sesión con
MFA») **no puede verificarse hasta disponer de PostgreSQL** y de esas pantallas.

---

## 8. Sistema de diseño

- Tokens CSS en [`src/styles/globals.css`](src/styles/globals.css): papel cálido, tinta carbón, rojo
  editorial, tipografía serif para titulares y sans para interfaz.
- Tipografías `Newsreader` e `Inter` con `next/font` (autohospedadas en el build).
- Componentes base: `Button`, `Input`, `Container`, `Badge`, `SectionHeader`, `EmptyState`.
- Cabecera con menú móvil Radix, menú «Más», selector de idioma y selector de tema.
- Tema claro/oscuro sin parpadeo: un script mínimo aplica `data-theme` antes de pintar; el selector
  usa dos botones intercambiados por CSS y no lee `localStorage` durante la hidratación.
- Foco visible, enlace «Saltar al contenido», `lang` correcto y movimiento reducido respetado.
- El logotipo es tipográfico y provisional; no se usan marcas ni tipografías propietarias de terceros.

---

## 9. Seguridad de aplicación

Cabeceras aplicadas en [`next.config.ts`](next.config.ts) a todas las respuestas:

| Cabecera | Valor actual |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | cámara, micrófono, geolocalización, pago y USB desactivados |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `Cross-Origin-Resource-Policy` | `same-site` |
| `Content-Security-Policy-Report-Only` | `default-src 'self'`; scripts y estilos con `'unsafe-inline'`; `object-src 'none'`; `frame-ancestors 'none'` |

- La CSP está en **modo informe** y todavía usa `'unsafe-inline'`. Antes de producción debe pasar a
  modo bloqueo con nonces/hashes (ver [`SECURITY.md`](SECURITY.md)).
- No se envía HSTS hasta disponer de dominio y HTTPS verificados.
- `poweredByHeader: false` y `reactStrictMode: true`.
- `allowedDevOrigins` autoriza `127.0.0.1` y `localhost` solo en desarrollo; sin ello, Next 16 bloquea
  los recursos de desarrollo y la página no hidrata.
- Indexación: `robots` bloquea todo si falta `NEXT_PUBLIC_SITE_URL`. En producción deberá añadirse
  `noindex` a los *previews*.

---

## 10. Configuración y entornos

Variables documentadas en [`.env.example`](.env.example):

| Variable | Uso | ¿Obligatoria ahora? |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL pública y metadatos | Sí para indexar; el build funciona sin ella |
| `DATABASE_URL` | PostgreSQL (Next y Prisma CLI) | Solo para datos, migraciones y auth |
| `BETTER_AUTH_SECRET` | Firma de sesiones | Sí para ejecutar auth |
| `BETTER_AUTH_URL` | URL base de Better Auth | Sí para ejecutar auth |
| `S3_*` | Cloudflare R2 | Fase 3 |
| `RESEND_*` | Correo transaccional | Fase 4 |
| `ANALYTICS_SALT` | Analítica agregada | Fase 6 |

- `.env` está ignorado por Git; `.env.example` sí se versiona.
- La CLI de Prisma lee `.env` mediante `dotenv/config`. Next.js lee `.env` y `.env.local`.
- En CI se usan valores ficticios para poder compilar y probar sin servicios reales.

Entornos previstos:

| Entorno | Rama | Base de datos | URL |
|---|---|---|---|
| Local | cualquiera | PostgreSQL local o Neon de desarrollo | `http://localhost:3000` |
| Preview | pull request | Rama efímera de Neon | `*.vercel.app` |
| Producción | `main` protegida | Neon de producción | dominio propio (fase 8) |

---

## 11. Pruebas

| Nivel | Comando | Estado actual |
|---|---|---|
| Unitarias | `npm run test` | **16 pruebas en 2 archivos** |
| Tipos | `npm run typecheck` | Pasa |
| Lint | `npm run lint` | Pasa |
| E2E | `npm run test:e2e` | **3 pruebas** (portada, slug inglés, 404) |
| Build | `npm run build` | Pasa; 41 páginas estáticas |

Las pruebas E2E usan `localhost:3000` por defecto y arrancan `next dev` si no se define
`PLAYWRIGHT_BASE_URL`. En este equipo el CDN de Playwright devuelve 403 por ubicación, así que se
ejecutan con el Edge instalado:

```powershell
$env:PLAYWRIGHT_CHANNEL = "msedge"
npm run test:e2e
```

En GitHub Actions se instala Chromium con `npx playwright install --with-deps chromium`.

---

## 12. Despliegue objetivo

No se ha creado ninguna cuenta ni despliegue todavía. La topología prevista es:

```text
GitHub (privado) → GitHub Actions (lint, tipos, pruebas, build, E2E)
                  → Vercel (SSR/ISR, previews por PR)
                  → Neon PostgreSQL (rama por preview, PITR en producción)
                  → Cloudflare R2 (imágenes, audio, PDF)
                  → Resend (correo transaccional y boletín)
                  → Cloudflare DNS/WAF (dominio definitivo, fase 8)
```

Mientras no se compre dominio se usará un subdominio gratuito `*.vercel.app`. El procedimiento está en
[`DEPLOYMENT.md`](DEPLOYMENT.md).

---

## 13. Decisiones registradas

| Decisión | Motivo | Consecuencia |
|---|---|---|
| Next.js App Router con `proxy.ts` | Next 16 sustituye `middleware.ts` por `proxy.ts` | El matcher excluye API y recursos internos |
| `next-intl` con `pathnames` | URLs localizadas reales (`/en/national`) sin duplicar páginas | El slug interno es el español; el proxy redirige los demás |
| Prisma 7 con `prisma-client` y `adapter-pg` | Requisito de Prisma 7; sin motor binario | El cliente se genera en `src/generated/prisma` |
| Better Auth perezoso | El build no debe depender de la base de datos | Los errores de configuración aparecen al usar auth, no al compilar |
| Alta pública deshabilitada | Medio con cuentas internas, no una red social | La creación de usuarios requiere administración |
| RBAC propio | Reglas editoriales más estrictas que un plugin genérico | 7 roles, 17 permisos y MFA por rol |
| CSP en `Report-Only` | Next/Tailwind inyectan estilos y scripts en línea | Debe endurecerse antes de producción |
| Sin CMS ni contenido de ejemplo | No se inventan noticias ni autores | Las páginas muestran estados vacíos explícitos |

---

## 14. Deuda técnica y límites conocidos

1. **Sin base de datos**: migración, auth, MFA y sesiones no se han probado contra PostgreSQL.
2. **Sin pantallas de auth**: no hay login, enrolamiento MFA ni alta de usuarios.
3. **CSP no aplicada**: solo informe y con `'unsafe-inline'`.
4. **Sin rate limiting distribuido**: se definirá con Upstash en la fase de seguridad.
5. **Sin auditoría escrita**: el modelo `AuditLog` existe, pero aún no hay operaciones que lo usen.
6. **Sin Zod en formularios**: la dependencia está instalada; los formularios reales llegan con el CMS.
7. **Sin uploads**: R2 y el procesamiento de imágenes son fase 3.
8. **`npm audit` reporta 8 vulnerabilidades moderadas** en la cadena de ESLint (`minimatch`). La
   corrección automática propone una versión incompatible de `eslint-config-next`; no se aplica
   `--force`.
9. **Previews indexables**: falta `X-Robots-Tag: noindex` para despliegues de prueba.
10. **Sin dominio ni HTTPS de prueba**: no se ha comprado nada.

Ninguno de estos puntos se considera resuelto por el hecho de que el build pase.
