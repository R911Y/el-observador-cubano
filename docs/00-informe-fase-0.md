# FASE 0 — Informe de investigación y planificación

**Proyecto:** El Observador Cubano — plataforma periodística multilingüe
**Fecha del informe:** 2 de noviembre de 2026
**Estado:** Fase 0 completada y aprobada. La Fase 1 (fundación) está implementada y verificada en
local; el despliegue y los flujos con base de datos siguen pendientes. Ver
[`docs/13-fase-1-fundacion.md`](docs/13-fase-1-fundacion.md).

---

## 1. Resumen ejecutivo

1. El repositorio de trabajo estaba **vacío**: no hay código previo, ni `git` inicializado,
   ni configuración que preservar. Esta fase parte de cero y no ha modificado ningún
   sistema en producción.
2. El sitio actual es un blog de Blogger con plantilla predeterminada («Indie», variante
   `indie_light`), alojado en un subdominio `blogspot.com`. No hay dominio propio, ni
   control de servidor, cabeceras, redirecciones o certificados.
3. Se inventariaron **48 URLs públicas**: **34 entradas** y **14 páginas**, con
   **20.205 palabras** y **50 imágenes**, publicadas entre el **21 de enero y el 29 de
   octubre de 2026**. Es un corpus pequeño y reciente: la migración es de bajo riesgo
   técnico, pero requiere decisiones editoriales.
4. **Once de las catorce «páginas» son en realidad noticias**, no páginas institucionales.
   El tipo de contenido se está usando de forma incorrecta; el importador deberá
   reclasificarlas.
5. La taxonomía es incompleta: solo **9 de las 34 entradas** tienen etiqueta (16
   asignaciones en total) y existen **5 etiquetas distintas** (`CUBA`, `ESTADOS UNIDOS`,
   `OPOSITORES CUBANOS`, `VIDAS`, `HOMOFÓBIA EN CUBA`), mientras el menú lateral muestra
   **13 títulos de sección** sin etiqueta equivalente. Las categorías definitivas deben
   definirse editorialmente antes de migrar.
6. El feed atribuye todas las entradas a un único autor («El Observador CUBANO»).
   Solo **4 textos** llevan firma visible en el cuerpo (`Emialuz`, `Rubén (seudónimo)`,
   `Zami`, `Zeiber`). El modelo de autores debe reconstruirse con el equipo.
7. El SEO técnico es débil: `canonical` vacío, `meta description` ausente, `og:description`
   vacío, sin `hreflang`, sin migas de pan y datos estructurados que declaran como editor a
   **Blogger** y como autor al nombre del blog. Las 14 páginas **no aparecen en el
   sitemap**.
8. Accesibilidad de la muestra analizada: las 4 imágenes de un artículo no tienen texto
   alternativo, hay 5 enlaces sin texto discernible y el buscador no tiene etiqueta.
9. **No existe archivo de radio ni podcast** en los contenidos publicados (0 referencias a
   audio). La sección de radio necesitará material del propietario; no se puede inventar.
10. La edición impresa se distribuye mediante **un PDF alojado en Google Drive**, sin
    visor integrado, sin metadatos de tamaño ni validación. Se identifican una edición
    (`OCTUBRE 2026`) y una página `PAPELÓGRAFO` que también enlaza a Drive.
11. El canal de WhatsApp es accesible solo como ficha pública: nombre, descripción y
    **36 seguidores** en el momento de la consulta. **No es posible leer el historial de
    mensajes sin sesión**, por lo que no se ha inventariado su contenido.
12. La plataforma propuesta se puede construir con el stack solicitado sin dependencias
    exóticas. La recomendación es Next.js (App Router) + PostgreSQL + Prisma + Better Auth,
    con Vercel, Neon y Cloudflare R2, y proveedores externos detrás de adaptadores.

---

## 2. Alcance real de esta fase

| Tarea solicitada | Resultado |
|---|---|
| Examinar el Blogspot | Hecho: portada, artículo, «Nosotros», edición impresa, sitemap y feeds completos |
| Analizar identidad, estructura, categorías, artículos, autores, imágenes y navegación | Hecho, con las limitaciones de autoría y taxonomía indicadas |
| Examinar el canal de WhatsApp | Parcial: ficha pública verificada; historial no accesible sin sesión |
| Identidad que debe conservarse | Nombre, lema, tono comunitario, independencia, paleta rojo/carbón/blanco |
| Necesidades de migración | Documentadas en el plan de migración |
| Problemas de experiencia de usuario | Detectados y priorizados |
| Inventario de contenido | 48 elementos, con métricas por elemento |
| Propuesta de arquitectura y diseño | Documentos 04 y 07, listos para aprobación |

---

## 3. Hallazgos que condicionan el diseño

### 3.1 Contenido
- Volumen bajo (20.205 palabras). No se requiere un motor de búsqueda externo al principio:
  PostgreSQL con búsqueda de texto completo en español e inglés es suficiente.
- Hay contenido de **opinión** (`Contra el espejismo…`, `Dictadura y bien`) y **comunicados**
  de terceros (`Cuba Crece Contigo`) mezclados con noticias. Deben separarse por tipo y
  etiquetarse como tales para no confundir información con opinión.
- Dos artículos incluyen enlaces a **Airtable** con listados nominales de fallecidos y a
  **Facebook/X**. Son datos sensibles de terceros: deben revisarse antes de republicar y
  no incrustarse automáticamente.
- El texto «Papelógrafo» y la edición impresa funcionan como páginas, no como colecciones.

### 3.2 Autoría y derechos
- No hay biografías de autores, ni identificadores estables, ni avatares.
- Hay seudónimos declarados (`Rubén (seudónimo)`). El sistema debe admitir seudónimos y
  ocultar correos y datos privados.
- No se puede asumir que las imágenes sean propias: hay que registrar procedencia, crédito
  y licencia de cada una antes de migrarla.

### 3.3 Operación
- El equipo publica desde Blogger sin flujo de revisión ni versiones. El CMS debe introducir
  el flujo `DRAFT → IN_REVIEW → APPROVED → SCHEDULED → PUBLISHED → ARCHIVED` sin volverlo
  burocrático para un equipo pequeño.
- La moderación de comentarios hoy es de Blogger y no hay política pública de moderación.

---

## 4. Arquitectura recomendada (resumen)

```text
Navegador
  │
  ├── Vercel Edge/CDN ──► Next.js App Router (RSC + ISR + revalidación por etiqueta)
  │                          │
  │                          ├── PostgreSQL (Neon) vía Prisma
  │                          ├── Cloudflare R2 (imágenes, audio, PDF) con URLs firmadas
  │                          ├── Resend (correo)            ┐
  │                          ├── Pasarela de pago (apagada)  ├─ adaptadores sustituibles
  │                          ├── Upstash Redis (rate limit)  ┘
  │                          └── Analítica agregada sin cookies
  │
  └── Cloudflare (DNS, WAF, Turnstile)
```

Decisiones clave:

- **Monolito modular por dominios**, no microservicios. Un solo despliegue, límites internos
  explícitos y adaptadores para correo, almacenamiento, pagos y analítica.
- **Contenido renderizado en servidor**; JavaScript de cliente solo para editor, comentarios,
  reproductor y formularios.
- **Traducciones como entidades propias**, no como cadenas sueltas de interfaz.
- **Imágenes y audio fuera de PostgreSQL** y fuera del servidor de aplicación.
- **Todo permiso se comprueba en el servidor**; la ocultación de botones es solo estética.

Detalle completo en [04 · Arquitectura técnica](04-arquitectura-tecnica.md).

---

## 5. Decisiones que se proponen (requieren aprobación)

| # | Decisión | Recomendación | Coste/impacto |
|---|---|---|---|
| D1 | Dominio | `observadorcubano.com` como principal y `.org` defensivo, registrados en Cloudflare | ~USD 10–15/año cada uno |
| D2 | Alojamiento | Vercel Pro + Neon PostgreSQL + Cloudflare R2 | ~USD 40–70/mes |
| D3 | Correo | Resend con dominio de envío propio; adaptador para cambiar de proveedor | 0–20 USD/mes |
| D4 | Pagos | **Módulo construido pero desactivado** hasta verificar entidad, país y cumplimiento | 0 hasta activar |
| D5 | Analítica | Sin cookies ni huella digital; datos agregados (Plausible/Umami) | 0–19 USD/mes |
| D6 | Comentarios | Moderación previa activada por defecto; sin HTML | Solo moderación |
| D7 | Idiomas | Español por defecto; inglés con revisión humana obligatoria | Esfuerzo editorial |
| D8 | Marca | Conservar nombre y lema; identidad gráfica nueva y original | Diseño interno |

Todas las decisiones y sus alternativas están razonadas en
[12 · Riesgos y preguntas](12-riesgos-y-preguntas.md).

---

## 6. Bloqueos y datos que faltan

Sin estos datos no se puede cerrar la Fase 1 ni la migración:

1. **Exportación XML de Blogger** (Configuración → Copia de seguridad del contenido). Es la
   fuente canónica para migrar; el feed público no incluye todos los metadatos internos.
2. **Exportación o selección del contenido de WhatsApp** que se quiera republicar.
   No se extraerá mediante métodos no autorizados.
3. **Archivos de audio** de radio (programas, portadas, presentadores, fechas) o confirmación
   de que la sección se lanzará vacía.
4. **PDF de ediciones impresas** anteriores y autorización para rehostarlos.
5. **Logotipo y materiales gráficos** existentes, si los hay, y confirmación de derechos.
6. **País y entidad legal** que contratará servicios y, en su caso, recibirá donaciones.
7. **Personas y roles** del equipo editorial (quién es `OWNER`, quién aprueba, quién traduce).
8. **Revisión jurídica** de textos legales y de la viabilidad de donaciones/publicidad.

---

## 7. Estimación preliminar

Con **1 desarrollador senior a tiempo completo**, **diseño/UX a tiempo parcial** y
**editorial a tiempo parcial**:

| Hito | Duración estimada |
|---|---|
| Fase 1 — Fundación | 2 semanas |
| Fase 2 — Portal editorial | 3 semanas |
| Fase 3 — CMS y permisos | 4 semanas |
| Fase 4 — Distribución | 2 semanas |
| Fase 5 — Multimedia | 2 semanas |
| Fase 6 — Participación y financiación | 3 semanas |
| Fase 7 — Seguridad y calidad | 2 semanas |
| Fase 8 — Migración y lanzamiento | 2 semanas |
| **Total** | **≈ 20 semanas (5 meses)** |

Un **MVP publicable** (Fases 1–3) estaría listo en **≈ 9–10 semanas**, con newsletter y
migración inicial a continuación. Son estimaciones, no compromisos: dependen de la
disponibilidad de contenidos, decisiones editoriales y revisión legal.

Coste recurrente estimado en régimen estable: **USD 55–140/mes** (detalle en
[11 · Costes](11-costes-servicios.md)).

---

## 8. Criterio de salida de la Fase 0

La Fase 0 se considera cerrada cuando el propietario:

1. Aprueba la arquitectura y el enfoque visual.
2. Resuelve o acepta las decisiones D1–D8.
3. Aporta el XML de Blogger y confirma qué contenidos de WhatsApp y radio se migrarán.
4. Autoriza la compra del dominio y la creación de cuentas de servicio (sin compras todavía).
5. Designa al equipo y sus roles.

**Siguiente paso propuesto:** revisar este informe y responder a las preguntas de
[12 · Riesgos y preguntas](12-riesgos-y-preguntas.md). Con esa respuesta se inicia la
**Fase 1 (Fundación)**.

---

## 9. Trazabilidad

| Comprobación | Método | Fecha |
|---|---|---|
| Portada, artículo, «Nosotros», edición impresa | Descarga HTTP y lectura del HTML | 2026-11-02 |
| Inventario de 48 elementos | Feed Atom/JSON público de Blogger (`max-results=500`) | 2026-11-02 |
| Sitemap | `sitemap.xml` | 2026-11-02 |
| Cabeceras HTTP | Petición directa a producción | 2026-11-02 |
| Canal de WhatsApp | Página pública del canal | 2026-11-02 |
| Repositorio local | Inspección del directorio de trabajo | 2026-11-02 |

No se han usado datos de audiencia, ingresos ni plantilla del medio: no fueron
proporcionados y no se han inventado.
