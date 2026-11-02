# 10 · Plan de desarrollo

**Duración estimada:** 20 semanas (5 meses) hasta el lanzamiento, con 1 desarrollador
senior a tiempo completo, diseño/UX parcial y editorial parcial.
**MVP publicable:** Fases 1–3 (≈ 9–10 semanas).

Las duraciones son estimaciones para planificación. Se revisan al final de cada fase.

---

## 1. Equipo mínimo

| Rol | Dedicación | Responsabilidad |
|---|---|---|
| Desarrollo full-stack senior | 1,0 | Arquitectura, implementación, pruebas, despliegue |
| Diseño UX/UI | 0,3–0,5 | Sistema de diseño, plantillas, accesibilidad visual |
| Editor jefe / propietario | 0,3 | Decisiones editoriales, taxonomía, aprobación |
| Redacción | 0,3 | Migración, revisión de textos, autores |
| Traducción al inglés | 0,2 | Traducciones revisadas |
| Revisión legal externa | Puntual | Textos legales, donaciones, privacidad |
| Auditoría de seguridad | Puntual | Revisión antes del lanzamiento |

Una sola persona puede cubrir varios roles, pero **no se deben eliminar las revisiones
independientes** de seguridad y legal.

---

## 2. Fases

### Fase 1 — Fundación (2 semanas)

Entregables:
- Repositorio privado, rama `main` protegida, plantilla de PR y CI.
- Next.js + TypeScript estricto + Tailwind + primitivas Radix.
- Design tokens y componentes base (botón, campo, enlace, tipografía, layout).
- PostgreSQL + Prisma + primera migración.
- Better Auth: registro interno, inicio de sesión, sesiones, MFA para roles privilegiados.
- RBAC base y comprobación en servidor.
- Entorno local, *preview* y producción de pruebas.
- Dominio de pruebas y HTTPS.
- Documentación: `ARCHITECTURE.md`, `SECURITY.md`, `DEPLOYMENT.md`.

Criterio de salida: un usuario `OWNER` crea otro usuario, ambos inician sesión con MFA y
los permisos se verifican con pruebas automatizadas.

### Fase 2 — Portal editorial (3 semanas)

Entregables:
- Modelo de artículos, traducciones, categorías, etiquetas y autores.
- Portada, últimas, secciones, artículo, autor, etiqueta y búsqueda.
- Navegación de escritorio y móvil.
- SEO: metadatos, canonical, `hreflang`, sitemap, RSS, JSON-LD, 404.
- Imágenes optimizadas y `alt` obligatorio.
- Accesibilidad AA en las plantillas clave.
- Pruebas unitarias y E2E de lectura.

Criterio de salida: 10 artículos de prueba publicados y navegables en español e inglés,
con Lighthouse móvil ≥ 90 en rendimiento, accesibilidad y SEO (medido en condiciones
representativas, no solo en local).

### Fase 3 — CMS (4 semanas)

Entregables:
- Editor TipTap con esquema restringido.
- Crear, editar, previsualizar, programar, publicar y archivar.
- Flujo de estados y cola de revisión.
- Historial de versiones y comparación.
- Traducciones con estado y responsable.
- Medios: subida directa, EXIF, variantes, crédito y licencia.
- Páginas institucionales y legales con aviso de borrador.
- Auditoría de acciones.
- Permisos por rol probados en servidor.

Criterio de salida: un periodista crea un borrador, un editor lo revisa, el editor jefe lo
publica y la portada se revalida sin intervención manual. Un periodista **no** puede
publicar ni administrar usuarios.

### Fase 4 — Distribución (2 semanas)

Entregables:
- Newsletter con doble confirmación, baja y preferencias.
- Plantillas de correo accesibles y adaptables.
- SPF, DKIM y DMARC configurados y verificados.
- Gestión de rebotes y quejas.
- Panel de suscriptores y exportación autorizada.
- Boletines: crear, previsualizar, probar, programar y enviar.
- Analítica agregada sin cookies.
- RSS por sección y sitemap completo.

Criterio de salida: alta → correo de confirmación → confirmación → envío de prueba → baja,
con tokens de un solo uso y pruebas de reutilización.

### Fase 5 — Multimedia (2 semanas)

Entregables:
- Radio: programas, episodios, reproductor accesible, archivo y RSS de podcast.
- Edición impresa: carga de PDF, metadatos, visor y descarga.
- Validación y análisis de PDF; límites de tamaño.
- Optimización de audio y soporte de `Range`.

Criterio de salida: un episodio real y una edición real se reproducen/descargan en Android,
iOS y escritorio, sin autoplay.

### Fase 6 — Participación y financiación (3 semanas)

Entregables:
- Comentarios con nombre/seudónimo, respuestas, denuncias y moderación.
- Rate limiting, antispam, validación y protección XSS.
- Bloqueo temporal de usuarios abusivos.
- Donaciones: módulo con proveedor autorizado o **desactivado y documentado**.
- Webhooks con firma e idempotencia.
- Publicidad: creatividades de imagen, ubicaciones, campañas y métricas agregadas.
- Sin JavaScript arbitrario desde el panel.

Criterio de salida: un comentario malicioso se rechaza; un pago duplicado no se procesa dos
veces; un anuncio no puede ejecutar scripts.

### Fase 7 — Seguridad y calidad (2 semanas)

Entregables:
- Revisión ASVS nivel 2.
- Pruebas negativas completas.
- Auditoría de accesibilidad con axe y lector de pantalla.
- Medición de Core Web Vitals en móvil.
- Copias de seguridad y restauración probada.
- Análisis de dependencias y prueba de penetración.
- Corrección de hallazgos.

Criterio de salida: no quedan hallazgos críticos ni altos sin mitigar; la restauración de
una copia se ha demostrado.

### Fase 8 — Migración y lanzamiento (2 semanas)

Entregables:
- Importación de Blogger aprobada.
- Redirecciones y verificación de enlaces.
- Dominio, DNS, correo y certificados.
- Contenido legal revisado.
- Manual de usuario y de operación.
- Plan de respuesta a incidentes.
- Lanzamiento controlado y monitorización.

Criterio de salida: los 17 criterios de aceptación del encargo se cumplen y están
documentados con evidencia.

---

## 3. Flujo de trabajo

- Ramas cortas por funcionalidad; PR pequeño y descriptivo.
- `main` protegida: CI verde + revisión + sin conflictos.
- Cada PR incluye: qué cambia, por qué, cómo se probó, capturas si aplica, riesgos.
- Migraciones de base de datos revisadas por una segunda persona.
- *Preview deployment* por PR; datos de prueba, nunca datos reales.
- *Feature flags* para módulos incompletos; nada a medio hacer en producción.
- Registro de decisiones técnicas (`docs/decisions/ADR-*.md`) para cambios estructurales.
- Sin `--force` en git, sin secretos en el repositorio, sin desactivar controles.

---

## 4. Estrategia de pruebas

| Nivel | Herramienta | Qué cubre |
|---|---|---|
| Unitaria | Vitest | Reglas de dominio, validaciones, utilidades, permisos |
| Integración | Vitest + base de datos efímera | Repositorios, transacciones, webhooks, correo simulado |
| E2E | Playwright | Flujos completos en escritorio y móvil |
| Accesibilidad | axe-core + revisión manual | Plantillas y formularios |
| Seguridad | Pruebas negativas + escaneo | Autorización, XSS, CSRF, rate limit, uploads |
| Rendimiento | Lighthouse + WebPageTest | Core Web Vitals en móvil lento |
| SEO | Pruebas de metadatos y rastreo | Canonical, hreflang, sitemap, JSON-LD |

### Casos negativos obligatorios

1. Un `JOURNALIST` intenta publicar → 403 y registro de auditoría.
2. Un `JOURNALIST` intenta administrar usuarios → 403.
3. Un visitante intenta abrir `/admin` → redirección segura, sin filtrar datos.
4. Comentario con `<script>` o `javascript:` → rechazado o escapado.
5. Subida de `.exe` renombrado a `.jpg` → rechazada por *magic bytes*.
6. Envío repetido del formulario → limitado y sin duplicados.
7. Enlace de confirmación reutilizado → rechazado.
8. Webhook de pago duplicado → una sola transacción.
9. Token de sesión revocado → acceso denegado.
10. Solicitud de exportación sin permiso → 403.
11. PDF con JavaScript embebido → rechazado.
12. Enlace externo malicioso en artículo → validado y bloqueado.

No se simulan resultados: cada prueba se ejecuta y se guarda su salida.

---

## 5. Definición de «terminado»

Una funcionalidad está terminada cuando:

- Cumple los criterios de aceptación escritos.
- Tiene pruebas automatizadas que pasan en CI.
- La autorización se comprueba en servidor.
- Es accesible por teclado y con lector de pantalla.
- Funciona en móvil y escritorio.
- Tiene estados de error, vacío y carga.
- Está documentada para el equipo editorial.
- No introduce dependencias innecesarias ni secretos.
- Se ha revisado visualmente en *preview*.

**Una pantalla sin lógica real no está terminada.**

---

## 6. Calendario

| Semana | Fase | Hito |
|---|---|---|
| 1–2 | F1 | Fundación y autenticación |
| 3–5 | F2 | Portal público |
| 6–9 | F3 | CMS y flujo editorial |
| 10–11 | F4 | Newsletter y analítica |
| 12–13 | F5 | Radio y hemeroteca |
| 14–16 | F6 | Comentarios, donaciones y publicidad |
| 17–18 | F7 | Auditoría y correcciones |
| 19–20 | F8 | Migración y lanzamiento |

Solapamientos posibles: diseño y contenidos avanzan en paralelo; la migración puede
prepararse desde la semana 10, pero no ejecutarse hasta que el CMS esté estable.

---

## 7. Dependencias críticas

- Dominio adquirido y DNS accesible (semana 1).
- Cuentas de Vercel, Neon, R2, correo y GitHub (semana 1).
- XML de Blogger y materiales (semana 1–2).
- Decisiones de taxonomía y autores (semana 3).
- Textos legales revisados (semana 15).
- Proveedor de pagos definido o decisión de dejar el módulo desactivado (semana 12).
- Contenido real de radio y PDF (semana 12).
- Revisión de seguridad externa agendada (semana 17).

Un retraso en cualquiera de estas dependencias desplaza el hito correspondiente.

---

## 8. Riesgos de ejecución

| Riesgo | Mitigación |
|---|---|
| Una sola persona desarrolla | Documentación continua, PR pequeños, revisión externa puntual |
| Cambios de alcance | Fases cerradas con criterios escritos; lo nuevo va a la siguiente |
| Contenido insuficiente | Bloques que se omiten; no se inventan noticias |
| Traducción lenta | Publicar español primero; inglés cuando esté aprobado |
| Proveedor de pagos no viable | Módulo desactivado y documentado; no se simula |
| Fatiga de moderación | Moderación previa + reglas claras + límites |
| Presión de lanzamiento | No se salta la Fase 7; el coste de un incidente es mayor |

---

## 9. Después del lanzamiento

- Ventana de estabilización de 4 semanas con revisión diaria de errores.
- Revisión mensual de rendimiento, accesibilidad y seguridad.
- Copias de seguridad verificadas trimestralmente.
- Actualización de dependencias cada mes, con pruebas.
- Revisión de permisos y cuentas cada trimestre.
- Encuesta breve al equipo editorial a los 30 y 90 días.
- Backlog de mejoras priorizado por uso real, no por moda.
