# 04 · Arquitectura técnica

**Principio rector:** monolito modular desplegable en Vercel, con límites de dominio
explícitos y adaptadores para todo servicio externo. No se construyen microservicios.

---

## 1. Stack

| Capa | Tecnología | Notas |
|---|---|---|
| Framework | Next.js (App Router) | Versión estable fijada al iniciar la Fase 1, con `package-lock.json` |
| Lenguaje | TypeScript estricto | `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` |
| UI | React + Tailwind CSS + primitivas Radix | Componentes propios; no se adopta una plantilla visual de terceros |
| Base de datos | PostgreSQL 16+ | Neon (rama por *preview*) o equivalente |
| ORM | Prisma | Migraciones versionadas; sin `db push` en producción |
| Autenticación | Better Auth | Sesiones en base de datos, TOTP/WebAuthn, RBAC |
| Validación | Zod | En formularios, rutas, webhooks y variables de entorno |
| Editor | TipTap (ProseMirror) | Esquema restringido; se guarda JSON y se renderiza en servidor |
| i18n | `next-intl` | Rutas localizadas y contenido traducido en base de datos |
| Correo | Resend tras una interfaz `EmailProvider` | Sustituible por Postmark/SES |
| Almacenamiento | Cloudflare R2 (S3 compatible) | Imágenes, audio y PDF; URLs firmadas |
| Pagos | Stripe Checkout tras `PaymentProvider` | **Desactivado por defecto** |
| Rate limiting | Upstash Redis + `@upstash/ratelimit` | Distribuido entre funciones |
| Analítica | Plausible o Umami | Sin cookies, sin huella digital, datos agregados |
| Errores | Sentry | Limpieza de PII antes de enviar |
| Pruebas | Vitest + Playwright + axe-core | Unitarias, integración, E2E y accesibilidad |
| CI/CD | GitHub Actions + Vercel | Rama protegida, *preview deployments* |
| DNS/WAF | Cloudflare | Turnstile para formularios de riesgo |

Las versiones concretas se verificarán con `npm view` en la Fase 1 y se fijarán en el
repositorio. Este documento no inventa números de versión.

---

## 2. Estructura del repositorio

```text
src/
├── app/
│   ├── [locale]/
│   │   ├── (public)/
│   │   │   ├── page.tsx                    # portada
│   │   │   ├── ultimas/
│   │   │   ├── noticias/[slug]/
│   │   │   ├── [section]/                  # nacional, internacional, cultura…
│   │   │   ├── radio/
│   │   │   ├── edicion-impresa/
│   │   │   ├── archivo/
│   │   │   ├── buscar/
│   │   │   ├── autor/[slug]/
│   │   │   ├── etiqueta/[slug]/
│   │   │   ├── suscripcion/
│   │   │   ├── donar/ y donar/gracias/
│   │   │   ├── acerca/ equipo/ contacto/
│   │   │   └── (legal)/…
│   │   └── (admin)/admin/…                 # no localizado
│   └── api/
│       ├── auth/[...all]/
│       ├── uploads/
│       ├── comments/
│       ├── newsletter/
│       ├── donations/webhook/
│       ├── revalidate/
│       └── health/
├── modules/
│   ├── articles/        { domain, application, infrastructure, ui }
│   ├── authors/
│   ├── categories/
│   ├── translations/
│   ├── media/
│   ├── users/
│   ├── newsletter/
│   ├── radio/
│   ├── print-editions/
│   ├── comments/
│   ├── donations/
│   ├── advertising/
│   ├── analytics/
│   └── pages/           # páginas institucionales
├── lib/
│   ├── auth/            # configuración, sesión, permisos
│   ├── database/        # cliente Prisma, transacciones
│   ├── security/        # CSP, sanitización, rate limit, hash
│   ├── storage/         # adaptador S3/R2, URLs firmadas
│   ├── email/           # adaptador de correo y plantillas
│   ├── validation/      # esquemas Zod compartidos
│   ├── seo/             # metadatos, JSON-LD, sitemap
│   ├── i18n/            # configuración de locales
│   └── analytics/       # agregación sin PII
├── components/
│   ├── layout/ editorial/ articles/ media/ forms/ audio/ comments/
│   └── newsletter/ ui/
├── styles/
├── types/
└── tests/
    ├── unit/ integration/ e2e/ security/ accessibility/
prisma/
├── schema.prisma
└── migrations/
docs/
```

### Reglas de dependencia
- `app/` solo compone; no contiene lógica de negocio.
- Cada módulo expone una API pública en `modules/<x>/index.ts`.
- Un módulo no importa archivos internos de otro.
- `lib/` no depende de `modules/`.
- El dominio no conoce Prisma, HTTP ni React.

---

## 3. Estrategia de renderizado y caché

| Tipo de página | Estrategia |
|---|---|
| Portada, secciones, artículo, autor, etiqueta | Estático/ISR con revalidación por etiqueta al publicar |
| Archivo y ediciones impresas | ISR con revalidación diaria y al publicar |
| Búsqueda | Render en servidor por petición, sin caché de resultados personalizados |
| Comentarios | Componente cliente; el HTML inicial incluye los aprobados |
| Administración | Dinámico, `no-store`, protegido por sesión |
| RSS y sitemap | Generados desde base de datos, revalidados al publicar |

- `revalidateTag('article:<id>')`, `revalidateTag('section:<slug>')` y
  `revalidateTag('home')` al publicar, despublicar o traducir.
- Las páginas públicas no leen cookies ni cabeceras que impidan la caché.
- Los artículos programados se publican con una tarea de Vercel Cron (cada 5 minutos en
  plan Pro) o con comprobación perezosa al recibir tráfico; se documentará la elección.
- Se evitará `dynamic = 'force-dynamic'` salvo en administración y formularios.

---

## 4. Flujo de publicación

```text
Periodista crea/edita
   └─ guarda borrador + revisión (snapshot JSON)
        └─ envía a revisión (IN_REVIEW)
             └─ editor revisa (APPROVED)
                  └─ editor jefe programa o publica (SCHEDULED/PUBLISHED)
                       ├─ transacción: estado + publishedAt + traducción
                       ├─ auditoría: actor, acción, entidad, diff resumido
                       ├─ revalidación de caché por etiqueta
                       └─ encolado de correo solo si es boletín (nunca automático)
```

Ninguna publicación envía correos ni notificaciones masivas automáticamente.

---

## 5. Adaptadores e integraciones

### Correo
```ts
interface EmailProvider {
  send(message: OutgoingEmail): Promise<SendResult>;
  verifyDomain(): Promise<DomainStatus>;
}
```
- Implementación inicial: Resend.
- Alternativas documentadas: Postmark (mejor entregabilidad transaccional), Amazon SES
  (coste menor, más configuración), Mailgun.
- El dominio de envío se configura con SPF, DKIM y DMARC. Sin verificación, no se envía.

### Almacenamiento
```ts
interface StorageProvider {
  createUploadUrl(input: UploadRequest): Promise<SignedUpload>;
  createDownloadUrl(key: string, ttlSeconds: number): Promise<string>;
  delete(key: string): Promise<void>;
  stat(key: string): Promise<ObjectMetadata>;
}
```
- R2 con dominio propio (`cdn.<dominio>`) para servir medios.
- *Uploads* directos del navegador a R2 con URL prefirmada; el servidor valida tipo real,
  tamaño y checksum antes de registrar el activo.
- Imágenes procesadas con `sharp`: eliminación de EXIF, orientación, variantes 400/800/
  1200/1600/2000 px en AVIF y WebP, más JPEG de respaldo.
- Audio en MP3 (y AAC/OGG opcional) con soporte de `Range` para reproducción y avance.
- PDF servidos con `Content-Disposition` y `X-Content-Type-Options: nosniff`.

### Pagos
- Interfaz `PaymentProvider` con `createCheckout`, `verifyWebhook`, `refund`.
- Webhooks verificados por firma, idempotencia por `event.id` y transacción atómica.
- **No se activa ningún proveedor hasta validar país, moneda, requisitos y legalidad.**

### Analítica
- Eventos agregados en servidor: ruta, idioma, tipo de dispositivo, referente agrupado,
  fecha. Sin IP completa, sin cookies, sin *fingerprinting*.
- Se separan métricas editoriales, técnicas y de marketing.
- Retención y agregación definidas en el plan de seguridad.

---

## 6. Entornos

| Entorno | Rama | Base de datos | Almacenamiento | Correo |
|---|---|---|---|---|
| Local | local | PostgreSQL local/Docker | R2 *bucket* de desarrollo | Captura local (Mailpit) |
| Preview | Pull request | Rama Neon efímera | Prefijo `preview/` | Proveedor de pruebas |
| Producción | `main` protegida | Neon producción | Bucket producción | Dominio verificado |

- Variables de entorno separadas por entorno; secretos solo en Vercel/GitHub.
- Nunca se usan datos reales de suscriptores en *preview*.
- Migraciones aplicadas en CI antes del despliegue, con revisión previa.
- *Feature flags* en base de datos para activar módulos (donaciones, publicidad, radio).

---

## 7. CI/CD

En cada *pull request*:
1. `typecheck`, `lint`, `test:unit`.
2. `prisma validate` y comprobación de migraciones.
3. `test:e2e` contra *preview* con base de datos efímera.
4. `axe` en páginas clave (portada, artículo, formularios).
5. Análisis de dependencias (`npm audit`, Dependabot).
6. Revisión obligatoria de al menos una persona.

En `main`: despliegue a producción solo tras CI verde y aprobación. Sin despliegues
manuales desde local.

---

## 8. Observabilidad

- **Sentry** para errores de servidor y cliente, con `beforeSend` que elimina correos,
  tokens y cuerpos de formulario.
- **Vercel Analytics** solo para métricas técnicas agregadas (si se acepta su modelo de
  privacidad); en su defecto, métricas propias de latencia.
- Registros estructurados con `requestId`, ruta, duración y código; **sin** IP completa,
  sin cookies, sin contenido de artículos privados.
- Alertas: errores 5xx, fallos de publicación programada, rebotes de correo, fallos de
  webhook, uso de almacenamiento.

---

## 9. Decisiones aplazadas (con criterio)

| Tema | Decisión inicial | Cuándo se revisa |
|---|---|---|
| Búsqueda externa | PostgreSQL `tsvector` (español/inglés) | Si el archivo supera ~50.000 artículos |
| CDN de imágenes | R2 + dominio propio | Si se necesita transformación en el edge |
| Editor | TipTap con esquema restringido | Si el equipo pide funciones avanzadas |
| Traducción automática | No se publica sin revisión | Si se contrata servicio externo |
| App móvil | No en el alcance inicial | Tras validar PWA y uso real |
| Comentarios con cuenta | Opcional; nombre/seudónimo primero | Según moderación y abuso |
| Podcast RSS | Sí, desde la Fase 5 | — |

---

## 10. Riesgos técnicos conocidos

1. **Latencia hacia Cuba:** la conectividad es limitada. Se prioriza HTML estático, CDN y
   mínimo JavaScript; las imágenes se sirven en tamaños pequeños.
2. **Límites de Vercel:** duración de funciones y tamaño de respuesta. Los archivos grandes
   nunca pasan por la función; van directos a R2.
3. **Correo transaccional:** la entregabilidad depende del dominio y del proveedor; se
   medirá con rebotes y quejas desde el primer envío.
4. **Dependencia de un proveedor:** todos los servicios críticos quedan detrás de
   adaptadores y con exportación documentada.
5. **Costes variables:** el tráfico y el almacenamiento de audio pueden crecer; se
   configuran alertas de presupuesto.
