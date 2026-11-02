# El Observador Cubano — Plataforma editorial

**Periodismo desde las comunidades**

Repositorio de la futura sede digital de *El Observador Cubano*.

## Estado actual

**FASE 0 — Investigación y planificación (en revisión).**

Todavía no se ha escrito código de la plataforma. Esta fase produce el diagnóstico de las
fuentes actuales (Blogger y WhatsApp), el inventario real de contenidos, la arquitectura
propuesta, el modelo de datos, el mapa de páginas, la propuesta visual, los planes de
seguridad, migración y desarrollo, y la estimación de costes.

La Fase 1 no comienza hasta que el propietario apruebe el paquete y resuelva las decisiones
pendientes listadas en [`docs/00-informe-fase-0.md`](docs/00-informe-fase-0.md).

## Entregables de la Fase 0

| Documento | Contenido |
|-----------|-----------|
| [00 · Informe de fase](docs/00-informe-fase-0.md) | Resumen ejecutivo, hallazgos, decisiones y puerta de aprobación |
| [01 · Análisis de Blogspot](docs/01-analisis-blogspot.md) | Identidad, estructura, SEO, rendimiento, accesibilidad y problemas detectados |
| [02 · Análisis de WhatsApp](docs/02-analisis-whatsapp.md) | Qué se pudo verificar del canal y qué falta |
| [03 · Inventario de contenidos](docs/03-inventario-contenidos.md) | 34 entradas y 14 páginas analizadas; tipos, etiquetas, autores y activos |
| [04 · Arquitectura técnica](docs/04-arquitectura-tecnica.md) | Stack, módulos, integraciones, entornos y decisiones |
| [05 · Modelo de datos](docs/05-modelo-datos.md) | Borrador Prisma, entidades, relaciones y reglas |
| [06 · Mapa de páginas](docs/06-mapa-paginas.md) | Rutas públicas, administración, API y estrategia de renderizado |
| [07 · Propuesta visual](docs/07-propuesta-visual.md) | Identidad, paleta validada, tipografía, componentes y plantillas |
| [08 · Plan de seguridad](docs/08-plan-seguridad.md) | Modelo de amenazas, controles, cabeceras, retención e incidentes |
| [09 · Plan de migración](docs/09-plan-migracion.md) | Importación de Blogger, imágenes, PDF, redirecciones y verificación |
| [10 · Plan de desarrollo](docs/10-plan-desarrollo.md) | Fases, hitos, pruebas y criterios de aceptación |
| [11 · Costes y servicios](docs/11-costes-servicios.md) | Estimación de servicios recurrentes y costes únicos |
| [12 · Riesgos y preguntas](docs/12-riesgos-y-preguntas.md) | Riesgos, bloqueos y datos que debe aportar el propietario |

Datos tabulares: [`docs/data/inventario-contenidos.csv`](docs/data/inventario-contenidos.csv)
y versión legible en [`docs/data/inventario-contenidos.md`](docs/data/inventario-contenidos.md).

## Fuentes analizadas

- `https://observadorcubano.blogspot.com/` — portada, artículo de muestra, «Nosotros»,
  edición impresa y *feeds* públicos de entradas y páginas (consultados el 2026-11-02).
- `https://observadorcubano.blogspot.com/sitemap.xml`.
- `https://whatsapp.com/channel/0029Vb73VkN7tkj5MlScKL1k` — ficha pública del canal.

Las limitaciones de cada fuente están documentadas en los informes correspondientes.
No se ha simulado ninguna comprobación que no se haya podido realizar.

## Principios del proyecto

- Independencia editorial y control de la infraestructura por parte del medio.
- Privacidad por defecto y minimización de datos.
- Seguridad y protección de fuentes desde el diseño.
- Accesibilidad WCAG 2.2 AA como requisito, no como extra.
- Rendimiento en conexiones móviles lentas.
- Multilingüismo real (español/inglés) con revisión humana.
- Portabilidad: contenido y suscriptores exportables en todo momento.

## Licencia y materiales

El código se alojará en un repositorio privado. Las fotografías, marcas y materiales de
terceros no se reutilizarán sin autorización expresa. El logotipo tipográfico propuesto en
la Fase 0 es provisional y original.
